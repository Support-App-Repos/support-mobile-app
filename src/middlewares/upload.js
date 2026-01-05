/**
 * Multer configuration for file uploads
 */

const multer = require('multer');

// Configure multer to use memory storage (for S3 uploads)
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10, // Max 10 files at once
  },
});

// Middleware for single image upload
exports.uploadSingle = upload.single('image');

// Middleware for multiple image uploads
exports.uploadMultiple = upload.array('images', 10); // Max 10 images

// Middleware for field-based uploads (if needed)
exports.uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'thumbnail', maxCount: 1 },
]);

// Export upload instance as well if needed
exports.upload = upload;

