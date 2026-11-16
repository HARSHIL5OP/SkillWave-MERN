import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { validateLoginInput, validateRegisterInput } from '../validators/authValidator.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      return sendError(res, 400, errors.join(', '));
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (user.status === 'Suspended') {
      return sendError(res, 403, 'Your account has been suspended. Please contact support.');
    }

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 200, 'Login successful', {
      user: {
        _id: user._id,
        user_id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        preferences: user.preferences,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user (Public registration for learners, Admin can register any role)
// @route   POST /api/auth/register
// @access  Public / Admin
export const register = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegisterInput(req.body);
    if (!isValid) {
      return sendError(res, 400, errors.join(', '));
    }

    const { name, email, password, role = 'learner', phone, profileImage, preferences } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return sendError(res, 400, 'User with that email already exists');
    }

    // Role restrictions: only authenticated admins can create admin/teacher accounts
    let assignedRole = role;
    if (assignedRole === 'admin' || assignedRole === 'teacher') {
      if (!req.user || req.user.role !== 'admin') {
        assignedRole = 'learner';
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      phone: phone || '',
      profileImage: profileImage || '',
      preferences: preferences || {},
    });

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 201, 'User registered successfully', {
      user: {
        _id: user._id,
        user_id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        preferences: user.preferences,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'Current user profile', {
      user: {
        _id: user._id,
        user_id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  return sendSuccess(res, 200, 'Successfully logged out');
};
