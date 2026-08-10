const mongoose = require("mongoose");
const { NOTE_STATUS, NOTE_TTL_SECONDS } = require("../utils/constants");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      default: "",
      trim: true,
      maxlength: 2000
    },
    status: {
      type: String,
      enum: [NOTE_STATUS.ACTIVE, NOTE_STATUS.ARCHIVED, NOTE_STATUS.DELETED],
      default: NOTE_STATUS.ACTIVE,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

noteSchema.index({ userId: 1, status: 1 });
noteSchema.index({ deletedAt: 1 }, { expireAfterSeconds: NOTE_TTL_SECONDS });

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
