import express from 'express';
import {
  getCategories,
  createCategory,
  addSubcategory,
  addTopic,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorizeRoles('teacher', 'admin'), createCategory);

router.post('/:id/subcategories', protect, authorizeRoles('teacher', 'admin'), addSubcategory);
router.patch('/:id/subcategories/:subId/topics', protect, authorizeRoles('teacher', 'admin'), addTopic);

export default router;
