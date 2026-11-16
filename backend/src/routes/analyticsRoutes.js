import express from 'express';
import { getAdminStats, getTeacherStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/admin', protect, authorizeRoles('admin'), getAdminStats);
router.get('/teacher', protect, authorizeRoles('teacher', 'admin'), getTeacherStats);

export default router;
