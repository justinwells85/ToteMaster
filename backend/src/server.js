import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import itemsRouter from './routes/items.js';
import totesRouter from './routes/totes.js';
import { requestLogger } from './middleware/logger.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Tote Master API',
    version: '1.0.0',
    endpoints: {
      items: '/api/items',
      totes: '/api/totes',
    },
  });
});

app.use('/api/items', itemsRouter);
app.use('/api/totes', totesRouter);

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

// Start server
app.listen(PORT, () => {
  logger.info(`Tote Master API server running on http://localhost:${PORT}`);
});

export default app;
