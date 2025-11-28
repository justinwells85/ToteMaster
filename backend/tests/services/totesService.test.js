import { jest } from '@jest/globals';

// Mock the repository before importing the service
const mockToteRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countItems: jest.fn(),
  getItemsInTote: jest.fn(),
};

// Mock storage service
const mockStorageService = {
  putObject: jest.fn(),
  deleteObject: jest.fn(),
  getPublicUrl: jest.fn(),
  keyFromUrl: jest.fn(),
};

// Mock the storage factory
jest.unstable_mockModule('../../src/storage/index.js', () => ({
  getStorageService: jest.fn(() => mockStorageService),
}));

// Mock the upload middleware
jest.unstable_mockModule('../../src/middleware/upload.js', () => ({
  generatePhotoKey: jest.fn((file, prefix) => `${prefix}/${Date.now()}-test.${file.originalname.split('.').pop()}`),
  uploadTotePhotos: jest.fn(),
  handleUploadError: jest.fn(),
}));

// Mock the repository module
jest.unstable_mockModule('../../src/db/repositories/ToteRepository.js', () => ({
  default: mockToteRepository,
}));

// Import service after mocking
const { createTote, getAllTotes, getToteById, updateTote, deleteTote, getToteItems, uploadTotePhotos, deleteTotePhoto } =
  await import('../../src/services/totesService.js');

