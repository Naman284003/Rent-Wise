import mongoose from 'mongoose';
import { defineModel } from './modelHelper.js';

const propertySchemaDef = {
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Landlord reference is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Property name is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State / Province is required'],
    trim: true,
  },
  zipCode: {
    type: String,
    required: [true, 'Postal / Zip code is required'],
    trim: true,
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'commercial', 'studio', 'condo', 'villa', 'townhouse'],
    default: 'apartment',
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  amenities: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
};

export const Property = defineModel('Property', propertySchemaDef);
