require('dotenv').config();
const express = require('express');
const cors = require('cors');
const noteRoutes = require('./routes/noteRoutes');
const userRoutes = require('./routes/userRoute');
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

// Home Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Notes API', version: '1.0.0' });
});

app.use('/notes', noteRoutes);
app.use('/users', userRoutes);

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


