const { body, param } = require('express-validator');

exports.createNoteValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),
  body('description').optional().isString().withMessage('Description must be a string').isLength({ max: 2000 }).withMessage('Description must be at most 2000 characters long')
];

exports.updateNoteValidation = [
  param('id').isMongoId().withMessage('Invalid note ID'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title must be at most 255 characters long'),
  body('description').optional().isString().withMessage('Description must be a string').isLength({ max: 2000 }).withMessage('Description must be at most 2000 characters long')
];

exports.getNoteByIdValidation = [
  param('id').isMongoId().withMessage('Invalid note ID')
];

exports.deleteNoteValidation = [
  param('id').isMongoId().withMessage('Invalid note ID')
];

exports.getAllNotesValidation = [
    param('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    param('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer')
];