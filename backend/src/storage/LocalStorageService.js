import { StorageService } from './StorageService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Local File System Storage Service
 * Implements S3-like interface for local file storage
 */
export class LocalStorageService extends StorageService {
  constructor({ basePath, baseUrl }) {
    super();
    // basePath: absolute path where files are stored (e.g., '/uploads')
    // baseUrl: public URL prefix for accessing files (e.g., 'http://localhost:3000/uploads')
    this.basePath = basePath;
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize storage - create directories if they don't exist
   */
  async initialize() {
    try {
      await fs.access(this.basePath);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(this.basePath, { recursive: true });
      console.log(`Created storage directory: ${this.basePath}`);
    }
  }

  /**
   * Upload a file to local storage
   */
  async putObject({ key, body, contentType, metadata = {} }) {
    const filePath = path.join(this.basePath, key);
    const directory = path.dirname(filePath);

    // Ensure directory exists
    await fs.mkdir(directory, { recursive: true });

    // Write file
    await fs.writeFile(filePath, body);

    // Optionally write metadata as a separate JSON file
    if (Object.keys(metadata).length > 0) {
      const metadataPath = `${filePath}.meta.json`;
      await fs.writeFile(metadataPath, JSON.stringify({
        contentType,
        metadata,
        uploadedAt: new Date().toISOString()
      }));
    }

    return {
      key,
      url: this.getPublicUrl(key),
      contentType
    };
  }

  /**
   * Delete a file from local storage
   */
  async deleteObject({ key }) {
    const filePath = path.join(this.basePath, key);

    try {
      await fs.unlink(filePath);

      // Also delete metadata file if it exists
      const metadataPath = `${filePath}.meta.json`;
      try {
        await fs.unlink(metadataPath);
      } catch (error) {
        // Metadata file might not exist, that's okay
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, consider it deleted
    }
  }

  /**
   * Get a file from local storage
   */
  async getObject({ key }) {
    const filePath = path.join(this.basePath, key);

    try {
      const body = await fs.readFile(filePath);

      // Try to read metadata
      let contentType = 'application/octet-stream';
      let metadata = {};

      try {
        const metadataPath = `${filePath}.meta.json`;
        const metaContent = await fs.readFile(metadataPath, 'utf-8');
        const metaData = JSON.parse(metaContent);
        contentType = metaData.contentType || contentType;
        metadata = metaData.metadata || {};
      } catch (error) {
        // Metadata file doesn't exist, use defaults
      }

      return {
        body,
        contentType,
        metadata
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${key}`);
      }
      throw error;
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key) {
    // Normalize path separators for URLs (Windows uses backslashes)
    const normalizedKey = key.split(path.sep).join('/');
    return `${this.baseUrl}/${normalizedKey}`;
  }

  /**
   * List objects with a prefix
   */
  async listObjects({ prefix }) {
    const searchPath = path.join(this.basePath, prefix);
    const results = [];

    try {
      await this._listRecursive(searchPath, this.basePath, results);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // Directory doesn't exist, return empty array
      }
      throw error;
    }

    return results;
  }

  /**
   * Helper method to recursively list files
   */
  async _listRecursive(currentPath, basePath, results) {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        // Skip metadata files
        if (entry.name.endsWith('.meta.json')) {
          continue;
        }

        if (entry.isDirectory()) {
          await this._listRecursive(fullPath, basePath, results);
        } else {
          const stats = await fs.stat(fullPath);
          const key = path.relative(basePath, fullPath);

          results.push({
            key: key.split(path.sep).join('/'), // Normalize to forward slashes
            size: stats.size,
            lastModified: stats.mtime
          });
        }
      }
    } catch (error) {
      // Handle errors silently or log them
      console.error(`Error listing directory ${currentPath}:`, error.message);
    }
  }

  /**
   * Delete multiple objects
   */
  async deleteObjects({ keys }) {
    const deletePromises = keys.map(key => this.deleteObject({ key }));
    await Promise.all(deletePromises);
  }

  /**
   * Extract key from public URL
   * Useful for converting URLs back to keys for deletion
   */
  keyFromUrl(url) {
    if (!url.startsWith(this.baseUrl)) {
      throw new Error('URL does not match this storage service');
    }
    return url.substring(this.baseUrl.length + 1); // +1 for the trailing slash
  }
}
