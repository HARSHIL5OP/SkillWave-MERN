import Event from '../models/Event.js';
import { validateEventInput } from '../validators/eventValidator.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res, next) => {
  try {
    const { mode, eventType, organizerId, search } = req.query;
    const query = {};

    if (mode && mode !== 'All') {
      query.mode = mode;
    }

    if (eventType && eventType !== 'All') {
      query.eventType = eventType;
    }

    if (organizerId) {
      query.organizer = organizerId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email profileImage')
      .sort({ eventDate: 1 });

    const formatted = events.map((e) => {
      const obj = e.toObject({ virtuals: true });
      return {
        ...obj,
        id: e._id,
        user_id: e.organizer?._id || e.organizer,
      };
    });

    return sendSuccess(res, 200, 'Events retrieved', formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email profileImage');
    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    const obj = event.toObject({ virtuals: true });
    return sendSuccess(res, 200, 'Event found', {
      ...obj,
      id: event._id,
      user_id: event.organizer?._id || event.organizer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Teacher or Admin)
export const createEvent = async (req, res, next) => {
  try {
    const { isValid, errors } = validateEventInput(req.body);
    if (!isValid) {
      return sendError(res, 400, errors.join(', '));
    }

    const title = req.body.title || req.body.event_title;
    const description = req.body.description || req.body.event_description || '';
    const thumbnailUrl = req.body.thumbnailUrl || req.body.thumbnailURL || '';
    const pdfUrl = req.body.pdfUrl || req.body.pdfURL || '';
    const eventDate = req.body.eventDate || req.body.event_date;
    const registrationClosingDate = req.body.registrationClosingDate || null;
    const organizedBy = req.body.organizedBy || req.user.name;
    const mode = req.body.mode || 'Online';
    const location = req.body.location || 'Online';
    const eventType = req.body.eventType || req.body.event_type || 'Workshop';

    const event = await Event.create({
      title,
      description,
      thumbnailUrl,
      pdfUrl,
      eventDate,
      registrationClosingDate,
      organizedBy,
      mode,
      location,
      eventType,
      organizer: req.user._id,
      organizerName: req.user.name,
      organizerEmail: req.user.email,
    });

    const obj = event.toObject({ virtuals: true });
    return sendSuccess(res, 201, 'Event created successfully', {
      ...obj,
      id: event._id,
      user_id: req.user._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer or Admin)
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to update this event');
    }

    const {
      title,
      event_title,
      description,
      event_description,
      thumbnailUrl,
      thumbnailURL,
      pdfUrl,
      pdfURL,
      eventDate,
      event_date,
      registrationClosingDate,
      organizedBy,
      mode,
      location,
      eventType,
      event_type,
      status,
    } = req.body;

    if (title || event_title) event.title = title || event_title;
    if (description !== undefined || event_description !== undefined) {
      event.description = description !== undefined ? description : event_description;
    }
    if (thumbnailUrl || thumbnailURL) event.thumbnailUrl = thumbnailUrl || thumbnailURL;
    if (pdfUrl || pdfURL) event.pdfUrl = pdfUrl || pdfURL;
    if (eventDate || event_date) event.eventDate = eventDate || event_date;
    if (registrationClosingDate !== undefined) event.registrationClosingDate = registrationClosingDate;
    if (organizedBy) event.organizedBy = organizedBy;
    if (mode) event.mode = mode;
    if (location) event.location = location;
    if (eventType || event_type) event.eventType = eventType || event_type;
    if (status) event.status = status;

    await event.save();

    const obj = event.toObject({ virtuals: true });
    return sendSuccess(res, 200, 'Event updated successfully', {
      ...obj,
      id: event._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer or Admin)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to delete this event');
    }

    await Event.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, 'Event deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Register / RSVP for an event
// @route   POST /api/events/:id/register
// @access  Private
export const registerEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    if (!Array.isArray(event.attendees)) {
      event.attendees = [];
    }

    const userIdStr = req.user._id.toString();
    const isRegistered = event.attendees.some(
      (a) => (a._id || a).toString() === userIdStr
    );

    if (isRegistered) {
      event.attendees = event.attendees.filter(
        (a) => (a._id || a).toString() !== userIdStr
      );
      await event.save();
      return sendSuccess(res, 200, 'Registration cancelled', {
        registered: false,
        attendeeCount: event.attendees.length,
      });
    } else {
      event.attendees.push(req.user._id);
      await event.save();
      return sendSuccess(res, 200, 'Registered successfully', {
        registered: true,
        attendeeCount: event.attendees.length,
      });
    }
  } catch (error) {
    next(error);
  }
};
