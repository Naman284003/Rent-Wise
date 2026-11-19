import { createApp } from '../backend/app.js';

// Vercel Function entrypoint.
//
// vercel.json rewrites route every /api/* request to /api/index, so the full
// RentWise Express backend (auth, users, properties, payments, etc.) runs in
// this single Function. The React SPA and images are built to dist/ and served
// statically by Vercel's CDN. MongoDB is connected + seeded lazily on the first
// request of each warm instance (see the /api guard inside createApp).
export default createApp();