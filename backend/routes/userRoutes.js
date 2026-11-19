import express from 'express';
import { getAllUsers, toggleUserStatus, getTenants } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/checkRole.js';

const router = express.Router();

router.use(protect);

// Admin-only endpoints
router.get('/', authorize('admin'), getAllUsers);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);

// Landlord & Admin endpoint to fetch tenant directory for room assignments
router.get('/tenants', authorize('landlord', 'admin'), getTenants);

export default router;
