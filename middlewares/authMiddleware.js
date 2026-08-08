const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authorization header missing or invalid', 401));
  }
  const token = authHeader.split(' ')[1];
   if(!token) {
    return next(new AppError('Authorization token is required', 401));
  }
  if (!token) {
    return next(new AppError('Authorization token is required', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
};


