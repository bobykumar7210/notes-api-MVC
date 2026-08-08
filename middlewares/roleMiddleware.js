const AppError = require('../utils/AppError');

module.exports = ( role ) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    const userRole = req.user.role;
    if (!userRole) {
      return next(new AppError('User role not found', 403));
    }

    if (userRole !== role) {
      return next(new AppError(`Forbidden: insufficient role ${userRole} need ${role} to access this resource`, 403));
    }

    next();
  };
};
