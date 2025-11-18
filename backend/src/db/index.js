import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'totemaster',
  user: process.env.DB_USER || 'totemaster',
  password: process.env.DB_PASSWORD || 'totemaster',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,  // Increased from 2000
  query_timeout: 10000,  // 10 second query timeout
  statement_timeout: 10000,  // 10 second statement timeout
};

// Create connection pool
const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a SQL query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
export const query = async (text, params) => {
  const start = Date.now();
  console.log('[DB] query() called, about to execute...');
  console.log('[DB] Pool status:', {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount
  });
  try {
    console.log('[DB] Calling pool.query...');
    const res = await pool.query(text, params);
    console.log('[DB] pool.query returned');
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }

    console.log('[DB] About to return result');
    const returnValue = res;
    console.log('[DB] Returning:', { rowCount: returnValue.rowCount, hasRows: !!returnValue.rows });
    return returnValue;
  } catch (error) {
    console.error('[DB] Database query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} - Database client
 */
export const getClient = async () => {
  const client = await pool.connect();

  // Add query helper to client
  const originalQuery = client.query.bind(client);
  client.query = async (text, params) => {
    const start = Date.now();
    try {
      const res = await originalQuery(text, params);
      const duration = Date.now() - start;

      if (process.env.NODE_ENV === 'development') {
        console.log('Executed query', { text, duration, rows: res.rowCount });
      }

      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  };

  return client;
};

/**
 * Test database connection
 * @returns {Promise<boolean>} - Connection status
 */
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

/**
 * Close all database connections
 * @returns {Promise<void>}
 */
export const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

export default {
  query,
  getClient,
  testConnection,
  closePool,
};
