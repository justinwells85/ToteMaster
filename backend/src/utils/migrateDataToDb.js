import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db/index.js';
import ItemRepository from '../db/repositories/ItemRepository.js';
import ToteRepository from '../db/repositories/ToteRepository.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migrate data from JSON file to PostgreSQL database
 */
async function migrateJsonToDatabase() {
  try {
    logger.info('Starting JSON to PostgreSQL data migration...');

    // Check database connection
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Could not connect to database');
    }

    // Read JSON data file
    const dataFilePath = path.join(__dirname, '../../data.json');
    let jsonData;

    try {
      const fileContent = await fs.readFile(dataFilePath, 'utf-8');
      jsonData = JSON.parse(fileContent);
      logger.info(`Read data from ${dataFilePath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn('data.json file not found - nothing to migrate');
        return;
      }
      throw error;
    }

    const stats = {
      totesImported: 0,
      totesSkipped: 0,
      itemsImported: 0,
      itemsSkipped: 0,
      errors: [],
    };

    // Migrate totes first (since items reference totes)
    if (jsonData.totes && Array.isArray(jsonData.totes)) {
      logger.info(`Migrating ${jsonData.totes.length} totes...`);

      for (const tote of jsonData.totes) {
        try {
          // Check if tote already exists
          const existing = await ToteRepository.findById(tote.id);
          if (existing) {
            logger.debug(`Tote ${tote.id} already exists, skipping`);
            stats.totesSkipped++;
            continue;
          }

          // Create tote in database
          await ToteRepository.create({
            id: tote.id,
            name: tote.name,
            location: tote.location,
            description: tote.description,
            color: tote.color,
            createdAt: tote.createdAt,
            updatedAt: tote.updatedAt,
          });

          stats.totesImported++;
          logger.debug(`Imported tote: ${tote.name} (${tote.id})`);
        } catch (error) {
          logger.error(`Failed to import tote ${tote.id}:`, error.message);
          stats.errors.push({ type: 'tote', id: tote.id, error: error.message });
        }
      }
    }

    // Migrate items
    if (jsonData.items && Array.isArray(jsonData.items)) {
      logger.info(`Migrating ${jsonData.items.length} items...`);

      for (const item of jsonData.items) {
        try {
          // Check if item already exists
          const existing = await ItemRepository.findById(item.id);
          if (existing) {
            logger.debug(`Item ${item.id} already exists, skipping`);
            stats.itemsSkipped++;
            continue;
          }

          // Create item in database
          await ItemRepository.create({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            toteId: item.toteId,
            quantity: item.quantity,
            condition: item.condition,
            tags: item.tags || [],
            photoUrl: item.photoUrl,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          });

          stats.itemsImported++;
          logger.debug(`Imported item: ${item.name} (${item.id})`);
        } catch (error) {
          logger.error(`Failed to import item ${item.id}:`, error.message);
          stats.errors.push({ type: 'item', id: item.id, error: error.message });
        }
      }
    }

    // Print summary
    logger.info('\n=== Migration Summary ===');
    logger.info(`Totes imported: ${stats.totesImported}`);
    logger.info(`Totes skipped: ${stats.totesSkipped}`);
    logger.info(`Items imported: ${stats.itemsImported}`);
    logger.info(`Items skipped: ${stats.itemsSkipped}`);
    logger.info(`Errors: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      logger.warn('\nErrors encountered:');
      stats.errors.forEach(err => {
        logger.warn(`  - ${err.type} ${err.id}: ${err.error}`);
      });
    }

    logger.info('========================\n');

    // Optionally backup the JSON file
    if (stats.totesImported > 0 || stats.itemsImported > 0) {
      const backupPath = path.join(__dirname, '../../data.json.backup');
      await fs.copyFile(dataFilePath, backupPath);
      logger.info(`Original data backed up to: ${backupPath}`);
    }

    logger.info('Data migration completed successfully!');

  } catch (error) {
    logger.error('Data migration failed:', error);
    throw error;
  } finally {
    await db.closePool();
  }
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateJsonToDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default migrateJsonToDatabase;
