const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

const app = express();

// ─── Trust Proxy (for Render/Railway deployment) ──────────────────────────────
app.set('trust proxy', 1);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image serving
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000').split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

app.use('/api', globalLimiter);
app.use('/api/v1/auth', authLimiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── HTTP Request Logger ──────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production: log to winston stream
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
      skip: (req) => req.url === '/health', // Skip health check spam
    })
  );
}

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Swagger API Documentation ────────────────────────────────────────────────
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: '🍽️ Smart Restaurant API',
    customCss: '.swagger-ui .topbar { background-color: #e63946; }',
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// JSON spec endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'Smart Restaurant Management System',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, require('./routes/authRoutes'));
app.use(`${API_PREFIX}/users`, require('./routes/userRoutes'));
app.use(`${API_PREFIX}/menu`, require('./routes/menuRoutes'));
app.use(`${API_PREFIX}/inventory`, require('./routes/inventoryRoutes'));
app.use(`${API_PREFIX}/reservations`, require('./routes/reservationRoutes'));
app.use(`${API_PREFIX}/orders`, require('./routes/orderRoutes'));
app.use(`${API_PREFIX}/analytics`, require('./routes/analyticsRoutes'));

// ─── Welcome Route ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🍽️ Welcome to Smart Restaurant Management System API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    health: `${req.protocol}://${req.get('host')}/health`,
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      users: `${API_PREFIX}/users`,
      menu: `${API_PREFIX}/menu`,
      inventory: `${API_PREFIX}/inventory`,
      reservations: `${API_PREFIX}/reservations`,
      orders: `${API_PREFIX}/orders`,
      analytics: `${API_PREFIX}/analytics`,
    },
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use(notFoundMiddleware);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
