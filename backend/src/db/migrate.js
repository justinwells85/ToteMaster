import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './index.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Create migrations tracking table
 */
async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await db.query(query);
  logger.info('Migrations table ready');
}

/**
 * Get list of executed migrations
 */
async function getExecutedMigrations() {
  try {
    const result = await db.query('SELECT name FROM migrations ORDER BY id');
    return result.rows.map(row => row.name);
  } catch (error) {
    // If migrations table doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Mark migration as executed
 */
async function markMigrationExecuted(name) {
  await db.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

/**
 * Get all migration files
 */
async function getMigrationFiles() {
  try {
    const files = await fs.readdir(MIGRATIONS_DIR);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order
  } catch (error) {
    logger.error('Failed to read migrations directory:', error);
    return [];
  }
}

/**
 * Execute a single migration file
 */
async function executeMigration(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = await fs.readFile(filepath, 'utf-8');

  logger.info(`Executing migration: ${filename}`);

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Execute the migration SQL
    await client.query(sql);

    // Mark as executed
    await client.query('INSERT INTO migrations (name) VALUES ($1)', [filename]);

    await client.query('COMMIT');

    logger.info(`✓ Migration completed: ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`✗ Migration failed: ${filename}`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run all pending migrations
 */
export async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    // Test connection first
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Could not connect to database');
    }

    // Create migrations table
    await createMigrationsTable();

    // Get executed and available migrations
    const executed = await getExecutedMigrations();
    const available = await getMigrationFiles();

    // Find pending migrations
    const pending = available.filter(file => !executed.includes(file));

    if (pending.length === 0) {
      logger.info('No pending migrations');
      return;
    }

    logger.info(`Found ${pending.length} pending migration(s)`);

    // Execute each pending migration
    for (const filename of pending) {
      await executeMigration(filename);
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration process failed:', error);
    throw error;
  }
}

/**
 * Rollback last migration (manual process)
 */
export async function rollbackLastMigration() {
  logger.warn('⚠️  Manual rollback required - check migration files for DOWN scripts');

  const result = await db.query(
    'SELECT name FROM migrations ORDER BY id DESC LIMIT 1'
  );

  if (result.rows.length === 0) {
    logger.info('No migrations to rollback');
    return;
  }

  const lastMigration = result.rows[0].name;
  logger.info(`Last migration: ${lastMigration}`);
  logger.info('Create a rollback script manually to undo this migration');
}

/**
 * Check migration status
 */
export async function migrationStatus() {
  try {
    await createMigrationsTable();

    const executed = await getExecutedMigrations();
    const available = await getMigrationFiles();
    const pending = available.filter(file => !executed.includes(file));

    logger.info('\n=== Migration Status ===');
    logger.info(`Total migrations: ${available.length}`);
    logger.info(`Executed: ${executed.length}`);
    logger.info(`Pending: ${pending.length}`);

    if (executed.length > 0) {
      logger.info('\nExecuted migrations:');
      executed.forEach(name => logger.info(`  ✓ ${name}`));
    }

    if (pending.length > 0) {
      logger.info('\nPending migrations:');
      pending.forEach(name => logger.info(`  ⋯ ${name}`));
    }

    logger.info('=======================\n');
  } catch (error) {
    logger.error('Failed to get migration status:', error);
  }
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] || 'up';

  (async () => {
    try {
      switch (command) {
        case 'up':
          await runMigrations();
          break;
        case 'status':
          await migrationStatus();
          break;
        case 'rollback':
          await rollbackLastMigration();
          break;
        default:
          logger.info('Usage: node migrate.js [up|status|rollback]');
          logger.info('  up       - Run pending migrations');
          logger.info('  status   - Show migration status');
          logger.info('  rollback - Show last migration for manual rollback');
      }

      await db.closePool();
      process.exit(0);
    } catch (error) {
      logger.error('Migration script failed:', error);
      await db.closePool();
      process.exit(1);
    }
  })();
}

export default {
  runMigrations,
  rollbackLastMigration,
  migrationStatus,
};
