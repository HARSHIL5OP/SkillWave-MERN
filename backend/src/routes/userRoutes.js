import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPreferences,
  updatePreferences,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('admin'), getUsers);

router.route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .patch(protect, updateUser)
  .delete(protect, authorizeRoles('admin'), deleteUser);

router.route('/:id/preferences')
  .get(protect, getPreferences)
  .put(protect, updatePreferences)
  .patch(protect, updatePreferences);

export default router;
