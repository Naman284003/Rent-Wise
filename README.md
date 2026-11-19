<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0831dac9-2666-4f6c-83f0-3cd2fc048b2d

## Run Locally

**Prerequisites:**  Node.js + local MongoDB (or a MongoDB Atlas URI)


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your values:
   `MONGODB_URI`, `JWT_SECRET`, `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`
3. Run the app:
   `npm run dev`

## Deploy on Vercel (full-stack: API + React SPA)

This repo is configured to run the whole app on Vercel:

- The React app and images are built with `npm run build` into `dist/` and served
  statically by Vercel's CDN (`outputDirectory` in `vercel.json`).
- The Express backend runs in a single Vercel Function (`api/index.js`).
  `vercel.json` rewrites all `/api/*` requests to that function.

### Steps

1. Create a free MongoDB Atlas cluster → copy the SRV connection string.
2. In the Vercel project (**Settings → Environment Variables**) add:

   ```
   MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/rentwise
   NODE_ENV=production
   JWT_SECRET=<any long random string>
   INITIAL_ADMIN_NAME="Rajeshwari Kulkarni"
   INITIAL_ADMIN_EMAIL=admin@rentwise.in
   INITIAL_ADMIN_PASSWORD=Admin@123
   ```

3. Redeploy (commit + push triggers it). The backend connects/seeds MongoDB on
   the first request; if MongoDB is unreachable the app fails loudly with a
   clear error in the Vercel logs instead of silently using ephemeral data.

### Demo logins (created automatically by the seed)

- Admin: `admin@rentwise.in` / `Admin@123`
- Landlord: `landlord@rentwise.in` / `Landlord@123`
- Tenant: `tenant@rentwise.in` / `Tenant@123`

> Note: Vercel Functions are serverless – the in-memory DB fallback is disabled
> in production so you must provide a real `MONGODB_URI`.
