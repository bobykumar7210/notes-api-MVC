const noteRepository = require('../repositories/noteRepository');
const AppError = require('../utils/AppError.js');

exports.createNote = async (title) => {

    if (title==="admin") {
        throw new AppError("Title cannot be 'admin'", 400);
    }

    const note = {
        title: title.trim(),
    };

    await noteRepository.saveNote(note);

    return note;

};

exports.getAllNotes = async () => {
    return await noteRepository.getAllNotes();
};

exports.getNoteById = async (id) => {
    const note = await noteRepository.getNoteById(id);  
    if (!note) {
        throw new AppError(`Note with id ${id} not found`, 404);
    }
    return note;
};

exports.updateNote = async (id, title) => {
    if (title==="admin") {
        throw new AppError("Title cannot be 'admin'", 400);
    }
    const note =  await noteRepository.updateNote(id, { title })
    if (!note) {
        throw new AppError(`Note with id ${id} not found`, 404);
    }
    return note;
};

exports.deleteNote = async (id) => {
    const note = await noteRepository.getNoteById(id);
    if (!note) {
        throw new AppError(`Note with id ${id} not found`, 404);
    }
    return await noteRepository.deleteNote(id);
};

