import express from 'express';
import {
  getRentRecords,
  getRentRecordById,
  generateMonthlyRent,
} from '../controllers/rentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/checkRole.js';

const router = express.Router();

router.use(protect);

router.get('/', getRentRecords);
router.get('/:id', getRentRecordById);
router.post('/generate', authorize('landlord', 'admin'), generateMonthlyRent);

export default router;
