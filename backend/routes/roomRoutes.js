import express from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/checkRole.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('landlord', 'admin'), getRooms);
router.get('/:id', authorize('landlord', 'admin'), getRoomById);
router.post('/', authorize('landlord', 'admin'), createRoom);
router.put('/:id', authorize('landlord', 'admin'), updateRoom);
router.delete('/:id', authorize('landlord', 'admin'), deleteRoom);

export default router;
