const fs = require('fs');
const path = require('path');
const AppError = require('../utils/AppError.js');
const Note = require("../models/Note");

const DATA_FILE = path.join(__dirname, '../data/notes.json');


exports.saveNote = async (note) => {

    return await Note.create(note);

};


exports.getAllNotes = async () => {
    return await Note.find();
};

exports.getNoteById = async (id) => {
    const note = await Note.findById(id);
    return note;
};

exports.updateNote = async (id, updatedNote) => {
    const note = await Note.findByIdAndUpdate(id, updatedNote, { new: true });
    return note;
}

exports.deleteNote = async (id) => {
    const note = await Note.findByIdAndRemove(id);
    return note;
}