require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start the server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    logger.info(`SmartURL server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`API Docs available at ${process.env.BASE_URL || `http://localhost:${PORT}`}/api-docs`);
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
