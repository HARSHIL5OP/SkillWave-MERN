import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerEvent,
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getEvents)
  .post(protect, authorizeRoles('teacher', 'admin'), createEvent);

router.route('/:id')
  .get(protect, getEventById)
  .put(protect, authorizeRoles('teacher', 'admin'), updateEvent)
  .patch(protect, authorizeRoles('teacher', 'admin'), updateEvent)
  .delete(protect, authorizeRoles('teacher', 'admin'), deleteEvent);

router.post('/:id/register', protect, registerEvent);
router.post('/:id/rsvp', protect, registerEvent);

export default router;
