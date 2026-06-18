require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const http = require('http');

const PORT = process.env.PORT || 5000;

// ─── Create HTTP Server ───────────────────────────────────────────────────────
const server = http.createServer(app);

// ─── Socket.io (Real-time Order Updates) ─────────────────────────────────────
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: (process.env.CLIENT_URL || 'http://localhost:3000').split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store io instance globally for use in controllers/services
app.set('io', io);

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join room based on role (e.g., kitchen staff joins "kitchen" room)
  socket.on('join-room', (room) => {
    socket.join(room);
    logger.info(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// ─── Boot Sequence ────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('  🍽️  Smart Restaurant Management System');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info(`  ✅ Server running on port ${PORT}`);
      logger.info(`  🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`  📖 API Docs: http://localhost:${PORT}/api-docs`);
      logger.info(`  🏥 Health: http://localhost:${PORT}/health`);
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ─── Unhandled Rejections & Exceptions ───────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', { reason: reason?.message || reason, promise });
  // Don't crash in development
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('unhandledRejection');
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { message: error.message, stack: error.stack });
  gracefulShutdown('uncaughtException');
});

startServer();
