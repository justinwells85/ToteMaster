import { LocalStorageService } from './LocalStorageService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Storage Service Factory
 * Creates the appropriate storage service based on configuration
 *
 * Future S3 usage example:
 * When migrating to S3, you would:
 * 1. Create S3StorageService.js that extends StorageService
 * 2. Set STORAGE_TYPE=s3 in .env
 * 3. Add AWS credentials to .env
 * 4. Update this factory to return S3StorageService
 */

let storageInstance = null;

/**
 * Get or create storage service instance (singleton)
 */
export function getStorageService() {
  if (storageInstance) {
    return storageInstance;
  }

  const storageType = process.env.STORAGE_TYPE || 'local';

  switch (storageType) {
    case 'local':
      storageInstance = createLocalStorage();
      break;

    case 's3':
      // Future S3 implementation
      // storageInstance = createS3Storage();
      throw new Error('S3 storage not yet implemented. Set STORAGE_TYPE=local');

    default:
      throw new Error(`Unknown storage type: ${storageType}`);
  }

  return storageInstance;
}

/**
 * Create local file system storage service
 */
function createLocalStorage() {
  const storageBasePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'uploads');
  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
  const baseUrl = `${serverUrl}/uploads`;

  const service = new LocalStorageService({
    basePath: storageBasePath,
    baseUrl
  });

  // Initialize storage (create directories)
  service.initialize().catch(error => {
    console.error('Failed to initialize storage:', error);
  });

  return service;
}

/**
 * Future S3 implementation example:
 *
 * import { S3StorageService } from './S3StorageService.js';
 *
 * function createS3Storage() {
 *   const service = new S3StorageService({
 *     region: process.env.AWS_REGION || 'us-east-1',
 *     bucket: process.env.S3_BUCKET,
 *     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 *     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
 *   });
 *   return service;
 * }
 */

// Export for testing or direct usage
export { LocalStorageService };