describe('Totes Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createTote', () => {
    it('should create a tote with valid data', async () => {
      const userId = 1;
      const toteData = {
        location: 'Garage',
        locationId: 123,
        description: 'Test Description',
        color: 'blue',
        photos: [],
        tags: [],
      };

      const mockCreatedTote = {
        id: 123, // Integer ID
        ...toteData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.create.mockResolvedValue(mockCreatedTote);

      const result = await createTote(toteData, userId);

      expect(mockToteRepository.create).toHaveBeenCalledWith({ ...toteData, userId });
      expect(result).toEqual(mockCreatedTote);
    });

    it('should create tote with minimal data', async () => {
      const userId = 1;
      const toteData = {
        description: 'Minimal Tote',
      };

      const mockCreatedTote = {
        id: 123,
        location: null,
        locationId: null,
        description: 'Minimal Tote',
        color: null,
        photos: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.create.mockResolvedValue(mockCreatedTote);

      const result = await createTote(toteData, userId);

      expect(mockToteRepository.create).toHaveBeenCalledWith({ ...toteData, userId });
      expect(result).toEqual(mockCreatedTote);
    });

    it('should throw validation error for invalid data', async () => {
      const userId = 1;
      const invalidToteData = {
        description: 'A'.repeat(1001), // Description too long should fail
      };

      await expect(createTote(invalidToteData, userId)).rejects.toThrow('Validation failed');
      expect(mockToteRepository.create).not.toHaveBeenCalled();
    });

    it('should create tote with empty data (all fields optional)', async () => {
      const toteData = {};

      const mockCreatedTote = {
        id: 123,
        location: null,
        locationId: null,
        description: null,
        color: null,
        photos: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.create.mockResolvedValue(mockCreatedTote);

      const result = await createTote(toteData);

      expect(mockToteRepository.create).toHaveBeenCalledWith(toteData);
      expect(result).toEqual(mockCreatedTote);
    });
  });

  describe('getAllTotes', () => {
    it('should return all totes', async () => {
      const userId = 1;
      const mockTotes = [
        { id: 1, description: 'Tote 1', location: 'Garage' },
        { id: 2, description: 'Tote 2', location: 'Basement' },
      ];

      mockToteRepository.findAll.mockResolvedValue(mockTotes);

      const result = await getAllTotes(userId);

      expect(mockToteRepository.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockTotes);
    });

    it('should return empty array when no totes exist', async () => {
      const userId = 1;
      mockToteRepository.findAll.mockResolvedValue([]);

      const result = await getAllTotes(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getToteById', () => {
    it('should return tote when found', async () => {
      const userId = 1;
      const mockTote = {
        id: 123,
        description: 'Test Tote',
        location: 'Garage',
      };

      mockToteRepository.findById.mockResolvedValue(mockTote);

      const result = await getToteById(123);

      expect(mockToteRepository.findById).toHaveBeenCalledWith(123, undefined);
      expect(result).toEqual(mockTote);
    });

    it('should return null when tote not found', async () => {
      const userId = 1;
      mockToteRepository.findById.mockResolvedValue(null);

      const result = await getToteById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateTote', () => {
    it('should update tote with valid data', async () => {
      const userId = 1;
      const updates = {
        description: 'Updated Description',
        location: 'Basement',
        color: 'red',
      };

      const mockExistingTote = { id: 1, location: 'Garage', userId };
      const mockUpdatedTote = {
        id: 123,
        ...updates,
        userId,
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.findById.mockResolvedValue({ id: 123 });
      mockToteRepository.update.mockResolvedValue(mockUpdatedTote);

      const result = await updateTote(123, updates);

      expect(mockToteRepository.update).toHaveBeenCalledWith(123, updates, undefined);
      expect(result).toEqual(mockUpdatedTote);
    });

    it('should allow partial updates', async () => {
      const userId = 1;
      const updates = {
        location: 'New Location',
      };

      const mockExistingTote = { id: 1, location: 'Garage', userId };
      const mockUpdatedTote = {
        id: 123,
        description: 'Original Description',
        location: 'New Location',
        userId,
        updatedAt: new Date().toISOString(),
      };

      mockToteRepository.findById.mockResolvedValue({ id: 123 });
      mockToteRepository.update.mockResolvedValue(mockUpdatedTote);

      const result = await updateTote(123, updates);

      expect(mockToteRepository.update).toHaveBeenCalledWith(123, updates, undefined);
      expect(result).toEqual(mockUpdatedTote);
    });

    it('should throw validation error for invalid update data', async () => {
      const userId = 1;
      const invalidUpdates = {
        description: 'A'.repeat(1001), // Description too long should fail
      };

      await expect(updateTote(123, invalidUpdates)).rejects.toThrow('Validation failed');
      expect(mockToteRepository.update).not.toHaveBeenCalled();
    });

    it('should return null when updating non-existent tote', async () => {
      const updates = { description: 'Updated' };

      mockToteRepository.findById.mockResolvedValue(null);

      const result = await updateTote(999, updates);

      expect(result).toBeNull();
    });
  });

  describe('deleteTote', () => {
    it('should delete empty tote', async () => {
      mockToteRepository.findById.mockResolvedValue({ id: 123, description: 'Test Tote' });
      mockToteRepository.countItems.mockResolvedValue(0);
      mockToteRepository.delete.mockResolvedValue(true);

      const result = await deleteTote(123);

      expect(mockToteRepository.findById).toHaveBeenCalledWith(123, undefined);
      expect(mockToteRepository.countItems).toHaveBeenCalledWith(123, undefined);
      expect(mockToteRepository.delete).toHaveBeenCalledWith(123, undefined);
      expect(result).toBe(true);
    });

    it('should throw error when deleting tote with items', async () => {
      mockToteRepository.findById.mockResolvedValue({ id: 123, description: 'Test Tote' });
      mockToteRepository.countItems.mockResolvedValue(5);

      await expect(deleteTote(123)).rejects.toThrow(
        'Cannot delete tote: it contains 5 item(s). Please remove or reassign items before deleting the tote.'
      );

      expect(mockToteRepository.findById).toHaveBeenCalledWith(123, undefined);
      expect(mockToteRepository.countItems).toHaveBeenCalledWith(123, undefined);
      expect(mockToteRepository.delete).not.toHaveBeenCalled();
    });

    it('should return false when deleting non-existent tote', async () => {
      const userId = 1;
      mockToteRepository.findById.mockResolvedValue(null);

      const result = await deleteTote(999);

      expect(mockToteRepository.findById).toHaveBeenCalledWith(999, undefined);
      expect(mockToteRepository.countItems).not.toHaveBeenCalled();
      expect(mockToteRepository.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('getToteItems', () => {
    it('should return items in tote', async () => {
      const userId = 1;
      const mockItems = [
        { id: 1, name: 'Item 1', toteId: 123 },
        { id: 2, name: 'Item 2', toteId: 123 },
      ];

      mockToteRepository.getItemsInTote.mockResolvedValue(mockItems);

      const result = await getToteItems(123);

      expect(mockToteRepository.getItemsInTote).toHaveBeenCalledWith(123, undefined);
      expect(result).toEqual(mockItems);
    });

    it('should return empty array for empty tote', async () => {
      const userId = 1;
      mockToteRepository.getItemsInTote.mockResolvedValue([]);

      const result = await getToteItems(123);

      expect(result).toEqual([]);
    });

    it('should return null for non-existent tote', async () => {
      const userId = 1;
      mockToteRepository.getItemsInTote.mockResolvedValue(null);

      const result = await getToteItems(999);

      expect(result).toBeNull();
    });
  });

  describe('uploadTotePhotos', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should upload photos and update tote', async () => {
      const userId = 1;
      const toteId = 123;
      const files = [
        {
          originalname: 'photo1.jpg',
          buffer: Buffer.from('photo1'),
          mimetype: 'image/jpeg',
          size: 1024,
        },
        {
          originalname: 'photo2.png',
          buffer: Buffer.from('photo2'),
          mimetype: 'image/png',
          size: 2048,
        },
      ];

      const existingTote = {
        id: toteId,
        description: 'Test Tote',
        photos: ['http://localhost:3000/uploads/existing.jpg'],
      };

      const uploadedUrls = [
        'http://localhost:3000/uploads/totes/123/1234567890-test.jpg',
        'http://localhost:3000/uploads/totes/123/1234567891-test.png',
      ];

      mockToteRepository.findById.mockResolvedValue(existingTote);
      mockStorageService.putObject
        .mockResolvedValueOnce({ url: uploadedUrls[0], key: 'totes/123/photo1.jpg' })
        .mockResolvedValueOnce({ url: uploadedUrls[1], key: 'totes/123/photo2.png' });

      const updatedTote = {
        ...existingTote,
        photos: [...existingTote.photos, ...uploadedUrls],
      };
      mockToteRepository.update.mockResolvedValue(updatedTote);

      const result = await uploadTotePhotos(toteId, files, userId);

      expect(mockToteRepository.findById).toHaveBeenCalledWith(toteId, userId);
      expect(mockStorageService.putObject).toHaveBeenCalledTimes(2);
      expect(mockToteRepository.update).toHaveBeenCalledWith(
        toteId,
        { photos: [...existingTote.photos, ...uploadedUrls] },
        userId
      );
      expect(result.photos).toHaveLength(3);
    });

    it('should handle tote with no existing photos', async () => {
      const userId = 1;
      const toteId = 123;
      const files = [
        {
          originalname: 'photo.jpg',
          buffer: Buffer.from('photo'),
          mimetype: 'image/jpeg',
          size: 1024,
        },
      ];

      const existingTote = {
        id: toteId,
        description: 'Test Tote',
        photos: [],
      };

      const uploadedUrl = 'http://localhost:3000/uploads/totes/123/1234567890-test.jpg';

      mockToteRepository.findById.mockResolvedValue(existingTote);
      mockStorageService.putObject.mockResolvedValue({ url: uploadedUrl, key: 'totes/123/photo.jpg' });

      const updatedTote = {
        ...existingTote,
        photos: [uploadedUrl],
      };
      mockToteRepository.update.mockResolvedValue(updatedTote);

      const result = await uploadTotePhotos(toteId, files, userId);

      expect(result.photos).toEqual([uploadedUrl]);
    });

    it('should return null for non-existent tote', async () => {
      const userId = 1;
      const files = [{ originalname: 'photo.jpg', buffer: Buffer.from('photo'), mimetype: 'image/jpeg' }];

      mockToteRepository.findById.mockResolvedValue(null);

      const result = await uploadTotePhotos(999, files, userId);

      expect(result).toBeNull();
      expect(mockStorageService.putObject).not.toHaveBeenCalled();
    });

    it('should pass metadata to storage service', async () => {
      const userId = 1;
      const toteId = 123;
      const files = [
        {
          originalname: 'photo.jpg',
          buffer: Buffer.from('photo'),
          mimetype: 'image/jpeg',
          size: 1024,
        },
      ];

      mockToteRepository.findById.mockResolvedValue({ id: toteId, photos: [] });
      mockStorageService.putObject.mockResolvedValue({ url: 'http://test.com/photo.jpg' });
      mockToteRepository.update.mockResolvedValue({ id: toteId, photos: ['http://test.com/photo.jpg'] });

      await uploadTotePhotos(toteId, files, userId);

      expect(mockStorageService.putObject).toHaveBeenCalledWith({
        key: expect.any(String),
        body: files[0].buffer,
        contentType: files[0].mimetype,
        metadata: {
          toteId: toteId.toString(),
          userId: userId.toString(),
          originalName: files[0].originalname,
        },
      });
    });
  });

  describe('deleteTotePhoto', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete photo and update tote', async () => {
      const userId = 1;
      const toteId = 123;
      const photoUrl = 'http://localhost:3000/uploads/totes/123/photo.jpg';

      const existingTote = {
        id: toteId,
        description: 'Test Tote',
        photos: [photoUrl, 'http://localhost:3000/uploads/totes/123/other.jpg'],
      };

      mockToteRepository.findById.mockResolvedValue(existingTote);
      mockStorageService.keyFromUrl.mockReturnValue('totes/123/photo.jpg');
      mockStorageService.deleteObject.mockResolvedValue(undefined);

      const updatedTote = {
        ...existingTote,
        photos: ['http://localhost:3000/uploads/totes/123/other.jpg'],
      };
      mockToteRepository.update.mockResolvedValue(updatedTote);

      const result = await deleteTotePhoto(toteId, photoUrl, userId);

      expect(mockToteRepository.findById).toHaveBeenCalledWith(toteId, userId);
      expect(mockStorageService.keyFromUrl).toHaveBeenCalledWith(photoUrl);
      expect(mockStorageService.deleteObject).toHaveBeenCalledWith({ key: 'totes/123/photo.jpg' });
      expect(mockToteRepository.update).toHaveBeenCalledWith(
        toteId,
        { photos: ['http://localhost:3000/uploads/totes/123/other.jpg'] },
        userId
      );
      expect(result.photos).toHaveLength(1);
    });

    it('should return null for non-existent tote', async () => {
      const photoUrl = 'http://localhost:3000/uploads/totes/123/photo.jpg';

      mockToteRepository.findById.mockResolvedValue(null);

      const result = await deleteTotePhoto(999, photoUrl, 1);

      expect(result).toBeNull();
      expect(mockStorageService.deleteObject).not.toHaveBeenCalled();
    });

    it('should throw error when photo not in tote', async () => {
      const toteId = 123;
      const photoUrl = 'http://localhost:3000/uploads/totes/123/nonexistent.jpg';

      const existingTote = {
        id: toteId,
        photos: ['http://localhost:3000/uploads/totes/123/other.jpg'],
      };

      mockToteRepository.findById.mockResolvedValue(existingTote);

      await expect(deleteTotePhoto(toteId, photoUrl, 1)).rejects.toThrow('Photo not found in this tote');
      expect(mockStorageService.deleteObject).not.toHaveBeenCalled();
    });

    it('should continue if storage deletion fails', async () => {
      const userId = 1;
      const toteId = 123;
      const photoUrl = 'http://localhost:3000/uploads/totes/123/photo.jpg';

      const existingTote = {
        id: toteId,
        photos: [photoUrl],
      };

      mockToteRepository.findById.mockResolvedValue(existingTote);
      mockStorageService.keyFromUrl.mockReturnValue('totes/123/photo.jpg');
      mockStorageService.deleteObject.mockRejectedValue(new Error('Storage error'));

      const updatedTote = { ...existingTote, photos: [] };
      mockToteRepository.update.mockResolvedValue(updatedTote);

      const result = await deleteTotePhoto(toteId, photoUrl, userId);

      expect(mockToteRepository.update).toHaveBeenCalledWith(toteId, { photos: [] }, userId);
      expect(result.photos).toHaveLength(0);
    });

    it('should handle empty photos array after deletion', async () => {
      const userId = 1;
      const toteId = 123;
      const photoUrl = 'http://localhost:3000/uploads/totes/123/photo.jpg';

      const existingTote = {
        id: toteId,
        photos: [photoUrl],
      };

      mockToteRepository.findById.mockResolvedValue(existingTote);
      mockStorageService.keyFromUrl.mockReturnValue('totes/123/photo.jpg');
      mockStorageService.deleteObject.mockResolvedValue(undefined);

      const updatedTote = { ...existingTote, photos: [] };
      mockToteRepository.update.mockResolvedValue(updatedTote);

      const result = await deleteTotePhoto(toteId, photoUrl, userId);

      expect(result.photos).toEqual([]);
    });
  });
});
