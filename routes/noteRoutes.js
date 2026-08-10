const express = require('express');
const NoteController = require('../controllers/noteController');
const authMiddleware = require('../middlewares/authMiddleware');
const validationMiddleware = require('../middlewares/validation/validationMiddleware');
const {
  createNoteValidation,
  updateNoteValidation,
  getNoteByIdValidation,
  getAllNotesValidation,
  deleteNoteValidation,
  noteIdValidation
} = require('../validators/note.validator');

const router = express.Router();

// Protect all /notes routes with JWT authorization
router.use(authMiddleware);

// POST /notes - Create a new note
router.post('/', createNoteValidation, validationMiddleware, NoteController.createNote);

// GET /notes - Get notes (paginated / searchable / filterable)
router.get('/', getAllNotesValidation, validationMiddleware, NoteController.getAllNotes);

// PATCH /notes/:id/archive - Archive an active note
router.patch('/:id/archive', noteIdValidation, validationMiddleware, NoteController.archiveNote);

// PATCH /notes/:id/restore - Restore archived or deleted note
router.patch('/:id/restore', noteIdValidation, validationMiddleware, NoteController.restoreNote);

// GET /notes/:id - Get note by ID
router.get('/:id', getNoteByIdValidation, validationMiddleware, NoteController.getNoteById);

// PUT /notes/:id - Update note
router.put('/:id', updateNoteValidation, validationMiddleware, NoteController.updateNote);

// DELETE /notes/:id - Soft delete note
router.delete('/:id', deleteNoteValidation, validationMiddleware, NoteController.deleteNote);

module.exports = router;
