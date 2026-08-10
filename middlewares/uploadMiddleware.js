const multer = require('multer');
const AppError = require('../utils/AppError');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/jpg'
]);

const isAllowedImageMimeType = (mimeType) => ALLOWED_IMAGE_MIME_TYPES.has(mimeType);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (!isAllowedImageMimeType(file.mimetype)) {
      return cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif).'));
    }
    cb(null, true);
  }
});

const uploadProfileImage = (req, res, next) => {
  upload.single('profileImage')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return next(new AppError(err.message, 400));
      }
      return next(new AppError(err.message, 400));
    }
    next();
  });
};

module.exports = {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_MIME_TYPES,
  isAllowedImageMimeType,
  uploadProfileImage
};
