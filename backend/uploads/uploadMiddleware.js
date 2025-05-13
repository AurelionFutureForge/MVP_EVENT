// backend/uploadMiddleware.js

const multer = require('multer');
const path = require('path');

// Set up storage engine for multer to define where and how the file will be saved
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Upload files to the 'uploads' folder
    cb(null, 'backend/uploads');
  },
  filename: (req, file, cb) => {
    // Set file name with the original name and a timestamp to avoid conflicts
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Set up file filter to accept only image files (or change according to your needs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
  }
};

// Set up the multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 5MB file size limit
  fileFilter,
});

module.exports = upload;
