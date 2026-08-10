const { NOTE_STATUS, USER_STATUS, NOTE_TTL_SECONDS } = require('../utils/constants');
const Note = require('../models/Note');
const User = require('../models/User');
const noteService = require('../services/noteService');
const userService = require('../services/userService');

describe('Status and lifecycle models', () => {
  test('NOTE_STATUS uses active / archived / deleted', () => {
    expect(NOTE_STATUS.ACTIVE).toBe('active');
    expect(NOTE_STATUS.ARCHIVED).toBe('archived');
    expect(NOTE_STATUS.DELETED).toBe('deleted');
  });

  test('USER_STATUS uses active / deleted', () => {
    expect(USER_STATUS.ACTIVE).toBe('active');
    expect(USER_STATUS.DELETED).toBe('deleted');
  });

  test('note schema includes status and deletedAt with TTL', () => {
    expect(Note.schema.obj.status).toBeDefined();
    expect(Note.schema.obj.status.default).toBe(NOTE_STATUS.ACTIVE);
    expect(Note.schema.obj.deletedAt).toBeDefined();

    const ttlIndex = Note.schema.indexes().find(
      ([fields]) => fields.deletedAt === 1
    );
    expect(ttlIndex).toBeDefined();
    expect(ttlIndex[1].expireAfterSeconds).toBe(NOTE_TTL_SECONDS);
  });

  test('user schema includes status and deletedAt', () => {
    expect(User.schema.obj.status).toBeDefined();
    expect(User.schema.obj.status.default).toBe(USER_STATUS.ACTIVE);
    expect(User.schema.obj.deletedAt).toBeDefined();
  });
});

describe('Note service query helpers', () => {
  test('getAllNotes rejects invalid status', async () => {
    await expect(
      noteService.getAllNotes('507f1f77bcf86cd799439011', { status: 'nope' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('getAllNotes requires userId', async () => {
    await expect(noteService.getAllNotes(null)).rejects.toMatchObject({
      statusCode: 400
    });
  });
});

describe('User service soft-delete guards', () => {
  test('deleteUser blocks self-deletion', async () => {
    const id = '507f1f77bcf86cd799439011';
    await expect(userService.deleteUser(id, id)).rejects.toMatchObject({
      statusCode: 400,
      message: 'You cannot delete your own account'
    });
  });

  test('getAllUsers rejects invalid status', async () => {
    await expect(userService.getAllUsers('nope')).rejects.toMatchObject({
      statusCode: 400
    });
  });
});
