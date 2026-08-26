require('dotenv').config();
const express = require('express');
const cors = require('cors');
const indexRoute = require('./routes/indexRoute');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;
const {limiter} = require('./middlewares/rateLimiter');

// Apply rate limiting middleware
app.use(limiter);

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(logger.requestLogger);
app.use(express.json());

const AppError = require('./utils/AppError');

app.use('/api', indexRoute);

// 404 Not Found fallback
app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

// Error handling middleware
app.use(errorHandler.errorHandler);

// Start server
startServer();

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`🚀 Notes API is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}


