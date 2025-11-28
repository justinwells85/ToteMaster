import { jest } from '@jest/globals';
import { LocalStorageService } from '../../src/storage/LocalStorageService.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('LocalStorageService', () => {
  let service;
  let testBasePath;
  let testBaseUrl;

  beforeEach(async () => {
    // Create a temporary directory for tests
    testBasePath = path.join(os.tmpdir(), `test-storage-${Date.now()}`);
    testBaseUrl = 'http://localhost:3000/uploads';

    service = new LocalStorageService({
      basePath: testBasePath,
      baseUrl: testBaseUrl
    });

    await service.initialize();
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testBasePath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('initialize', () => {
    it('should create storage directory if it does not exist', async () => {
      const newPath = path.join(os.tmpdir(), `test-storage-init-${Date.now()}`);
      const newService = new LocalStorageService({
        basePath: newPath,
        baseUrl: testBaseUrl
      });

      await newService.initialize();

      const stats = await fs.stat(newPath);
      expect(stats.isDirectory()).toBe(true);

      // Cleanup
      await fs.rm(newPath, { recursive: true, force: true });
    });

    it('should not fail if directory already exists', async () => {
      // Call initialize again
      await expect(service.initialize()).resolves.not.toThrow();
    });
  });

  describe('putObject', () => {
    it('should upload a file and return url', async () => {
      const testData = Buffer.from('test file content');
      const key = 'test/file.txt';

      const result = await service.putObject({
        key,
        body: testData,
        contentType: 'text/plain',
        metadata: { userId: '1' }
      });

      expect(result.key).toBe(key);
      expect(result.url).toBe(`${testBaseUrl}/${key}`);
      expect(result.contentType).toBe('text/plain');

      // Verify file was written
      const filePath = path.join(testBasePath, key);
      const content = await fs.readFile(filePath);
      expect(content).toEqual(testData);
    });

    it('should create nested directories as needed', async () => {
      const testData = Buffer.from('nested file');
      const key = 'level1/level2/level3/file.txt';

      await service.putObject({
        key,
        body: testData,
        contentType: 'text/plain'
      });

      const filePath = path.join(testBasePath, key);
      const content = await fs.readFile(filePath);
      expect(content).toEqual(testData);
    });

    it('should write metadata file when metadata provided', async () => {
      const testData = Buffer.from('test');
      const key = 'test/with-meta.txt';
      const metadata = { userId: '123', toteId: '456' };

      await service.putObject({
        key,
        body: testData,
        contentType: 'text/plain',
        metadata
      });

      const metaPath = path.join(testBasePath, `${key}.meta.json`);
      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const meta = JSON.parse(metaContent);

      expect(meta.contentType).toBe('text/plain');
      expect(meta.metadata).toEqual(metadata);
      expect(meta.uploadedAt).toBeDefined();
    });
  });

  describe('getObject', () => {
    it('should retrieve an uploaded file', async () => {
      const testData = Buffer.from('test content');
      const key = 'test/get.txt';

      await service.putObject({
        key,
        body: testData,
        contentType: 'text/plain',
        metadata: { test: 'value' } // Need metadata to save contentType
      });

      const result = await service.getObject({ key });

      expect(result.body).toEqual(testData);
      expect(result.contentType).toBe('text/plain');
    });

    it('should throw error for non-existent file', async () => {
      await expect(
        service.getObject({ key: 'nonexistent/file.txt' })
      ).rejects.toThrow('File not found');
    });

    it('should return metadata if available', async () => {
      const testData = Buffer.from('test');
      const key = 'test/meta.txt';
      const metadata = { foo: 'bar' };

      await service.putObject({
        key,
        body: testData,
        contentType: 'image/jpeg',
        metadata
      });

      const result = await service.getObject({ key });

      expect(result.contentType).toBe('image/jpeg');
      expect(result.metadata).toEqual(metadata);
    });
  });

  describe('deleteObject', () => {
    it('should delete an uploaded file', async () => {
      const key = 'test/delete.txt';

      await service.putObject({
        key,
        body: Buffer.from('to delete'),
        contentType: 'text/plain'
      });

      await service.deleteObject({ key });

      // File should not exist
      await expect(
        fs.access(path.join(testBasePath, key))
      ).rejects.toThrow();
    });

    it('should delete metadata file if it exists', async () => {
      const key = 'test/delete-meta.txt';

      await service.putObject({
        key,
        body: Buffer.from('test'),
        contentType: 'text/plain',
        metadata: { test: 'value' }
      });

      await service.deleteObject({ key });

      // Metadata file should not exist
      const metaPath = path.join(testBasePath, `${key}.meta.json`);
      await expect(fs.access(metaPath)).rejects.toThrow();
    });

    it('should not throw error when deleting non-existent file', async () => {
      await expect(
        service.deleteObject({ key: 'nonexistent.txt' })
      ).resolves.not.toThrow();
    });
  });

  describe('getPublicUrl', () => {
    it('should return correct public URL', () => {
      const key = 'test/file.jpg';
      const url = service.getPublicUrl(key);

      expect(url).toBe(`${testBaseUrl}/${key}`);
    });

    it('should handle keys with path separators', () => {
      const key = 'totes/123/photo.jpg';
      const url = service.getPublicUrl(key);

      expect(url).toContain('totes/123/photo.jpg');
      expect(url).toBe(`${testBaseUrl}/${key}`);
    });
  });

  describe('listObjects', () => {
    it('should list all files with given prefix', async () => {
      // Upload multiple files
      await service.putObject({
        key: 'totes/1/photo1.jpg',
        body: Buffer.from('photo1'),
        contentType: 'image/jpeg'
      });

      await service.putObject({
        key: 'totes/1/photo2.jpg',
        body: Buffer.from('photo2'),
        contentType: 'image/jpeg'
      });

      await service.putObject({
        key: 'totes/2/photo1.jpg',
        body: Buffer.from('photo3'),
        contentType: 'image/jpeg'
      });

      const results = await service.listObjects({ prefix: 'totes/1' });

      expect(results).toHaveLength(2);
      expect(results.map(r => r.key)).toContain('totes/1/photo1.jpg');
      expect(results.map(r => r.key)).toContain('totes/1/photo2.jpg');
      expect(results[0].size).toBeGreaterThan(0);
      expect(results[0].lastModified).toBeDefined();
      expect(results[0].lastModified.getTime).toBeDefined(); // Check it's a Date
    });

    it('should not include metadata files in listing', async () => {
      await service.putObject({
        key: 'test/file.txt',
        body: Buffer.from('test'),
        contentType: 'text/plain',
        metadata: { test: 'value' }
      });

      const results = await service.listObjects({ prefix: 'test' });

      expect(results).toHaveLength(1);
      expect(results[0].key).toBe('test/file.txt');
    });

    it('should return empty array for non-existent prefix', async () => {
      const results = await service.listObjects({ prefix: 'nonexistent' });
      expect(results).toEqual([]);
    });
  });

  describe('deleteObjects', () => {
    it('should delete multiple files', async () => {
      const keys = ['test/file1.txt', 'test/file2.txt', 'test/file3.txt'];

      // Upload files
      for (const key of keys) {
        await service.putObject({
          key,
          body: Buffer.from(`content of ${key}`),
          contentType: 'text/plain'
        });
      }

      // Delete all
      await service.deleteObjects({ keys });

      // Verify all deleted
      for (const key of keys) {
        await expect(
          fs.access(path.join(testBasePath, key))
        ).rejects.toThrow();
      }
    });
  });

  describe('keyFromUrl', () => {
    it('should extract key from URL', () => {
      const url = `${testBaseUrl}/totes/123/photo.jpg`;
      const key = service.keyFromUrl(url);

      expect(key).toBe('totes/123/photo.jpg');
    });

    it('should throw error for non-matching URL', () => {
      expect(() => {
        service.keyFromUrl('http://other-domain.com/file.jpg');
      }).toThrow('URL does not match this storage service');
    });
  });
});
