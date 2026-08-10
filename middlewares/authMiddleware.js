const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const userRepository = require('../repositories/userRepository');
const { USER_STATUS } = require('../utils/constants');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authorization header missing or invalid', 401));
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Authorization token is required', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.getUserById(decoded.id);

    if (!user || user.status === USER_STATUS.DELETED) {
      return next(new AppError('Account has been deleted or is invalid', 401));
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    return next(error);
  }
};
