import mongoose from 'mongoose';
import { isUsingMemoryStore } from '../config/db.js';
import { createMemoryModel } from '../config/memoryStore.js';

export function defineModel(modelName, schemaDef, options = {}) {
  // Define standard Mongoose Schema
  const schema = new mongoose.Schema(schemaDef, {
    timestamps: true,
    ...options,
  });

  // Create Mongoose model (or reuse if already compiled)
  let mongooseModel;
  try {
    mongooseModel = mongoose.model(modelName);
  } catch (e) {
    mongooseModel = mongoose.model(modelName, schema);
  }

  // Memory model instance with exact modelName key
  const collectionKey = modelName.toLowerCase();
  const memModel = createMemoryModel(collectionKey);

  // Return a delegating proxy
  const handler = {
    get(target, prop) {
      if (isUsingMemoryStore()) {
        if (prop in memModel) {
          return memModel[prop];
        }
      }
      return mongooseModel[prop];
    },
  };

  return new Proxy(mongooseModel, handler);
}
