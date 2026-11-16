import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, access token missing');
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'User account no longer exists');
    }

    if (user.status === 'Suspended') {
      return sendError(res, 403, 'Account is suspended. Please contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized, token invalid or expired');
  }
};
