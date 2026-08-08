const { body, param } = require('express-validator');

exports.createNoteValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
];

exports.updateNoteValidation = [
  param('id').isMongoId().withMessage('Invalid note ID'),
  body('title').trim().notEmpty().withMessage('Title is required')
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