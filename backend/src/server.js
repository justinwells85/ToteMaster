import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import itemsRouter from './routes/items.js';
import totesRouter from './routes/totes.js';
import authRouter from './routes/auth.js';
import locationsRouter from './routes/locations.js';
import tagsRouter from './routes/tags.js';
import testDataRouter from './routes/testData.js';
import { requestLogger } from './middleware/logger.js';
import logger from './utils/logger.js';
import db from './db/index.js';
import { runMigrations } from './db/migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve uploaded files statically
const uploadPath = process.env.STORAGE_PATH || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadPath));
logger.info(`Static file serving configured for: ${uploadPath}`);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Tote Master API',
    version: '1.0.0',
    database: 'PostgreSQL',
    endpoints: {
      auth: '/api/auth',
      items: '/api/items',
      totes: '/api/totes',
      locations: '/api/locations',
      tags: '/api/tags',
      testData: '/api/test-data',
    },
  });
});

app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/totes', totesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/test-data', testDataRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Database initialization and server startup
async function startServer() {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const connected = await db.testConnection();

    if (!connected) {
      throw new Error('Could not connect to database');
    }

    // Run migrations
    logger.info('Running database migrations...');
    await runMigrations();

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Tote Master API server running on http://localhost:${PORT}`);
      logger.info('Database: PostgreSQL');
      logger.info('Ready to accept requests');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received: closing HTTP server`);

      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connections
        await db.closePool();
        logger.info('Database connections closed');

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcefully shutting down after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
