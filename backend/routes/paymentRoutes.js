import express from 'express';
import { recordPayment, getPayments } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/checkRole.js';

const router = express.Router();

router.use(protect);

router.get('/', getPayments);
router.post('/', authorize('landlord', 'admin'), recordPayment);

export default router;
