import { jest } from '@jest/globals';

describe('Storage Factory', () => {
  let originalEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getStorageService', () => {
    it('should create local storage service by default', async () => {
      delete process.env.STORAGE_TYPE;

      // Import fresh to avoid singleton issues
      const { getStorageService } = await import('../../src/storage/index.js?t=' + Date.now());
      const storage = getStorageService();

      expect(storage).toBeDefined();
      expect(storage.constructor.name).toBe('LocalStorageService');
      expect(storage.basePath).toBeDefined();
      expect(storage.baseUrl).toBeDefined();
    });

    it('should throw error when S3 storage is requested', async () => {
      process.env.STORAGE_TYPE = 's3';

      const { getStorageService } = await import('../../src/storage/index.js?t=' + Date.now());

      expect(() => getStorageService()).toThrow('S3 storage not yet implemented');

      delete process.env.STORAGE_TYPE;
    });

    it('should throw error for unknown storage type', async () => {
      process.env.STORAGE_TYPE = 'azure';

      const { getStorageService } = await import('../../src/storage/index.js?t=' + Date.now());

      expect(() => getStorageService()).toThrow('Unknown storage type: azure');

      delete process.env.STORAGE_TYPE;
    });

    it('should use environment variable for storage path', async () => {
      process.env.STORAGE_PATH = '/test/custom/path';
      process.env.STORAGE_TYPE = 'local';

      const { getStorageService } = await import('../../src/storage/index.js?t=' + Date.now());
      const storage = getStorageService();

      expect(storage.basePath).toBe('/test/custom/path');

      delete process.env.STORAGE_PATH;
      delete process.env.STORAGE_TYPE;
    });

    it('should use environment variable for server URL', async () => {
      process.env.SERVER_URL = 'https://test.example.com';
      process.env.STORAGE_TYPE = 'local';

      const { getStorageService } = await import('../../src/storage/index.js?t=' + Date.now());
      const storage = getStorageService();

      expect(storage.baseUrl).toBe('https://test.example.com/uploads');

      delete process.env.SERVER_URL;
      delete process.env.STORAGE_TYPE;
    });
  });
});
