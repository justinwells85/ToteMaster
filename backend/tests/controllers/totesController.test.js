import { jest } from '@jest/globals';

// Mock the service
const mockTotesService = {
  getAllTotes: jest.fn(),
  getToteById: jest.fn(),
  createTote: jest.fn(),
  updateTote: jest.fn(),
  deleteTote: jest.fn(),
  uploadTotePhotos: jest.fn(),
  deleteTotePhoto: jest.fn(),
};

jest.unstable_mockModule('../../src/services/totesService.js', () => mockTotesService);

// Import controller after mocking
const { uploadPhotos, deletePhoto } = await import('../../src/controllers/totesController.js');

describe('Totes Controller - Photo Operations', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { id: '123' },
      user: { userId: 1 },
      files: [],
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('uploadPhotos', () => {
    it('should upload photos successfully', async () => {
      const mockFiles = [
        { originalname: 'photo1.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('test') },
        { originalname: 'photo2.png', mimetype: 'image/png', buffer: Buffer.from('test2') },
      ];
      req.files = mockFiles;

      const mockUpdatedTote = {
        id: '123',
        description: 'Test Tote',
        photos: ['http://localhost:3000/uploads/photo1.jpg', 'http://localhost:3000/uploads/photo2.jpg'],
      };

      mockTotesService.uploadTotePhotos.mockResolvedValue(mockUpdatedTote);

      await uploadPhotos(req, res);

      expect(mockTotesService.uploadTotePhotos).toHaveBeenCalledWith('123', mockFiles, 1);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedTote);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 when no files uploaded', async () => {
      req.files = [];

      await uploadPhotos(req, res);

      expect(mockTotesService.uploadTotePhotos).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'No files uploaded' });
    });

    it('should return 400 when files is undefined', async () => {
      req.files = undefined;

      await uploadPhotos(req, res);

      expect(mockTotesService.uploadTotePhotos).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'No files uploaded' });
    });

    it('should return 404 when tote not found', async () => {
      req.files = [{ originalname: 'photo.jpg', buffer: Buffer.from('test') }];
      mockTotesService.uploadTotePhotos.mockResolvedValue(null);

      await uploadPhotos(req, res);

      expect(mockTotesService.uploadTotePhotos).toHaveBeenCalledWith('123', req.files, 1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Tote not found' });
    });

    it('should return 500 on service error', async () => {
      req.files = [{ originalname: 'photo.jpg', buffer: Buffer.from('test') }];
      mockTotesService.uploadTotePhotos.mockRejectedValue(new Error('Upload failed'));

      await uploadPhotos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Upload failed' });
    });

    it('should handle multiple files', async () => {
      const mockFiles = Array.from({ length: 5 }, (_, i) => ({
        originalname: `photo${i}.jpg`,
        buffer: Buffer.from(`test${i}`),
      }));
      req.files = mockFiles;

      const mockUpdatedTote = {
        id: '123',
        photos: mockFiles.map((_, i) => `http://localhost:3000/uploads/photo${i}.jpg`),
      };

      mockTotesService.uploadTotePhotos.mockResolvedValue(mockUpdatedTote);

      await uploadPhotos(req, res);

      expect(mockTotesService.uploadTotePhotos).toHaveBeenCalledWith('123', mockFiles, 1);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedTote);
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo successfully', async () => {
      const photoUrl = 'http://localhost:3000/uploads/totes/123/photo.jpg';
      req.body = { photoUrl };

      const mockUpdatedTote = {
        id: '123',
        photos: [],
      };

      mockTotesService.deleteTotePhoto.mockResolvedValue(mockUpdatedTote);

      await deletePhoto(req, res);

      expect(mockTotesService.deleteTotePhoto).toHaveBeenCalledWith('123', photoUrl, 1);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedTote);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 when photoUrl is missing', async () => {
      req.body = {};

      await deletePhoto(req, res);

      expect(mockTotesService.deleteTotePhoto).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Photo URL is required' });
    });

    it('should return 400 when photoUrl is empty string', async () => {
      req.body = { photoUrl: '' };

      await deletePhoto(req, res);

      expect(mockTotesService.deleteTotePhoto).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Photo URL is required' });
    });

    it('should return 404 when tote not found', async () => {
      req.body = { photoUrl: 'http://localhost:3000/uploads/photo.jpg' };
      mockTotesService.deleteTotePhoto.mockResolvedValue(null);

      await deletePhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Tote not found' });
    });

    it('should return 400 on service error', async () => {
      req.body = { photoUrl: 'http://localhost:3000/uploads/photo.jpg' };
      mockTotesService.deleteTotePhoto.mockRejectedValue(new Error('Photo not found in this tote'));

      await deletePhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Photo not found in this tote' });
    });

    it('should handle deletion of last photo', async () => {
      const photoUrl = 'http://localhost:3000/uploads/totes/123/photo.jpg';
      req.body = { photoUrl };

      const mockUpdatedTote = {
        id: '123',
        photos: [],
      };

      mockTotesService.deleteTotePhoto.mockResolvedValue(mockUpdatedTote);

      await deletePhoto(req, res);

      expect(mockTotesService.deleteTotePhoto).toHaveBeenCalledWith('123', photoUrl, 1);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedTote);
      expect(mockUpdatedTote.photos).toHaveLength(0);
    });
  });
});
