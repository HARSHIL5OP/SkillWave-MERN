import express from 'express';
import { uploadFile } from '../controllers/uploadController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorizeRoles('teacher', 'admin'),
  upload.single('file'),
  uploadFile
);

export default router;
