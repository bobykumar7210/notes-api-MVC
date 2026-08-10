const NoteService = require("../services/noteService.js");
const AppError = require("../utils/AppError.js");


exports.createNote = async (req, res, next) => {
    try {
    const { title, description } = req.body;
    if (!title || title.trim() === "") {
        throw new AppError("Title is required", 400)
    }
    const note = await NoteService.createNote(title, req.user.id, description);

    res.status(201).json({
        success: true,
        data: note
    });
    } catch (err) {
        next(err);
    }
};


exports.getAllNotes = async (req, res, next) => {
    try {
        const result = await NoteService.getAllNotes(req.user.id, req.query);
        res.json({
            success: true,
            data: result.data,
            meta: result.meta
        });
    } catch (err) {
        next(err);
    }
};

exports.getNoteById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const note = await NoteService.getNoteById(id, req.user.id);
        res.json({
            success: true,
            data: note
        });
    } catch (err) {
        next(err);
    }
};



exports.updateNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const note = await NoteService.updateNote(id, title, req.user.id, description);
        res.json({
            success: true,
            data: note
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const note = await NoteService.deleteNote(id, req.user.id);
        res.json({
            success: true,
            data: note
        });
    } catch (err) {
        next(err);
    }
};

exports.archiveNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const note = await NoteService.archiveNote(id, req.user.id);
        res.json({
            success: true,
            data: note
        });
    } catch (err) {
        next(err);
    }
};

exports.restoreNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const note = await NoteService.restoreNote(id, req.user.id);
        res.json({
            success: true,
            data: note
        });
    } catch (err) {
        next(err);
    }
};
