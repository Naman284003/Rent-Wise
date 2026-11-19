import mongoose from 'mongoose';
import { defineModel } from './modelHelper.js';

const rentRecordSchemaDef = {
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TenantAssignment',
    required: [true, 'Tenant assignment is required'],
    index: true,
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tenant reference is required'],
    index: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required'],
    index: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room reference is required'],
    index: true,
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Landlord reference is required'],
    index: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  rentAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0,
  },
  balanceDue: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid', 'overdue'],
    default: 'unpaid',
    index: true,
  },
  notes: {
    type: String,
    default: '',
  },
};

export const RentRecord = defineModel('RentRecord', rentRecordSchemaDef);
