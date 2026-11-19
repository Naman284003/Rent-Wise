import { Payment } from '../models/Payment.js';
import { RentRecord } from '../models/RentRecord.js';

// @desc    Record a manual rent payment (Landlord or Admin only)
// @route   POST /api/payments
export const recordPayment = async (req, res, next) => {
  try {
    const { rentRecordId, amount, paymentMethod, paymentDate, referenceNumber, notes } = req.body;

    if (!rentRecordId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Rent record ID and payment amount are required.',
      });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be a positive number greater than zero.',
      });
    }

    const rentRecord = await RentRecord.findById(rentRecordId);
    if (!rentRecord) {
      return res.status(404).json({
        success: false,
        message: 'Associated rent record not found.',
      });
    }

    // Landlord ownership check
    if (req.user.role === 'landlord' && String(rentRecord.landlord?._id || rentRecord.landlord) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only record payments for your own properties.',
      });
    }

    // CORE RULE: Validate payment amount cannot exceed outstanding balance due
    const currentBalance = rentRecord.balanceDue !== undefined ? rentRecord.balanceDue : (rentRecord.rentAmount - rentRecord.amountPaid);
    if (payAmount > currentBalance) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (₹${payAmount.toLocaleString('en-IN')}) exceeds outstanding balance due (₹${currentBalance.toLocaleString('en-IN')}).`,
      });
    }

    // Create payment entry
    const payment = await Payment.create({
      rentRecord: rentRecord._id,
      assignment: rentRecord.assignment,
      tenant: rentRecord.tenant,
      landlord: rentRecord.landlord,
      property: rentRecord.property,
      room: rentRecord.room,
      amount: payAmount,
      paymentMethod: paymentMethod || 'upi',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      referenceNumber: referenceNumber ? referenceNumber.trim() : `RW-${Date.now().toString().slice(-6)}`,
      notes: notes || '',
      recordedBy: req.user._id,
    });

    // CORE RULE: Update rent record amountPaid, balanceDue, and status accurately
    const newAmountPaid = (rentRecord.amountPaid || 0) + payAmount;
    const newBalanceDue = Math.max(0, rentRecord.rentAmount - newAmountPaid);
    let newStatus = 'unpaid';

    if (newBalanceDue === 0 || newAmountPaid >= rentRecord.rentAmount) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partially_paid';
    }

    await RentRecord.findByIdAndUpdate(rentRecord._id, {
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue,
      status: newStatus,
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('tenant', 'name email phone avatar')
      .populate('property', 'name')
      .populate('room', 'roomNumber')
      .populate('recordedBy', 'name role');

    res.status(201).json({
      success: true,
      message: `Payment of ₹${payAmount.toLocaleString('en-IN')} recorded successfully.`,
      payment: populatedPayment,
      updatedRentRecord: {
        _id: rentRecord._id,
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history (scoped by role)
// @route   GET /api/payments
export const getPayments = async (req, res, next) => {
  try {
    const { propertyId, tenantId, rentRecordId, search } = req.query;

    const filter = {};

    if (req.user.role === 'landlord') {
      filter.landlord = req.user._id;
    } else if (req.user.role === 'tenant') {
      filter.tenant = req.user._id;
    }

    if (propertyId && propertyId !== 'all') {
      filter.property = propertyId;
    }
    if (tenantId && tenantId !== 'all') {
      filter.tenant = tenantId;
    }
    if (rentRecordId) {
      filter.rentRecord = rentRecordId;
    }

    const payments = await Payment.find(filter)
      .populate('tenant', 'name email phone avatar')
      .populate('property', 'name address city')
      .populate('room', 'roomNumber')
      .populate('recordedBy', 'name role')
      .sort({ paymentDate: -1 });

    let result = payments;
    if (search) {
      const q = search.toLowerCase();
      result = payments.filter((p) => {
        const ref = p.referenceNumber?.toLowerCase() || '';
        const tenantName = p.tenant?.name?.toLowerCase() || '';
        const propName = p.property?.name?.toLowerCase() || '';
        return ref.includes(q) || tenantName.includes(q) || propName.includes(q);
      });
    }

    const totalCollected = result.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.status(200).json({
      success: true,
      count: result.length,
      totalCollected,
      payments: result,
    });
  } catch (error) {
    next(error);
  }
};
