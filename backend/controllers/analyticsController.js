import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { TenantAssignment } from '../models/TenantAssignment.js';
import { RentRecord } from '../models/RentRecord.js';
import { Payment } from '../models/Payment.js';
import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';

// @desc    Get dashboard metrics & analytics tailored to user's role
// @route   GET /api/analytics/dashboard
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    if (role === 'landlord') {
      // 1. Landlord metrics
      const properties = await Property.find({ landlord: userId });
      const propertyIds = properties.map(p => p._id);

      const rooms = await Room.find({ landlord: userId });
      const totalRooms = rooms.length;
      const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
      const vacantRooms = rooms.filter(r => r.status === 'vacant').length;
      const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      // Current month & year
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Current month rent records
      const currentMonthRentRecords = await RentRecord.find({
        landlord: userId,
        month: currentMonth,
        year: currentYear,
      });

      const monthlyRentExpected = currentMonthRentRecords.reduce((sum, r) => sum + (r.rentAmount || 0), 0);
      const monthlyRentCollected = currentMonthRentRecords.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
      const monthlyRentPending = currentMonthRentRecords.reduce((sum, r) => sum + (r.balanceDue || 0), 0);

      // All-time pending balance
      const allRentRecords = await RentRecord.find({ landlord: userId });
      const totalPendingRent = allRentRecords.reduce((sum, r) => sum + (r.balanceDue || 0), 0);
      const totalCollectedAllTime = allRentRecords.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

      // Complaints summary
      const openComplaints = await Complaint.countDocuments({ landlord: userId, status: { $in: ['open', 'in_progress'] } });

      // Recent 5 payments
      const recentPayments = await Payment.find({ landlord: userId })
        .populate('tenant', 'name email avatar')
        .populate('property', 'name')
        .populate('room', 'roomNumber')
        .sort({ paymentDate: -1 })
        .limit(5);

      // Monthly collection trend for last 6 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const revenueTrend = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const records = await RentRecord.find({ landlord: userId, month: m, year: y });
        const collected = records.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
        const expected = records.reduce((sum, r) => sum + (r.rentAmount || 0), 0);
        revenueTrend.push({
          month: monthNames[m - 1],
          year: y,
          collected,
          expected,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          totalProperties: properties.length,
          totalRooms,
          occupiedRooms,
          vacantRooms,
          maintenanceRooms,
          occupancyRate,
          monthlyRentCollected,
          monthlyRentExpected,
          monthlyRentPending,
          totalPendingRent,
          totalCollectedAllTime,
          openComplaints,
          recentPayments,
          revenueTrend,
        },
      });
    }

    if (role === 'tenant') {
      // 2. Tenant metrics
      const activeLease = await TenantAssignment.findOne({ tenant: userId, status: 'active' })
        .populate('property', 'name address city state zipCode amenities')
        .populate('room', 'roomNumber floor rentAmount facilities')
        .populate('landlord', 'name email phone avatar');

      const rentRecords = await RentRecord.find({ tenant: userId })
        .populate('property', 'name')
        .populate('room', 'roomNumber')
        .sort({ year: -1, month: -1 });

      const payments = await Payment.find({ tenant: userId })
        .populate('property', 'name')
        .populate('room', 'roomNumber')
        .sort({ paymentDate: -1 })
        .limit(5);

      const complaints = await Complaint.find({ tenant: userId })
        .populate('property', 'name')
        .populate('room', 'roomNumber')
        .sort({ createdAt: -1 });

      const totalPendingBalance = rentRecords.reduce((sum, r) => sum + (r.balanceDue || 0), 0);
      const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Find upcoming or overdue bill
      const currentUnpaid = rentRecords.find(r => r.status === 'unpaid' || r.status === 'overdue' || r.status === 'partially_paid');

      return res.status(200).json({
        success: true,
        data: {
          activeLease,
          totalPendingBalance,
          totalPaid,
          currentBill: currentUnpaid || null,
          recentPayments: payments,
          complaintsCount: complaints.length,
          openComplaintsCount: complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length,
          recentComplaints: complaints.slice(0, 3),
        },
      });
    }

    if (role === 'admin') {
      // 3. Admin platform-wide metrics
      const totalLandlords = await User.countDocuments({ role: 'landlord' });
      const totalTenants = await User.countDocuments({ role: 'tenant' });
      const activeUsers = await User.countDocuments({ isActive: true });
      const deactivatedUsers = await User.countDocuments({ isActive: false });

      const totalProperties = await Property.countDocuments();
      const allRooms = await Room.find();
      const totalRooms = allRooms.length;
      const occupiedRooms = allRooms.filter(r => r.status === 'occupied').length;
      const vacantRooms = allRooms.filter(r => r.status === 'vacant').length;
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      const allPayments = await Payment.find();
      const totalPlatformVolume = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      const allRentRecords = await RentRecord.find();
      const totalPendingPlatform = allRentRecords.reduce((sum, r) => sum + (r.balanceDue || 0), 0);

      const totalComplaints = await Complaint.countDocuments();
      const openComplaints = await Complaint.countDocuments({ status: { $in: ['open', 'in_progress'] } });

      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5);

      const recentPayments = await Payment.find()
        .populate('tenant', 'name email')
        .populate('landlord', 'name email')
        .populate('property', 'name')
        .sort({ paymentDate: -1 })
        .limit(6);

      // Property type breakdown
      const properties = await Property.find();
      const typeBreakdownMap = {};
      properties.forEach(p => {
        typeBreakdownMap[p.propertyType] = (typeBreakdownMap[p.propertyType] || 0) + 1;
      });
      const propertyDistribution = Object.entries(typeBreakdownMap).map(([type, count]) => ({
        type,
        count,
      }));

      return res.status(200).json({
        success: true,
        data: {
          totalLandlords,
          totalTenants,
          activeUsers,
          deactivatedUsers,
          totalProperties,
          totalRooms,
          occupiedRooms,
          vacantRooms,
          occupancyRate,
          totalPlatformVolume,
          totalPendingPlatform,
          totalComplaints,
          openComplaints,
          recentUsers: recentUsers.map(u => (u.toJSON ? u.toJSON() : u)),
          recentPayments,
          propertyDistribution,
        },
      });
    }

    res.status(400).json({ success: false, message: 'Invalid user role for analytics.' });
  } catch (error) {
    next(error);
  }
};
