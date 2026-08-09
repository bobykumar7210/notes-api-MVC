const test = require('node:test');
const assert = require('node:assert/strict');

const { MAX_FILE_SIZE, isAllowedImageMimeType } = require('../middlewares/uploadMiddleware');

test('max upload size is limited to 5 MB', () => {
  assert.equal(MAX_FILE_SIZE, 5 * 1024 * 1024);
});

test('only image mime types are accepted', () => {
  assert.equal(isAllowedImageMimeType('image/png'), true);
  assert.equal(isAllowedImageMimeType('image/jpeg'), true);
  assert.equal(isAllowedImageMimeType('image/webp'), true);
  assert.equal(isAllowedImageMimeType('application/pdf'), false);
  assert.equal(isAllowedImageMimeType('image/svg+xml'), false);
});
