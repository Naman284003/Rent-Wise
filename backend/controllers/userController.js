import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { TenantAssignment } from '../models/TenantAssignment.js';

// @desc    Get all users (Admin only) with search, filter, pagination
// @route   GET /api/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, status, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      users: users.map(u => (u.toJSON ? u.toJSON() : u)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (Admin only)
// @route   PATCH /api/users/:id/toggle-status
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // Prevent deactivating oneself
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account.',
      });
    }

    const newStatus = !user.isActive;
    const updated = await User.findByIdAndUpdate(user._id, { isActive: newStatus }, { new: true });

    res.status(200).json({
      success: true,
      message: `User account has been ${newStatus ? 'activated' : 'deactivated'}.`,
      user: updated.toJSON ? updated.toJSON() : updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tenant directory for assignment (Landlord or Admin)
// @route   GET /api/users/tenants
export const getTenants = async (req, res, next) => {
  try {
    const { availableOnly } = req.query;

    // Get all tenants
    const tenants = await User.find({ role: 'tenant', isActive: true });

    if (availableOnly === 'true') {
      // Find tenants who currently have an active lease assignment
      const activeAssignments = await TenantAssignment.find({ status: 'active' });
      const busyTenantIds = new Set(activeAssignments.map(a => String(a.tenant?._id || a.tenant)));

      const available = tenants.filter(t => !busyTenantIds.has(String(t._id)));
      return res.status(200).json({
        success: true,
        tenants: available.map(t => (t.toJSON ? t.toJSON() : t)),
      });
    }

    res.status(200).json({
      success: true,
      tenants: tenants.map(t => (t.toJSON ? t.toJSON() : t)),
    });
  } catch (error) {
    next(error);
  }
};
