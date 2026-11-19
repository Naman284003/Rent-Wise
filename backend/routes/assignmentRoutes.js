import express from 'express';
import {
  getAssignments,
  createAssignment,
  terminateAssignment,
} from '../controllers/assignmentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/checkRole.js';

const router = express.Router();

router.use(protect);

router.get('/', getAssignments); // Landlords see theirs, tenants see theirs, admins see all
router.post('/', authorize('landlord', 'admin'), createAssignment);
router.patch('/:id/terminate', authorize('landlord', 'admin'), terminateAssignment);

export default router;
