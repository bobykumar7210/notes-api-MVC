const noteRepository = require('../repositories/noteRepository');
const AppError = require('../utils/AppError.js');
const { NOTE_STATUS } = require('../utils/constants');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

exports.createNote = async (title, userId, description = '') => {
    if (!userId) {
        throw new AppError('User is required to create a note', 400);
    }

    if (title === "admin") {
        throw new AppError("Title cannot be 'admin'", 400);
    }

    const note = {
        userId,
        title: title.trim(),
        description: description ? description.trim() : '',
        status: NOTE_STATUS.ACTIVE
    };

    return await noteRepository.saveNote(note);
};

exports.getAllNotes = async (userId, query = {}) => {
    if (!userId) {
        throw new AppError('User is required', 400);
    }

    const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1);
    const requestedLimit = parseInt(query.limit, 10) || DEFAULT_LIMIT;
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
    const status = query.status || NOTE_STATUS.ACTIVE;
    const q = typeof query.q === 'string' ? query.q.trim() : '';

    if (![NOTE_STATUS.ACTIVE, NOTE_STATUS.ARCHIVED, NOTE_STATUS.DELETED].includes(status)) {
        throw new AppError('Invalid note status', 400);
    }

    return await noteRepository.findNotesByUser(userId, {
        status,
        q: q || undefined,
        page,
        limit
    });
};

exports.getNoteById = async (id, userId) => {
    const note = await noteRepository.getNoteByIdAndUser(id, userId);
    if (!note || note.status === NOTE_STATUS.DELETED) {
        throw new AppError(`Note not found`, 404);
    }
    return note;
};

exports.updateNote = async (id, title, userId, description = '') => {
    if (!userId) {
        throw new AppError('User is required', 400);
    }

    if (title === "admin") {
        throw new AppError("Title cannot be 'admin'", 400);
    }

    const existing = await noteRepository.getNoteByIdAndUser(id, userId);
    if (!existing || existing.status === NOTE_STATUS.DELETED) {
        throw new AppError(`Note not found`, 404);
    }

    const updateData = {
        title: title.trim(),
        description: description ? description.trim() : ''
    };

    const note = await noteRepository.updateNoteByUser(id, userId, updateData);
    if (!note) {
        throw new AppError(`Note not found`, 404);
    }
    return note;
};

exports.deleteNote = async (id, userId) => {
    const note = await noteRepository.softDeleteNoteByUser(id, userId);
    if (!note) {
        throw new AppError(`Note not found`, 404);
    }
    return note;
};

exports.archiveNote = async (id, userId) => {
    const existing = await noteRepository.getNoteByIdAndUser(id, userId);
    if (
        !existing ||
        existing.status === NOTE_STATUS.DELETED ||
        existing.status === NOTE_STATUS.ARCHIVED
    ) {
        throw new AppError(`Note not found or cannot be archived`, 404);
    }

    const note = await noteRepository.updateNoteByUser(id, userId, {
        status: NOTE_STATUS.ARCHIVED,
        deletedAt: null
    });
    if (!note) {
        throw new AppError(`Note not found or cannot be archived`, 404);
    }
    return note;
};

exports.restoreNote = async (id, userId) => {
    const existing = await noteRepository.getNoteByIdAndUser(id, userId);
    if (!existing) {
        throw new AppError(`Note not found`, 404);
    }
    if (
        existing.status !== NOTE_STATUS.ARCHIVED &&
        existing.status !== NOTE_STATUS.DELETED
    ) {
        throw new AppError(`Note cannot be restored`, 400);
    }

    const note = await noteRepository.updateNoteByUser(id, userId, {
        status: NOTE_STATUS.ACTIVE,
        deletedAt: null
    });
    if (!note) {
        throw new AppError(`Note not found`, 404);
    }
    return note;
};
