import express from 'express';
import {
  getUserRoadmaps,
  getRoadmapById,
  saveRoadmap,
  updateRoadmap,
  deleteRoadmap,
} from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUserRoadmaps)
  .post(saveRoadmap);

router.route('/:id')
  .get(getRoadmapById)
  .put(updateRoadmap)
  .patch(updateRoadmap)
  .delete(deleteRoadmap);

export default router;
