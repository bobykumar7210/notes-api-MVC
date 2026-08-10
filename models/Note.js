const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    description: {
        type: String,
        default: '',
        trim: true,
        maxlength: 2000
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;