import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rentwise',
  jwtSecret: process.env.JWT_SECRET || 'rentwise_super_secure_jwt_secret_key_change_in_production_2026',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  initialAdmin: {
    name: process.env.INITIAL_ADMIN_NAME || 'Rajeshwari Kulkarni',
    email: process.env.INITIAL_ADMIN_EMAIL || 'admin@rentwise.in',
    password: process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};
