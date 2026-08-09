const noteRepository = require('../repositories/noteRepository');
const AppError = require('../utils/AppError.js');

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
        description: description ? description.trim() : ''
    };

    return await noteRepository.saveNote(note);
};

exports.getAllNotes = async (userId) => {
    if (!userId) {
        throw new AppError('User is required', 400);
    }
    return await noteRepository.getAllNotesByUser(userId);
};

exports.getNoteById = async (id, userId) => {
    const note = await noteRepository.getNoteByIdAndUser(id, userId);
    if (!note) {
        throw new AppError(`Note with id ${id} not found`, 404);
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

    const updateData = {
        title: title.trim(),
        description: description ? description.trim() : ''
    };

    const note = await noteRepository.updateNoteByUser(id, userId, updateData);
    if (!note) {
        throw new AppError(`Note with id ${id} not found`, 404);
    }
    return note;
};

exports.deleteNote = async (id, userId) => {
    const note = await noteRepository.getNoteByIdAndUser(id, userId);
    if (!note) {
        throw new AppError(`Note with id ${id} not found`, 404);
    }
    return await noteRepository.deleteNoteByUser(id, userId);
};

