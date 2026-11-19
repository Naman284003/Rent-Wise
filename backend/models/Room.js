import mongoose from 'mongoose';
import { defineModel } from './modelHelper.js';

const roomSchemaDef = {
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required'],
    index: true,
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Landlord reference is required'],
    index: true,
  },
  roomNumber: {
    type: String,
    required: [true, 'Room or unit number is required'],
    trim: true,
  },
  floor: {
    type: Number,
    default: 1,
  },
  rentAmount: {
    type: Number,
    required: [true, 'Rent amount is required'],
    min: [0, 'Rent cannot be negative'],
  },
  depositAmount: {
    type: Number,
    default: 0,
    min: [0, 'Deposit cannot be negative'],
  },
  facilities: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['vacant', 'occupied', 'maintenance'],
    default: 'vacant',
    index: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
};

export const Room = defineModel('Room', roomSchemaDef);
