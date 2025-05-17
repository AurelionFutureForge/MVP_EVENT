const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define uploads directory relative to current file
const uploadDir = path.join(__dirname, 'uploads');

// Create uploads folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

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

// Multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter,
});

module.exports = upload;
