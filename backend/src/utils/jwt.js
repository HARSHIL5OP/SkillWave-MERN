import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'skillwave_jwt_super_secret_key_it645_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'skillwave_jwt_super_secret_key_it645_2026'
  );
};
