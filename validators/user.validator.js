const { body } = require('express-validator');

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
