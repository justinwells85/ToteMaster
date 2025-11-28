import { jest } from '@jest/globals';
import { generatePhotoKey, handleUploadError } from '../../src/middleware/upload.js';
import multer from 'multer';

describe('Upload Middleware', () => {
  describe('generatePhotoKey', () => {
    it('should generate unique key with timestamp and nanoid', () => {
      const file = {
        originalname: 'test-photo.jpg',
      };
      const prefix = 'totes/123';

      const key = generatePhotoKey(file, prefix);

      expect(key).toMatch(/^totes\/123\/\d+-[a-zA-Z0-9_-]{10}\.jpg$/);
    });

    it('should preserve file extension', () => {
      const file = { originalname: 'photo.png' };
      const key = generatePhotoKey(file, 'totes/1');

      expect(key).toMatch(/\.png$/);
    });

    it('should handle files without extension', () => {
      const file = { originalname: 'noextension' };
      const key = generatePhotoKey(file, 'totes/1');

      expect(key).toMatch(/^totes\/1\/\d+-[a-zA-Z0-9_-]{10}$/);
    });

    it('should generate different keys for same file', () => {
      const file = { originalname: 'photo.jpg' };
      const key1 = generatePhotoKey(file, 'totes/1');
      const key2 = generatePhotoKey(file, 'totes/1');

      expect(key1).not.toBe(key2);
    });
  });

  describe('handleUploadError', () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });

    it('should handle LIMIT_FILE_SIZE error', () => {
      const error = new multer.MulterError('LIMIT_FILE_SIZE');

      handleUploadError(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'File too large',
        message: 'File size cannot exceed 5MB'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle LIMIT_FILE_COUNT error', () => {
      const error = new multer.MulterError('LIMIT_FILE_COUNT');

      handleUploadError(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Too many files',
        message: 'Cannot upload more than 10 files at once'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle other multer errors', () => {
      const error = new multer.MulterError('UNEXPECTED_FIELD');
      error.message = 'Unexpected field';

      handleUploadError(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Upload error',
        message: 'Unexpected field'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle non-multer errors', () => {
      const error = new Error('Invalid file type. Only image/jpeg, image/jpg, image/png, image/gif, image/webp are allowed.');

      handleUploadError(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Upload error',
        message: expect.stringContaining('Invalid file type')
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if no error', () => {
      handleUploadError(null, req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });
});
