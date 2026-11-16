import Video from '../models/Video.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import { validateVideoInput } from '../validators/videoValidator.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all videos (with search, category, teacher filtering)
// @route   GET /api/videos
// @access  Private / Public
export const getVideos = async (req, res, next) => {
  try {
    const { category, subcategory, search, teacherId, user_id, status } = req.query;
    const query = {};

    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    if (subcategory && subcategory !== 'All' && subcategory !== 'all') {
      query.subcategory = subcategory;
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
        { topic: { $regex: search, $options: 'i' } },
      ];
    }

    const videos = await Video.find(query)
      .populate('teacher', 'name email profileImage')
      .sort({ createdAt: -1 });

    // Format for dual compatibility
    const formatted = videos.map((v) => {
      const obj = v.toObject({ virtuals: true });
      return {
        ...obj,
        id: v._id,
        video_id: v._id,
        user_id: v.teacher?._id || v.teacher,
      };
    });

    return sendSuccess(res, 200, 'Videos retrieved', formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single video by ID & increment view count
// @route   GET /api/videos/:id
// @access  Private
export const getVideoById = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('teacher', 'name email profileImage');

    if (!video) {
      return sendError(res, 404, 'Video not found');
    }

    const obj = video.toObject({ virtuals: true });
    return sendSuccess(res, 200, 'Video retrieved', {
      ...obj,
      id: video._id,
      video_id: video._id,
      user_id: video.teacher?._id || video.teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new video
// @route   POST /api/videos
// @access  Private (Teacher or Admin)
export const createVideo = async (req, res, next) => {
  try {
    const { isValid, errors } = validateVideoInput(req.body);
    if (!isValid) {
      return sendError(res, 400, errors.join(', '));
    }

    const title = req.body.title || req.body.video_title;
    const description = req.body.description || req.body.video_description || '';
    const videoUrl = req.body.videoUrl || req.body.VideoURL;
    const thumbnailUrl = req.body.thumbnailUrl || req.body.ThumbnailURL || '';
    const category = req.body.category;
    const subcategory = req.body.subcategory || '';
    const topic = req.body.topic || '';
    const duration = req.body.duration || '0:00';

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      teacher: req.user._id,
      teacherName: req.user.name,
      teacherEmail: req.user.email,
      category,
      subcategory,
      topic,
      duration,
      status: req.body.status || 'Active',
    });

    const obj = video.toObject({ virtuals: true });
    return sendSuccess(res, 201, 'Video created successfully', {
      ...obj,
      id: video._id,
      video_id: video._id,
      user_id: req.user._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update video metadata
// @route   PUT /api/videos/:id
// @access  Private (Owner Teacher or Admin)
export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return sendError(res, 404, 'Video not found');
    }

    // Check ownership
    if (req.user.role !== 'admin' && video.teacher.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to update this video');
    }

    const {
      title,
      video_title,
      description,
      video_description,
      videoUrl,
      VideoURL,
      thumbnailUrl,
      ThumbnailURL,
      category,
      subcategory,
      topic,
      duration,
      status,
    } = req.body;

    if (title || video_title) video.title = title || video_title;
    if (description !== undefined || video_description !== undefined) {
      video.description = description !== undefined ? description : video_description;
    }
    if (videoUrl || VideoURL) video.videoUrl = videoUrl || VideoURL;
    if (thumbnailUrl || ThumbnailURL) video.thumbnailUrl = thumbnailUrl || ThumbnailURL;
    if (category) video.category = category;
    if (subcategory !== undefined) video.subcategory = subcategory;
    if (topic !== undefined) video.topic = topic;
    if (duration !== undefined) video.duration = duration;
    if (status !== undefined) video.status = status;

    await video.save();

    const obj = video.toObject({ virtuals: true });
    return sendSuccess(res, 200, 'Video updated successfully', {
      ...obj,
      id: video._id,
      video_id: video._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (Owner Teacher or Admin)
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return sendError(res, 404, 'Video not found');
    }

    if (req.user.role !== 'admin' && video.teacher.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to delete this video');
    }

    await Video.findByIdAndDelete(req.params.id);
    // Cleanup cascade
    await Comment.deleteMany({ videoId: req.params.id });
    await Report.deleteMany({ videoId: req.params.id });

    return sendSuccess(res, 200, 'Video and associated comments deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Like or Unlike a video
// @route   POST /api/videos/:id/like
// @access  Private
export const toggleLikeVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return sendError(res, 404, 'Video not found');
    }

    const userId = req.user._id.toString();
    const userEmail = req.user.email;

    const existingIndex = video.likedUsers.findIndex(
      (u) => (u.userId && u.userId.toString() === userId) || u.email === userEmail
    );

    let isLiked = false;
    if (existingIndex > -1) {
      // Unlike
      video.likedUsers.splice(existingIndex, 1);
      video.likeCount = Math.max(0, video.likeCount - 1);
      isLiked = false;
    } else {
      // Like
      video.likedUsers.push({ userId: req.user._id, email: userEmail });
      video.likeCount += 1;
      isLiked = true;
    }

    await video.save();

    return sendSuccess(res, 200, isLiked ? 'Video liked' : 'Video unliked', {
      likeCount: video.likeCount,
      like_count: video.likeCount,
      isLiked,
      likedUsers: video.likedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate a video (1 - 5 stars)
// @route   POST /api/videos/:id/rate
// @access  Private
export const rateVideo = async (req, res, next) => {
  try {
    const ratingValue = Number(req.body.rating);
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return sendError(res, 400, 'Rating must be a number between 1 and 5');
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return sendError(res, 404, 'Video not found');
    }

    const userId = req.user._id.toString();
    const existingIndex = video.ratings.findIndex(
      (r) => (r.userId && r.userId.toString() === userId) || r.email === req.user.email
    );

    if (existingIndex > -1) {
      video.ratings[existingIndex].rating = ratingValue;
      video.ratings[existingIndex].createdAt = new Date();
    } else {
      video.ratings.push({
        userId: req.user._id,
        email: req.user.email,
        rating: ratingValue,
        createdAt: new Date(),
      });
    }

    const sum = video.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    video.averageRating = Number((sum / video.ratings.length).toFixed(1));

    await video.save();

    return sendSuccess(res, 200, 'Rating submitted successfully', {
      averageRating: video.averageRating,
      average_rating: video.averageRating,
      totalRatings: video.ratings.length,
      ratings: video.ratings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report a video
// @route   POST /api/videos/:id/report
// @access  Private
export const reportVideo = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return sendError(res, 400, 'Report reason is required');
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return sendError(res, 404, 'Video not found');
    }

    const report = await Report.create({
      videoId: video._id,
      userId: req.user._id,
      email: req.user.email,
      reason,
    });

    video.reportCount += 1;
    await video.save();

    return sendSuccess(res, 201, 'Video reported successfully', report);
  } catch (error) {
    next(error);
  }
};
