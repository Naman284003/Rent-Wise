import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import { seedDatabase } from './scripts/seed.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import rentRoutes from './routes/rentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Lazy, idempotent database initialization shared by every entrypoint
// (local `server.js` and the Vercel Function in `api/index.js`).
// In production the in-memory fallback is disabled, so a failed MongoDB
// connection surfaces loudly instead of silently serving ephemeral data.
let dbInitPromise = null;

export function ensureDbInitialized() {
  if (!dbInitPromise) {
    dbInitPromise = Promise.resolve()
      .then(() => connectDB())
      .then(() => seedDatabase())
      .catch((err) => {
        dbInitPromise = null; // allow a retry on the next request
        throw err;
      });
  }
  return dbInitPromise;
}

// Builds the shared RentWise Express API app (security, rate limit, body
// parsing, routes, error handling). Static/SPA delivery is attached by the
// host: `server.js` locally, Vercel's CDN from `dist/` in production.
export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  // 1. Security middleware
  // Helmet configured to allow AI Studio iframe embedding
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      frameguard: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // 2. Rate Limiting on API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    validate: {
      forwardedHeader: false,
    },
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again later.',
    },
  });
  app.use('/api', apiLimiter);

  // 3. Ensure MongoDB is initialized before any API request is handled.
  // On serverless platforms (Vercel) each warm instance lazily connects and
  // seeds on its first request; locally this is already done at boot.
  app.use('/api', async (req, res, next) => {
    try {
      await ensureDbInitialized();
      next();
    } catch (err) {
      next(err);
    }
  });

  // 4. Body Parsing & Cookies
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Health check
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      app: 'RentWise',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // 5. API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/rent-records', rentRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Central error handler for API
  app.use('/api', errorHandler);

  return app;
}