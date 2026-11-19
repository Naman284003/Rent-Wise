import mongoose from 'mongoose';
import { config } from './index.js';

let isConnected = false;
let useMemoryStore = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    // Attempt Mongoose connection with 5s timeout so startup is fast
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    useMemoryStore = false;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
  } catch (error) {
    const isProduction = config.nodeEnv === 'production' || process.env.VERCEL === '1';

    if (isProduction) {
      // NEVER silently fall back to in-memory data in production — that causes
      // accounts/logins to appear and disappear. Fail loudly instead.
      console.error('');
      console.error('================================================================');
      console.error(`[MongoDB] Failed to connect to: ${config.mongoUri}`);
      console.error(`[MongoDB] Reason: ${error.message}`);
      console.error('');
      console.error('[MongoDB] The in-memory fallback store is DISABLED in production.');
      console.error('[MongoDB] Set the MONGODB_URI environment variable to a reachable');
      console.error('[MongoDB] MongoDB database (e.g. a free MongoDB Atlas cluster).');
      console.error('================================================================');
      console.error('');
      throw new Error(`MongoDB connection required in production: ${error.message}`);
    }
    console.warn(`[MongoDB] Live connection failed (${error.message}). Activating in-memory store (development only).`);
    useMemoryStore = true;
    isConnected = true;
  }
};

export const isUsingMemoryStore = () => useMemoryStore;
