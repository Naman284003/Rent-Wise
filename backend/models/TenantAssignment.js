import mongoose from 'mongoose';
import { defineModel } from './modelHelper.js';

const tenantAssignmentSchemaDef = {
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
  leaseStart: {
    type: Date,
    required: [true, 'Lease start date is required'],
  },
  leaseEnd: {
    type: Date,
    required: [true, 'Lease end date is required'],
  },
  rentDueDate: {
    type: Number,
    min: 1,
    max: 31,
    default: 1,
  },
  monthlyRent: {
    type: Number,
    required: [true, 'Monthly rent is required'],
    min: 0,
  },
  depositPaid: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'terminated', 'expired'],
    default: 'active',
    index: true,
  },
  notes: {
    type: String,
    default: '',
  },
};

export const TenantAssignment = defineModel('TenantAssignment', tenantAssignmentSchemaDef);
