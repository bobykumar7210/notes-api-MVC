const Note = require("../models/Note");

exports.saveNote = async (note) => {
    return await Note.create(note);
};

exports.getAllNotesByUser = async (userId) => {
    return await Note.find({ userId });
};

exports.getNoteByIdAndUser = async (id, userId) => {
    return await Note.findOne({ _id: id, userId });
};

exports.updateNoteByUser = async (id, userId, updatedNote) => {
    return await Note.findOneAndUpdate(
        { _id: id, userId },
        updatedNote,
        { new: true }
    );
};

exports.deleteNoteByUser = async (id, userId) => {
    return await Note.findOneAndDelete({ _id: id, userId });
};