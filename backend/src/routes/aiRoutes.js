import express from 'express';
import { summarize, generateRoadmap, chat } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/summarize', protect, summarize);
router.post('/roadmap', protect, generateRoadmap);
router.post('/chat', chat); // Can be used both logged in or guest

export default router;
