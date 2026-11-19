import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { config } from './backend/config/index.js';
import { ensureDbInitialized, createApp } from './backend/app.js';
import { errorHandler } from './backend/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const PORT = config.port || 3000;
  const isProduction = config.nodeEnv === 'production' || process.env.VERCEL === '1';

  // 1. Database Connection & Initial Seeding
  await ensureDbInitialized();

  // 2. Shared Express API app (security, routes, error handling)
  const app = createApp();

  // 4. Vite Dev Middleware / Static Client Delivery
  // Create the HTTP server up-front so Vite's HMR WebSocket can attach to the
  // SAME port (3000) instead of spawning a separate one (e.g. 24678).
  const httpServer = http.createServer(app);

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Attach Vite's HMR WebSocket to the same HTTP server (no separate port)
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Fallback error handler
  app.use(errorHandler);

  // Friendly, actionable error if the port is already taken
  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error('');
      console.error('================================================================');
      console.error(`  Port ${PORT} is already in use!`);
      console.error('');
      console.error('  Another server is currently running on this port.');
      console.error('  Options:');
      console.error(`    1. Stop the other server, then run "npm run dev" again.`);
      console.error(`    2. Find what is using it with:`);
      console.error(`         netstat -ano | findstr :${PORT}`);
      console.error(`       Then kill that process (replace <PID>):`);
      console.error(`         taskkill /PID <PID> /F`);
      console.error(`    3. Run on a different port with:`);
      console.error(`         $env:PORT='3001'; npm run dev`);
      console.error('================================================================');
      console.error('');
    } else {
      console.error('[RentWise] Server error:', err);
    }
    process.exit(1);
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[RentWise] Server running at http://localhost:${PORT}`);
    console.log(`[RentWise] Open in your browser: http://localhost:${PORT}`);
    console.log(`[RentWise] Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown so Ctrl+C never leaves zombie processes holding the port
  const shutdown = (signal) => {
    console.log(`\n[RentWise] ${signal} received. Shutting down gracefully...`);
    try {
      if (httpServer.listening) {
        httpServer.close(() => {
          console.log('[RentWise] HTTP server closed.');
          process.exit(0);
        });
        // Safety net: force-exit if close hangs
        setTimeout(() => process.exit(0), 3000).unref();
      } else {
        process.exit(0);
      }
    } catch (err) {
      console.error('[RentWise] Error during shutdown:', err.message);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('[RentWise] Fatal error starting server:', err);
  process.exit(1);
});
