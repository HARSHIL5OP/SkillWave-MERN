import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all users (with search and filters)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Map each user to include user_id alias for frontend compatibility
    const formatted = users.map((u) => ({
      ...u.toObject(),
      user_id: u._id,
    }));

    return sendSuccess(res, 200, 'Users retrieved successfully', {
      users: formatted,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const targetId = req.params.id === 'me' ? req.user._id : req.params.id;
    const user = await User.findById(targetId).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'User found', {
      ...user.toObject(),
      user_id: user._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Admin or Self)
export const updateUser = async (req, res, next) => {
  try {
    const targetId = req.params.id === 'me' ? req.user._id : req.params.id;
    // Check permission: Admin or own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== targetId.toString()) {
      return sendError(res, 403, 'Not authorized to update this profile');
    }

    const { name, phone, profileImage, status, role, password } = req.body;
    const user = await User.findById(targetId);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;

    // Only admin can change roles or status
    if (req.user.role === 'admin') {
      if (status) user.status = status;
      if (role) user.role = role;
    }

    // Password change
    if (password && password.length >= 6) {
      user.password = password;
    }

    await user.save();

    return sendSuccess(res, 200, 'User profile updated', {
      ...user.toObject(),
      user_id: user._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Prevent deleting own admin account
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot delete your own admin account');
    }

    await User.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get user preferences
// @route   GET /api/users/:id/preferences
// @access  Private (Self or Admin)
export const getPreferences = async (req, res, next) => {
  try {
    const targetId = req.params.id === 'me' ? req.user._id : req.params.id;
    const user = await User.findById(targetId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'Preferences retrieved', user.preferences || {});
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/:id/preferences
// @access  Private (Self or Admin)
export const updatePreferences = async (req, res, next) => {
  try {
    const targetId = req.params.id === 'me' ? req.user._id : req.params.id;
    const user = await User.findById(targetId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const { category, subcategory, currentSkills, wantToLearn, futureGoals } = req.body;

    user.preferences = {
      category: category || user.preferences?.category || '',
      subcategory: subcategory || user.preferences?.subcategory || '',
      currentSkills: currentSkills || user.preferences?.currentSkills || [],
      wantToLearn: wantToLearn || user.preferences?.wantToLearn || [],
      futureGoals: futureGoals || user.preferences?.futureGoals || '',
    };

    await user.save();

    return sendSuccess(res, 200, 'Preferences updated successfully', user.preferences);
  } catch (error) {
    next(error);
  }
};
