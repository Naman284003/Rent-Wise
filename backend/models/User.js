import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { defineModel } from './modelHelper.js';

const userSchemaDef = {
  name: {
    type: String,
    required: [true, 'Please provide full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide email address'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'landlord', 'tenant'],
    default: 'landlord',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  emergencyContact: {
    type: String,
    trim: true,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
};

export const User = defineModel('User', userSchemaDef);
