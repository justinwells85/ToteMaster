/**
 * Abstract Storage Service Interface
 * Designed to mimic S3-like operations for easy migration
 */
export class StorageService {
  /**
   * Upload a file to storage
   * @param {Object} params - Upload parameters
   * @param {string} params.key - File key/path (e.g., 'totes/123/photo1.jpg')
   * @param {Buffer} params.body - File buffer
   * @param {string} params.contentType - MIME type
   * @param {Object} params.metadata - Optional metadata
   * @returns {Promise<Object>} Upload result with url and key
   */
  async putObject({ key, body, contentType, metadata = {} }) {
    throw new Error('putObject must be implemented by subclass');
  }

  /**
   * Delete a file from storage
   * @param {Object} params - Delete parameters
   * @param {string} params.key - File key/path
   * @returns {Promise<void>}
   */
  async deleteObject({ key }) {
    throw new Error('deleteObject must be implemented by subclass');
  }

  /**
   * Get a file from storage
   * @param {Object} params - Get parameters
   * @param {string} params.key - File key/path
   * @returns {Promise<Object>} Object with body (Buffer) and contentType
   */
  async getObject({ key }) {
    throw new Error('getObject must be implemented by subclass');
  }

  /**
   * Get a public URL for a file
   * @param {string} key - File key/path
   * @returns {string} Public URL
   */
  getPublicUrl(key) {
    throw new Error('getPublicUrl must be implemented by subclass');
  }

  /**
   * List objects with a prefix
   * @param {Object} params - List parameters
   * @param {string} params.prefix - Key prefix to filter by
   * @returns {Promise<Array>} Array of objects with key, size, lastModified
   */
  async listObjects({ prefix }) {
    throw new Error('listObjects must be implemented by subclass');
  }

  /**
   * Delete multiple objects
   * @param {Object} params - Delete parameters
   * @param {Array<string>} params.keys - Array of file keys
   * @returns {Promise<void>}
   */
  async deleteObjects({ keys }) {
    throw new Error('deleteObjects must be implemented by subclass');
  }
}
