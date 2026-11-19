import mongoose from 'mongoose';
import { defineModel } from './modelHelper.js';

const paymentSchemaDef = {
  rentRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentRecord',
    required: [true, 'Rent record reference is required'],
    index: true,
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TenantAssignment',
    index: true,
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tenant reference is required'],
    index: true,
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Landlord reference is required'],
    index: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.01, 'Payment amount must be greater than zero'],
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'neft_imps', 'bank_transfer', 'cheque', 'cash', 'card', 'other'],
    default: 'upi',
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  referenceNumber: {
    type: String,
    trim: true,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
};

export const Payment = defineModel('Payment', paymentSchemaDef);
