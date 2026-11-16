import Roadmap from '../models/Roadmap.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get user's saved roadmaps
// @route   GET /api/roadmaps
// @access  Private
export const getUserRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id }).sort({ updatedAt: -1 });

    const formatted = roadmaps.map((r) => {
      const obj = r.toObject();
      return {
        ...obj,
        id: r._id,
      };
    });

    return sendSuccess(res, 200, 'Roadmaps retrieved', formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get roadmap by ID
// @route   GET /api/roadmaps/:id
// @access  Private
export const getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return sendError(res, 404, 'Roadmap not found');
    }

    if (req.user.role !== 'admin' && roadmap.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to view this roadmap');
    }

    return sendSuccess(res, 200, 'Roadmap found', {
      ...roadmap.toObject(),
      id: roadmap._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save new roadmap
// @route   POST /api/roadmaps
// @access  Private
export const saveRoadmap = async (req, res, next) => {
  try {
    const { title, topic, duration, progress = 0, completedSteps = [] } = req.body;
    const roadmap = req.body.roadmap || req.body.phases || req.body;
    const finalTopic = topic || title || 'General Development';
    const finalTitle = title || `${finalTopic} Roadmap`;

    if (!roadmap) {
      return sendError(res, 400, 'Roadmap content is required');
    }

    const newRoadmap = await Roadmap.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      title: finalTitle,
      topic: finalTopic,
      duration: duration || '4 weeks',
      roadmap,
      progress,
      completedSteps,
    });

    return sendSuccess(res, 201, 'Roadmap saved successfully', {
      ...newRoadmap.toObject(),
      id: newRoadmap._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update roadmap progress
// @route   PUT /api/roadmaps/:id
// @access  Private
export const updateRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return sendError(res, 404, 'Roadmap not found');
    }

    if (req.user.role !== 'admin' && roadmap.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to update this roadmap');
    }

    const { progress, completedSteps, title, roadmap: updatedRoadmapContent } = req.body;

    if (progress !== undefined) roadmap.progress = progress;
    if (completedSteps !== undefined) roadmap.completedSteps = completedSteps;
    if (title) roadmap.title = title;
    if (updatedRoadmapContent) roadmap.roadmap = updatedRoadmapContent;

    await roadmap.save();

    return sendSuccess(res, 200, 'Roadmap updated successfully', {
      ...roadmap.toObject(),
      id: roadmap._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete roadmap
// @route   DELETE /api/roadmaps/:id
// @access  Private
export const deleteRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return sendError(res, 404, 'Roadmap not found');
    }

    if (req.user.role !== 'admin' && roadmap.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to delete this roadmap');
    }

    await Roadmap.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, 'Roadmap deleted successfully');
  } catch (error) {
    next(error);
  }
};
