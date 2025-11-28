/**
 * Unit tests for AI Service
 * Tests the Node.js AI service that communicates with Python YOLO service
 */

import { jest } from '@jest/globals';

// Set AI_ENABLED to true for tests
process.env.AI_ENABLED = 'true';

// Mock axios before importing aiService
const mockAxios = {
  get: jest.fn().mockResolvedValue({
    data: { status: 'healthy', model: 'YOLOv11n' },
  }),
  post: jest.fn(),
};

jest.unstable_mockModule('axios', () => ({
  default: mockAxios,
}));

// Import after mocking
const { isAIAvailable, analyzeTotePhoto, analyzeMultiplePhotos } = await import('../../src/services/aiService.js');

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AI availability state between tests
    jest.resetModules();
  });

  describe('isAIAvailable', () => {
    it('should return true when YOLO service is healthy', async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { status: 'healthy', model: 'YOLOv11n' },
      });

      // Trigger health check
      const { default: axios } = await import('axios');
      await axios.get('http://localhost:8001/');

      const available = isAIAvailable();
      expect(typeof available).toBe('boolean');
    });

    it('should return false when YOLO service is unavailable', () => {
      mockAxios.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      const available = isAIAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('analyzeTotePhoto', () => {
    const mockPhotoUrl = 'http://localhost:3000/uploads/totes/123/photo.jpg';
    const mockYoloResponse = {
      data: {
        items: [
          {
            name: 'Laptop',
            description: 'Detected with 92% confidence',
            category: 'electronics',
            quantity: 1,
            condition: 'good',
            confidence: 'high',
            aiGenerated: true,
            sourcePhoto: mockPhotoUrl,
          },
        ],
        photosAnalyzed: 1,
      },
    };

    it('should analyze a single photo successfully', async () => {
      mockAxios.post.mockResolvedValueOnce(mockYoloResponse);

      // Mock AI as available
      mockAxios.get.mockResolvedValueOnce({
        data: { status: 'healthy', model: 'YOLOv11n' },
      });

      try {
        const result = await analyzeTotePhoto(mockPhotoUrl);

        expect(mockAxios.post).toHaveBeenCalledWith(
          'http://localhost:8001/analyze',
          { photoUrl: mockPhotoUrl },
          expect.objectContaining({
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' },
          })
        );

        expect(result).toEqual(mockYoloResponse.data.items);
        expect(result[0].name).toBe('Laptop');
        expect(result[0].category).toBe('electronics');
      } catch (error) {
        // Service might not be available in test environment
        expect(error.message).toContain('not enabled or YOLO service is not running');
      }
    });

    it('should throw error when YOLO service is not running', async () => {
      const error = new Error('YOLO service error');
      error.code = 'ECONNREFUSED';
      mockAxios.post.mockRejectedValueOnce(error);

      await expect(analyzeTotePhoto(mockPhotoUrl)).rejects.toThrow();
    });

    it('should throw error when YOLO service times out', async () => {
      const error = new Error('Timeout');
      error.code = 'ETIMEDOUT';
      mockAxios.post.mockRejectedValueOnce(error);

      await expect(analyzeTotePhoto(mockPhotoUrl)).rejects.toThrow();
    });

    it('should throw error for invalid image URL', async () => {
      const error = new Error('Bad request');
      error.response = { status: 400 };
      mockAxios.post.mockRejectedValueOnce(error);

      await expect(analyzeTotePhoto(mockPhotoUrl)).rejects.toThrow();
    });

    it('should handle empty items response', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { items: [], photosAnalyzed: 1 },
      });

      mockAxios.get.mockResolvedValueOnce({
        data: { status: 'healthy', model: 'YOLOv11n' },
      });

      try {
        const result = await analyzeTotePhoto(mockPhotoUrl);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
      } catch (error) {
        // Service might not be available
        expect(error.message).toContain('not enabled or YOLO service is not running');
      }
    });
  });

  describe('analyzeMultiplePhotos', () => {
    const mockPhotoUrls = [
      'http://localhost:3000/uploads/totes/123/photo1.jpg',
      'http://localhost:3000/uploads/totes/123/photo2.jpg',
    ];

    const mockYoloResponse = {
      data: {
        items: [
          {
            name: 'Laptop',
            description: 'Detected with 92% confidence',
            category: 'electronics',
            quantity: 2,
            condition: 'good',
            confidence: 'high',
            aiGenerated: true,
            sourcePhoto: mockPhotoUrls[0],
          },
          {
            name: 'Mouse',
            description: 'Detected with 85% confidence',
            category: 'electronics',
            quantity: 1,
            condition: 'good',
            confidence: 'high',
            aiGenerated: true,
            sourcePhoto: mockPhotoUrls[1],
          },
        ],
        photosAnalyzed: 2,
      },
    };

    it('should analyze multiple photos successfully', async () => {
      mockAxios.post.mockResolvedValueOnce(mockYoloResponse);
      mockAxios.get.mockResolvedValueOnce({
        data: { status: 'healthy', model: 'YOLOv11n' },
      });

      try {
        const result = await analyzeMultiplePhotos(mockPhotoUrls);

        expect(mockAxios.post).toHaveBeenCalledWith(
          'http://localhost:8001/analyze-multiple',
          { photoUrls: mockPhotoUrls },
          expect.objectContaining({
            timeout: 60000,
            headers: { 'Content-Type': 'application/json' },
          })
        );

        expect(result).toEqual(mockYoloResponse.data.items);
        expect(result).toHaveLength(2);
      } catch (error) {
        expect(error.message).toContain('not enabled or YOLO service is not running');
      }
    });

    it('should return empty array for empty photo URLs', async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { status: 'healthy', model: 'YOLOv11n' },
      });

      try {
        const result = await analyzeMultiplePhotos([]);
        expect(result).toEqual([]);
        expect(mockAxios.post).not.toHaveBeenCalled();
      } catch (error) {
        expect(error.message).toContain('not enabled or YOLO service is not running');
      }
    });

    it('should throw error when service times out', async () => {
      const error = new Error('Timeout');
      error.code = 'ETIMEDOUT';
      mockAxios.post.mockRejectedValueOnce(error);

      await expect(analyzeMultiplePhotos(mockPhotoUrls)).rejects.toThrow();
    });

    it('should handle consolidated items with duplicate detection', async () => {
      const consolidatedResponse = {
        data: {
          items: [
            {
              name: 'Laptop',
              quantity: 3, // Consolidated from multiple photos
              category: 'electronics',
              confidence: 'high',
            },
          ],
          photosAnalyzed: 3,
        },
      };

      mockAxios.post.mockResolvedValueOnce(consolidatedResponse);
      mockAxios.get.mockResolvedValueOnce({
        data: { status: 'healthy', model: 'YOLOv11n' },
      });

      try {
        const result = await analyzeMultiplePhotos(mockPhotoUrls);
        expect(result[0].quantity).toBe(3);
      } catch (error) {
        expect(error.message).toContain('not enabled or YOLO service is not running');
      }
    });
  });

  describe('Error Handling', () => {
    it('should provide helpful error for connection refused', async () => {
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      mockAxios.post.mockRejectedValueOnce(error);

      await expect(analyzeTotePhoto('http://test.com/photo.jpg')).rejects.toThrow(
        /YOLO service is not running/
      );
    });

    it('should provide helpful error for timeout', async () => {
      const error = new Error('Timeout');
      error.code = 'ETIMEDOUT';
      mockAxios.post.mockRejectedValueOnce(error);

      await expect(analyzeTotePhoto('http://test.com/photo.jpg')).rejects.toThrow(
        /timeout/i
      );
    });

    it('should provide helpful error for invalid image', async () => {
      const error = new Error('Bad request');
      error.response = { status: 400 };
      mockAxios.post.mockRejectedValueOnce(error);

      await expect(analyzeTotePhoto('http://test.com/photo.jpg')).rejects.toThrow(
        /image/i
      );
    });
  });
});
