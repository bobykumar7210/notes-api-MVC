const Note = require("../models/Note");
const { NOTE_STATUS } = require("../utils/constants");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.saveNote = async (note) => {
  return await Note.create(note);
};

exports.findNotesByUser = async (userId, { status, q, page, limit }) => {
  const clauses = [{ userId }];

  if (status === NOTE_STATUS.ACTIVE) {
    clauses.push({
      $or: [
        { status: NOTE_STATUS.ACTIVE },
        { status: { $exists: false } },
        { status: null }
      ]
    });
  } else {
    clauses.push({ status });
  }

  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    clauses.push({
      $or: [{ title: pattern }, { description: pattern }]
    });
  }

  const filter = clauses.length === 1 ? clauses[0] : { $and: clauses };
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Note.find(filter).sort({ updatedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
    Note.countDocuments(filter)
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit)
    }
  };
};

exports.getNoteByIdAndUser = async (id, userId) => {
  return await Note.findOne({ _id: id, userId });
};

exports.updateNoteByUser = async (id, userId, updatedNote, statusFilter) => {
  const filter = { _id: id, userId };
  if (statusFilter) {
    filter.status = statusFilter;
  }
  return await Note.findOneAndUpdate(filter, updatedNote, { new: true });
};

exports.softDeleteNoteByUser = async (id, userId) => {
  return await Note.findOneAndUpdate(
    {
      _id: id,
      userId,
      $or: [
        { status: { $in: [NOTE_STATUS.ACTIVE, NOTE_STATUS.ARCHIVED] } },
        { status: { $exists: false } },
        { status: null }
      ]
    },
    {
      status: NOTE_STATUS.DELETED,
      deletedAt: new Date()
    },
    { new: true }
  );
};
