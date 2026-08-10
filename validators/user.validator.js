const { body, param, query } = require('express-validator');
const { USER_STATUS } = require('../utils/constants');

exports.registerValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').trim().toLowerCase().isEmail().withMessage('A valid email is required'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

exports.loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

exports.listUsersValidation = [
  query('status')
    .optional()
    .isIn([USER_STATUS.ACTIVE, USER_STATUS.DELETED])
    .withMessage('Status must be active or deleted'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  query('q').optional().isString().withMessage('Search query must be a string').isLength({ max: 100 }).withMessage('Search query must be at most 100 characters')
];

exports.userIdValidation = [
  param('id').isMongoId().withMessage('Invalid user ID')
];
