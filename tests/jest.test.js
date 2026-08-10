const logger = require('../middlewares/logger');
const { MAX_FILE_SIZE, isAllowedImageMimeType } = require('../middlewares/uploadMiddleware');
const User = require('../models/User');

describe('Notes API basic checks', () => {
  test('logger exposes winston-style methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });

  test('logger middleware is a function', () => {
    expect(typeof logger.requestLogger).toBe('function');
  });

  test('max upload size is limited to 5 MB', () => {
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });

  test('only image mime types are accepted', () => {
    expect(isAllowedImageMimeType('image/png')).toBe(true);
    expect(isAllowedImageMimeType('image/jpeg')).toBe(true);
    expect(isAllowedImageMimeType('image/webp')).toBe(true);
    expect(isAllowedImageMimeType('application/pdf')).toBe(false);
    expect(isAllowedImageMimeType('image/svg+xml')).toBe(false);
  });

  test('user schema includes email field', () => {
    expect(User.schema.obj.email).toBeDefined();
    expect(User.schema.obj.email.required).toBe(true);
    expect(User.schema.obj.email.unique).toBe(true);
  });

  test('user schema includes soft-delete status', () => {
    expect(User.schema.obj.status).toBeDefined();
    expect(User.schema.obj.deletedAt).toBeDefined();
  });
});
