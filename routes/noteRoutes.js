const express = require('express');
const NoteController = require('../controllers/noteController');
const authMiddleware = require('../middlewares/authMiddleware');
const validationMiddleware = require('../middlewares/validation/validationMiddleware');
const { createNoteValidation, updateNoteValidation, getNoteByIdValidation, getAllNotesValidation, deleteNoteValidation} = require('../validators/note.validator');

const router = express.Router();

// Protect all /notes routes with JWT authorization
router.use(authMiddleware);

// POST /notes - Create a new note
router.post('/', createNoteValidation, validationMiddleware, NoteController.createNote);

// GET /notes - Get all notes
router.get('/', getAllNotesValidation, validationMiddleware, NoteController.getAllNotes);

// GET /notes/:id - Get note by ID
router.get('/:id', getNoteByIdValidation, validationMiddleware, NoteController.getNoteById);

// PUT /notes/:id - Update note
router.put('/:id', updateNoteValidation, validationMiddleware, NoteController.updateNote);

// DELETE /notes/:id - Delete note
router.delete('/:id', deleteNoteValidation, validationMiddleware, NoteController.deleteNote);

module.exports = router;
