import Challenge from '../models/Challenge.js';
import { validateChallengeInput } from '../validators/challengeValidator.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private
export const getChallenges = async (req, res, next) => {
  try {
    const { category, search, teacherId, user_id, status } = req.query;
    const query = {};

    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    const tId = teacherId || user_id;
    if (tId) {
      query.teacher = tId;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const challenges = await Challenge.find(query)
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    const formatted = challenges.map((c) => {
      const obj = c.toObject({ virtuals: true });
      return {
        ...obj,
        id: c._id,
        content_id: c._id,
        user_id: c.teacher?._id || c.teacher,
      };
    });

    return sendSuccess(res, 200, 'Challenges retrieved', formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get challenge by ID
// @route   GET /api/challenges/:id
// @access  Private
export const getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate('teacher', 'name email');
    if (!challenge) {
      return sendError(res, 404, 'Challenge not found');
    }

    const obj = challenge.toObject({ virtuals: true });
    return sendSuccess(res, 200, 'Challenge found', {
      ...obj,
      id: challenge._id,
      content_id: challenge._id,
      user_id: challenge.teacher?._id || challenge.teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new challenge
// @route   POST /api/challenges
// @access  Private (Teacher or Admin)
export const createChallenge = async (req, res, next) => {
  try {
    const { isValid, errors } = validateChallengeInput(req.body);
    if (!isValid) {
      return sendError(res, 400, errors.join(', '));
    }

    const title = req.body.title || req.body.content_title;
    const description = req.body.description || req.body.content_description || '';
    const problemStatementUrl = req.body.problemStatementUrl || req.body.problemStatementURL;
    const solutionUrl = req.body.solutionUrl || req.body.solutionURL || '';
    const category = req.body.category || 'General';

    const challenge = await Challenge.create({
      title,
      description,
      problemStatementUrl,
      solutionUrl,
      teacher: req.user._id,
      teacherName: req.user.name,
      teacherEmail: req.user.email,
      category,
      status: req.body.status || 'Active',
    });

    const obj = challenge.toObject({ virtuals: true });
    return sendSuccess(res, 201, 'Challenge created successfully', {
      ...obj,
      id: challenge._id,
      content_id: challenge._id,
      user_id: req.user._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update challenge
// @route   PUT /api/challenges/:id
// @access  Private (Owner Teacher or Admin)
export const updateChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return sendError(res, 404, 'Challenge not found');
    }

    if (req.user.role !== 'admin' && challenge.teacher.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to update this challenge');
    }

    const {
      title,
      content_title,
      description,
      content_description,
      problemStatementUrl,
      problemStatementURL,
      solutionUrl,
      solutionURL,
      category,
      status,
    } = req.body;

    if (title || content_title) challenge.title = title || content_title;
    if (description !== undefined || content_description !== undefined) {
      challenge.description = description !== undefined ? description : content_description;
    }
    if (problemStatementUrl || problemStatementURL) {
      challenge.problemStatementUrl = problemStatementUrl || problemStatementURL;
    }
    if (solutionUrl !== undefined || solutionURL !== undefined) {
      challenge.solutionUrl = solutionUrl !== undefined ? solutionUrl : solutionURL;
    }
    if (category) challenge.category = category;
    if (status !== undefined) challenge.status = status;

    await challenge.save();

    const obj = challenge.toObject({ virtuals: true });
    return sendSuccess(res, 200, 'Challenge updated successfully', {
      ...obj,
      id: challenge._id,
      content_id: challenge._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete challenge
// @route   DELETE /api/challenges/:id
// @access  Private (Owner Teacher or Admin)
export const deleteChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return sendError(res, 404, 'Challenge not found');
    }

    if (req.user.role !== 'admin' && challenge.teacher.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to delete this challenge');
    }

    await Challenge.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, 'Challenge deleted successfully');
  } catch (error) {
    next(error);
  }
};
