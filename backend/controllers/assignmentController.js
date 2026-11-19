import { TenantAssignment } from '../models/TenantAssignment.js';
import { Room } from '../models/Room.js';
import { Property } from '../models/Property.js';
import { User } from '../models/User.js';
import { RentRecord } from '../models/RentRecord.js';

// @desc    Get tenant assignments (active and past)
// @route   GET /api/assignments
export const getAssignments = async (req, res, next) => {
  try {
    const { status, propertyId, tenantId, search } = req.query;

    const filter = {};

    // Role-based scoping
    if (req.user.role === 'landlord') {
      filter.landlord = req.user._id;
    } else if (req.user.role === 'tenant') {
      filter.tenant = req.user._id;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (propertyId && propertyId !== 'all') {
      filter.property = propertyId;
    }
    if (tenantId && tenantId !== 'all') {
      filter.tenant = tenantId;
    }

    const assignments = await TenantAssignment.find(filter)
      .populate('tenant', 'name email phone avatar emergencyContact')
      .populate('property', 'name address city propertyType')
      .populate('room', 'roomNumber floor rentAmount status')
      .populate('landlord', 'name email phone')
      .sort({ createdAt: -1 });

    // Client-side search match across tenant name or property name
    let result = assignments;
    if (search) {
      const q = search.toLowerCase();
      result = assignments.filter((a) => {
        const tenantName = a.tenant?.name?.toLowerCase() || '';
        const propName = a.property?.name?.toLowerCase() || '';
        const roomNum = a.room?.roomNumber?.toLowerCase() || '';
        return tenantName.includes(q) || propName.includes(q) || roomNum.includes(q);
      });
    }

    res.status(200).json({
      success: true,
      count: result.length,
      assignments: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign tenant to available room
// @route   POST /api/assignments
export const createAssignment = async (req, res, next) => {
  try {
    const { propertyId, roomId, tenantId, leaseStart, leaseEnd, rentDueDate, monthlyRent, depositPaid, notes } = req.body;

    if (!propertyId || !roomId || !tenantId || !leaseStart || !leaseEnd || !monthlyRent) {
      return res.status(400).json({
        success: false,
        message: 'Property, room, tenant, lease dates, and monthly rent are required.',
      });
    }

    // 1. Verify property exists & check landlord ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }
    if (req.user.role === 'landlord' && String(property.landlord?._id || property.landlord) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only assign rooms in properties that you own.' });
    }

    // 2. Verify room exists and belongs to this property
    const room = await Room.findById(roomId);
    if (!room || String(room.property?._id || room.property) !== String(propertyId)) {
      return res.status(400).json({ success: false, message: 'Room does not belong to selected property.' });
    }

    // 3. CORE RULE: Prevent assigning occupied rooms
    if (room.status === 'occupied') {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is currently occupied. Please choose a vacant room or terminate the existing lease.`,
      });
    }

    // 4. Verify tenant exists and has role 'tenant'
    const tenant = await User.findById(tenantId);
    if (!tenant || tenant.role !== 'tenant') {
      return res.status(400).json({ success: false, message: 'Invalid tenant user account selected.' });
    }

    // 5. CORE RULE: Prevent duplicate active assignment for the same tenant
    const existingActiveAssignment = await TenantAssignment.findOne({
      tenant: tenantId,
      status: 'active',
    });
    if (existingActiveAssignment) {
      return res.status(400).json({
        success: false,
        message: `Tenant ${tenant.name} already has an active lease assignment. A tenant cannot have multiple active leases.`,
      });
    }

    // 6. Create Assignment
    const assignment = await TenantAssignment.create({
      property: propertyId,
      room: roomId,
      tenant: tenantId,
      landlord: property.landlord,
      leaseStart: new Date(leaseStart),
      leaseEnd: new Date(leaseEnd),
      rentDueDate: Number(rentDueDate) || 1,
      monthlyRent: Number(monthlyRent),
      depositPaid: depositPaid !== undefined ? Number(depositPaid) : 0,
      status: 'active',
      notes: notes || '',
    });

    // 7. CORE RULE: Maintain room occupancy status
    await Room.findByIdAndUpdate(roomId, { status: 'occupied' });

    // 8. Automatically generate current month's rent record so dues are tracked immediately
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();
    const dueDate = new Date(currentYear, currentMonth - 1, Number(rentDueDate) || 1);

    await RentRecord.create({
      assignment: assignment._id,
      tenant: tenantId,
      property: propertyId,
      room: roomId,
      landlord: property.landlord,
      month: currentMonth,
      year: currentYear,
      dueDate,
      rentAmount: Number(monthlyRent),
      amountPaid: 0,
      balanceDue: Number(monthlyRent),
      status: dueDate < today ? 'overdue' : 'unpaid',
      notes: 'Initial monthly rent generated on assignment creation',
    });

    const populatedAssignment = await TenantAssignment.findById(assignment._id)
      .populate('tenant', 'name email phone avatar')
      .populate('property', 'name address city propertyType')
      .populate('room', 'roomNumber rentAmount');

    res.status(201).json({
      success: true,
      message: `Tenant successfully assigned to Room ${room.roomNumber}. Room status updated to occupied.`,
      assignment: populatedAssignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Terminate active lease assignment
// @route   PATCH /api/assignments/:id/terminate
export const terminateAssignment = async (req, res, next) => {
  try {
    const assignment = await TenantAssignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Lease assignment not found.' });
    }

    // Ownership check
    if (req.user.role === 'landlord' && String(assignment.landlord?._id || assignment.landlord) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only terminate leases for your own properties.' });
    }

    if (assignment.status !== 'active') {
      return res.status(400).json({ success: false, message: `This lease is already ${assignment.status}.` });
    }

    // Terminate assignment
    const updated = await TenantAssignment.findByIdAndUpdate(
      assignment._id,
      { status: 'terminated' },
      { new: true }
    );

    // CORE RULE: Update room status back to vacant
    await Room.findByIdAndUpdate(assignment.room, { status: 'vacant' });

    res.status(200).json({
      success: true,
      message: 'Lease agreement has been terminated. Room has been restored to vacant status.',
      assignment: updated,
    });
  } catch (error) {
    next(error);
  }
};
