const { MAX_FILE_SIZE, isAllowedImageMimeType } = require('../middlewares/uploadMiddleware');

describe('Upload Middleware', () => {
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
});

