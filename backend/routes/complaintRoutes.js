import express from 'express';
import {
  getComplaints,
  createComplaint,
  updateComplaintStatus,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/checkRole.js';

const router = express.Router();

router.use(protect);

router.get('/', getComplaints);
router.post('/', authorize('tenant'), createComplaint);
router.patch('/:id/status', authorize('landlord', 'admin'), updateComplaintStatus);

export default router;
