// upload.js
const multer = require('multer');

// Allowed image mime types
const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
  'image/tiff',
];

// File filter to accept images only
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed.'));
  }
};

// Use memory storage instead of disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter,
});

module.exports = upload;
