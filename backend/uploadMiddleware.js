const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the uploads directory path according to Render's structure
const uploadDir = path.resolve('/opt/render/project/src/uploads');

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save to '/opt/render/project/src/uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Add timestamp to avoid conflicts
  },
});

// Set up file filter for only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
        'image/jpeg',
    'image/png',
    'image/gif',
    'image/jpg',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    'image/tiff'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
  }
};

// Set up multer upload with size limit and file filter
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max size
  fileFilter,
});

module.exports = upload;
