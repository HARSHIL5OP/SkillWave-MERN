import User from '../models/User.js';
import Video from '../models/Video.js';
import Challenge from '../models/Challenge.js';
import Event from '../models/Event.js';
import { sendSuccess } from '../utils/apiResponse.js';

// @desc    Get aggregate platform stats for Admin Dashboard
// @route   GET /api/analytics/admin
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalLearners, totalTeachers, totalAdmins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'learner' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    const [totalVideos, totalChallenges, totalEvents] = await Promise.all([
      Video.countDocuments(),
      Challenge.countDocuments(),
      Event.countDocuments(),
    ]);

    // Aggregate views and likes
    const videoStats = await Video.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likeCount' },
        },
      },
    ]);

    const totalViews = videoStats[0]?.totalViews || 0;
    const totalLikes = videoStats[0]?.totalLikes || 0;

    // Category distribution
    const categoryDistribution = await Video.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    // Recent activity (latest videos, challenges, events)
    const [latestVideos, latestChallenges, latestEvents, latestUsers] = await Promise.all([
      Video.find().sort({ createdAt: -1 }).limit(5).select('title category teacherName createdAt'),
      Challenge.find().sort({ createdAt: -1 }).limit(5).select('title category teacherName createdAt'),
      Event.find().sort({ createdAt: -1 }).limit(5).select('title eventDate mode organizedBy createdAt'),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    ]);

    return sendSuccess(res, 200, 'Admin analytics retrieved', {
      counts: {
        users: totalUsers,
        learners: totalLearners,
        teachers: totalTeachers,
        admins: totalAdmins,
        videos: totalVideos,
        challenges: totalChallenges,
        events: totalEvents,
        views: totalViews,
        likes: totalLikes,
      },
      categoryDistribution,
      recentActivity: {
        videos: latestVideos,
        challenges: latestChallenges,
        events: latestEvents,
        users: latestUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregate stats for Teacher Dashboard
// @route   GET /api/analytics/teacher
// @access  Private/Teacher
export const getTeacherStats = async (req, res, next) => {
  try {
    const teacherId = req.user._id;

    const [videoCount, challengeCount, eventCount] = await Promise.all([
      Video.countDocuments({ teacher: teacherId }),
      Challenge.countDocuments({ teacher: teacherId }),
      Event.countDocuments({ organizer: teacherId }),
    ]);

    const videoAggregation = await Video.aggregate([
      { $match: { teacher: teacherId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likeCount' },
          totalComments: { $sum: '$commentsCount' },
        },
      },
    ]);

    const totalViews = videoAggregation[0]?.totalViews || 0;
    const totalLikes = videoAggregation[0]?.totalLikes || 0;
    const totalComments = videoAggregation[0]?.totalComments || 0;

    const recentVideos = await Video.find({ teacher: teacherId })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentChallenges = await Challenge.find({ teacher: teacherId })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentEvents = await Event.find({ organizer: teacherId })
      .sort({ createdAt: -1 })
      .limit(5);

    return sendSuccess(res, 200, 'Teacher analytics retrieved', {
      counts: {
        videos: videoCount,
        challenges: challengeCount,
        events: eventCount,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
      },
      recentVideos,
      recentChallenges,
      recentEvents,
    });
  } catch (error) {
    next(error);
  }
};
