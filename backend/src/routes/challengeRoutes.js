import express from 'express';
import {
  getChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from '../controllers/challengeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getChallenges)
  .post(protect, authorizeRoles('teacher', 'admin'), createChallenge);

router.route('/:id')
  .get(protect, getChallengeById)
  .put(protect, authorizeRoles('teacher', 'admin'), updateChallenge)
  .patch(protect, authorizeRoles('teacher', 'admin'), updateChallenge)
  .delete(protect, authorizeRoles('teacher', 'admin'), deleteChallenge);

export default router;
