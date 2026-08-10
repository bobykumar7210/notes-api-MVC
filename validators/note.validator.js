const { body, param, query } = require('express-validator');
const { NOTE_STATUS } = require('../utils/constants');

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

exports.noteIdValidation = [
  param('id').isMongoId().withMessage('Invalid note ID')
];

exports.getAllNotesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  query('q').optional().isString().withMessage('Search query must be a string').isLength({ max: 100 }).withMessage('Search query must be at most 100 characters'),
  query('status')
    .optional()
    .isIn([NOTE_STATUS.ACTIVE, NOTE_STATUS.ARCHIVED, NOTE_STATUS.DELETED])
    .withMessage('Status must be active, archived, or deleted')
];
