import express from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/checkRole.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('landlord', 'admin'), getProperties);
router.get('/:id', authorize('landlord', 'admin'), getPropertyById);
router.post('/', authorize('landlord', 'admin'), createProperty);
router.put('/:id', authorize('landlord', 'admin'), updateProperty);
router.delete('/:id', authorize('landlord', 'admin'), deleteProperty);

export default router;
