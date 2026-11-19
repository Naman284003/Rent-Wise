import { Complaint } from '../models/Complaint.js';
import { TenantAssignment } from '../models/TenantAssignment.js';

// @desc    Get maintenance complaints
// @route   GET /api/complaints
export const getComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, propertyId } = req.query;

    const filter = {};

    if (req.user.role === 'landlord') {
      filter.landlord = req.user._id;
    } else if (req.user.role === 'tenant') {
      filter.tenant = req.user._id;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (propertyId && propertyId !== 'all') {
      filter.property = propertyId;
    }

    const complaints = await Complaint.find(filter)
      .populate('tenant', 'name email phone avatar')
      .populate('property', 'name address city')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create complaint (Tenant only)
// @route   POST /api/complaints
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
    }

    // Look up tenant's active lease to determine property and room
    const activeAssignment = await TenantAssignment.findOne({
      tenant: req.user._id,
      status: 'active',
    });

    if (!activeAssignment) {
      return res.status(400).json({
        success: false,
        message: 'You must have an active room lease assignment to lodge a maintenance complaint.',
      });
    }

    const complaint = await Complaint.create({
      tenant: req.user._id,
      landlord: activeAssignment.landlord,
      property: activeAssignment.property,
      room: activeAssignment.room,
      title: title.trim(),
      description: description.trim(),
      category: category || 'plumbing',
      priority: priority || 'medium',
      status: 'open',
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('tenant', 'name email phone')
      .populate('property', 'name')
      .populate('room', 'roomNumber');

    res.status(201).json({
      success: true,
      message: 'Maintenance complaint lodged successfully.',
      complaint: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & resolution notes (Landlord or Admin)
// @route   PATCH /api/complaints/:id/status
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint ticket not found.' });
    }

    // Landlord check
    if (req.user.role === 'landlord' && String(complaint.landlord?._id || complaint.landlord) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only update complaints for your properties.' });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date();
      }
    }
    if (resolutionNotes !== undefined) {
      updateData.resolutionNotes = resolutionNotes;
    }

    const updated = await Complaint.findByIdAndUpdate(complaint._id, updateData, { new: true })
      .populate('tenant', 'name email phone')
      .populate('property', 'name')
      .populate('room', 'roomNumber');

    res.status(200).json({
      success: true,
      message: `Complaint ticket updated to ${status || 'updated'}.`,
      complaint: updated,
    });
  } catch (error) {
    next(error);
  }
};
