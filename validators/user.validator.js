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
    .withMessage('Status must be active or deleted')
];

exports.userIdValidation = [
  param('id').isMongoId().withMessage('Invalid user ID')
];
