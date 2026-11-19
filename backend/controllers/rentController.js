import { RentRecord } from '../models/RentRecord.js';
import { TenantAssignment } from '../models/TenantAssignment.js';
import { Payment } from '../models/Payment.js';

// @desc    Get rent records (scoped to landlord/tenant/admin)
// @route   GET /api/rent-records
export const getRentRecords = async (req, res, next) => {
  try {
    const { month, year, status, propertyId, tenantId, search } = req.query;

    const filter = {};

    if (req.user.role === 'landlord') {
      filter.landlord = req.user._id;
    } else if (req.user.role === 'tenant') {
      filter.tenant = req.user._id;
    }

    if (month && month !== 'all') {
      filter.month = Number(month);
    }
    if (year && year !== 'all') {
      filter.year = Number(year);
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

    let records = await RentRecord.find(filter)
      .populate('tenant', 'name email phone avatar')
      .populate('property', 'name address city propertyType')
      .populate('room', 'roomNumber rentAmount')
      .populate('landlord', 'name email phone')
      .sort({ year: -1, month: -1, dueDate: 1 });

    // Dynamic overdue status update check if dueDate has passed and unpaid
    const today = new Date();
    records = records.map((rec) => {
      const recObj = rec.toObject ? rec.toObject() : { ...rec };
      if (recObj.status === 'unpaid' && new Date(recObj.dueDate) < today) {
        recObj.status = 'overdue';
      }
      return recObj;
    });

    if (search) {
      const q = search.toLowerCase();
      records = records.filter((r) => {
        const tenantName = r.tenant?.name?.toLowerCase() || '';
        const propName = r.property?.name?.toLowerCase() || '';
        const roomNum = r.room?.roomNumber?.toLowerCase() || '';
        return tenantName.includes(q) || propName.includes(q) || roomNum.includes(q);
      });
    }

    // Calculate aggregated metrics
    const totalRentExpected = records.reduce((sum, r) => sum + (r.rentAmount || 0), 0);
    const totalRentCollected = records.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
    const totalRentPending = records.reduce((sum, r) => sum + (r.balanceDue || 0), 0);

    res.status(200).json({
      success: true,
      count: records.length,
      metrics: {
        totalRentExpected,
        totalRentCollected,
        totalRentPending,
      },
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single rent record by ID with payment history
// @route   GET /api/rent-records/:id
export const getRentRecordById = async (req, res, next) => {
  try {
    const record = await RentRecord.findById(req.params.id)
      .populate('tenant', 'name email phone avatar emergencyContact')
      .populate('property', 'name address city state zipCode')
      .populate('room', 'roomNumber rentAmount depositAmount')
      .populate('landlord', 'name email phone');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Rent record not found.' });
    }

    // Role security
    if (req.user.role === 'landlord' && String(record.landlord?._id || record.landlord) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to rent record.' });
    }
    if (req.user.role === 'tenant' && String(record.tenant?._id || record.tenant) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to rent record.' });
    }

    // Fetch related payments
    const payments = await Payment.find({ rentRecord: record._id })
      .populate('recordedBy', 'name role')
      .sort({ paymentDate: -1 });

    const recObj = record.toObject ? record.toObject() : { ...record };

    res.status(200).json({
      success: true,
      record: {
        ...recObj,
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate monthly rent records for active leases (Landlord or Admin)
// @route   POST /api/rent-records/generate
export const generateMonthlyRent = async (req, res, next) => {
  try {
    const { month, year } = req.body;

    const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const assignmentFilter = { status: 'active' };
    if (req.user.role === 'landlord') {
      assignmentFilter.landlord = req.user._id;
    }

    const activeAssignments = await TenantAssignment.find(assignmentFilter);

    let createdCount = 0;
    for (const assignment of activeAssignments) {
      // Check if already generated for this lease in this month/year
      const existing = await RentRecord.findOne({
        assignment: assignment._id,
        month: targetMonth,
        year: targetYear,
      });

      if (!existing) {
        const dueDate = new Date(targetYear, targetMonth - 1, assignment.rentDueDate || 1);
        const today = new Date();

        await RentRecord.create({
          assignment: assignment._id,
          tenant: assignment.tenant,
          property: assignment.property,
          room: assignment.room,
          landlord: assignment.landlord,
          month: targetMonth,
          year: targetYear,
          dueDate,
          rentAmount: assignment.monthlyRent,
          amountPaid: 0,
          balanceDue: assignment.monthlyRent,
          status: dueDate < today ? 'overdue' : 'unpaid',
          notes: `Rent cycle for ${targetMonth}/${targetYear}`,
        });
        createdCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Generated ${createdCount} rent billing record(s) for ${targetMonth}/${targetYear}.`,
      createdCount,
    });
  } catch (error) {
    next(error);
  }
};
