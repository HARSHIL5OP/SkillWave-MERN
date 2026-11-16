import express from 'express';
import {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleLikeVideo,
  rateVideo,
  reportVideo,
} from '../controllers/videoController.js';
import {
  getVideoComments,
  addComment,
  addReply,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getVideos)
  .post(protect, authorizeRoles('teacher', 'admin'), createVideo);

router.route('/:id')
  .get(protect, getVideoById)
  .put(protect, authorizeRoles('teacher', 'admin'), updateVideo)
  .patch(protect, authorizeRoles('teacher', 'admin'), updateVideo)
  .delete(protect, authorizeRoles('teacher', 'admin'), deleteVideo);

// Like, Rate, Report
router.post('/:id/like', protect, toggleLikeVideo);
router.post('/:id/rate', protect, rateVideo);
router.post('/:id/report', protect, reportVideo);

// Comments & Replies
router.route('/:id/comments')
  .get(protect, getVideoComments)
  .post(protect, addComment);

router.post('/:id/comments/:commentId/replies', protect, addReply);
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;
