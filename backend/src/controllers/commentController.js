import Comment from '../models/Comment.js';
import Video from '../models/Video.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all comments for a video
// @route   GET /api/videos/:id/comments
// @access  Private
export const getVideoComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ videoId: req.params.id })
      .populate('userId', 'name email profileImage role')
      .sort({ createdAt: -1 });

    const formatted = comments.map((c) => {
      const obj = c.toObject({ virtuals: true });
      return {
        ...obj,
        id: c._id,
      };
    });

    return sendSuccess(res, 200, 'Comments retrieved', formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a video
// @route   POST /api/videos/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const commentText = req.body.comment || req.body.text;
    if (!commentText || commentText.trim() === '') {
      return sendError(res, 400, 'Comment text is required');
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return sendError(res, 404, 'Video not found');
    }

    const newComment = await Comment.create({
      videoId: video._id,
      userId: req.user._id,
      email: req.user.email,
      userName: req.user.name,
      comment: commentText.trim(),
    });

    video.commentsCount += 1;
    await video.save();

    const obj = newComment.toObject({ virtuals: true });
    return sendSuccess(res, 201, 'Comment added successfully', {
      ...obj,
      id: newComment._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reply to a comment
// @route   POST /api/videos/:id/comments/:commentId/replies
// @access  Private
export const addReply = async (req, res, next) => {
  try {
    const replyText = req.body.reply || req.body.text;
    if (!replyText || replyText.trim() === '') {
      return sendError(res, 400, 'Reply text is required');
    }

    const commentDoc = await Comment.findOne({
      _id: req.params.commentId,
      videoId: req.params.id,
    });

    if (!commentDoc) {
      return sendError(res, 404, 'Comment not found');
    }

    const newReply = {
      userId: req.user._id,
      email: req.user.email,
      userName: req.user.name,
      reply: replyText.trim(),
      isTeacher: req.user.role === 'teacher' || req.user.role === 'admin',
      createdAt: new Date(),
    };

    commentDoc.replies.push(newReply);
    commentDoc.hasReplies = true;
    await commentDoc.save();

    const obj = commentDoc.toObject({ virtuals: true });
    return sendSuccess(res, 201, 'Reply added successfully', {
      ...obj,
      id: commentDoc._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/videos/:id/comments/:commentId
// @access  Private (Author or Admin)
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return sendError(res, 404, 'Comment not found');
    }

    if (req.user.role !== 'admin' && comment.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to delete this comment');
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    await Video.findByIdAndUpdate(req.params.id, {
      $inc: { commentsCount: -1 },
    });

    return sendSuccess(res, 200, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};
