import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';

/**
 * Configure multer for memory storage
 * We use memory storage so we can pass the file buffer to our storage service
 * This allows us to easily swap between local and S3 storage
 */
const storage = multer.memoryStorage();

/**
 * File filter to only allow images
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed.`), false);
  }
};

/**
 * Configure multer upload middleware
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

/**
 * Middleware to handle single photo upload for totes
 */
export const uploadTotePhoto = upload.single('photo');

/**
 * Middleware to handle multiple photo uploads for totes
 */
export const uploadTotePhotos = upload.array('photos', 10); // Max 10 photos at once

/**
 * Generate a unique filename for uploaded photos
 * @param {Object} file - Multer file object
 * @param {string} prefix - Prefix for the filename (e.g., 'totes/123')
 * @returns {string} Unique filename with original extension
 */
export function generatePhotoKey(file, prefix) {
  const ext = path.extname(file.originalname);
  const uniqueId = nanoid(10);
  const timestamp = Date.now();
  return `${prefix}/${timestamp}-${uniqueId}${ext}`;
}

/**
 * Error handler middleware for multer errors
 */
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size cannot exceed 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Cannot upload more than 10 files at once'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }

  if (err) {
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }

  next();
}
