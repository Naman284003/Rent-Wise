import mongoose from 'mongoose';
import { defineModel } from './modelHelper.js';

const complaintSchemaDef = {
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
    required: [true, 'Property reference is required'],
    index: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room reference is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'carpentry', 'appliance', 'pest_control', 'noise', 'cleanliness', 'other'],
    default: 'plumbing',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
    index: true,
  },
  resolutionNotes: {
    type: String,
    trim: true,
    default: '',
  },
  resolvedAt: {
    type: Date,
  },
};

export const Complaint = defineModel('Complaint', complaintSchemaDef);
