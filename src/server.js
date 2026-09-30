'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('../models');
const { errorHandler, notFound } = require('../middleware/errorHandler');

// ── Routes ─────────────────────────────────────────────────
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const roleRoutes = require('../routes/roleRoutes');
const driverRoutes = require('../routes/driverRoutes');
const driverAppRoutes = require('../routes/driverAppRoutes');
const vehicleRoutes = require('../routes/vehicleRoutes');
const routeRoutes = require('../routes/routeRoutes');
const tripRoutes = require('../routes/tripRoutes');
const bookingRoutes = require('../routes/bookingRoutes');
const refundRoutes = require('../routes/refundRoutes');
const dashboardRoutes = require('../routes/dashboardRoutes');
const otherRoutes = require('../routes/otherRoutes');

const app = express();

// ── Security & Middleware ───────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  max: parseInt(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: 'Too many login attempts' } });

app.use('/api', limiter);

// ── Static Files ─────────────────────────────────────────────
const frontendPath = path.join(__dirname, 'frontend', 'dist');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/', express.static(frontendPath));

// ── API Router ───────────────────────────────────────────────
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV }));
apiRouter.use('/auth', authLimiter, authRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/roles', roleRoutes);
apiRouter.use('/drivers', driverRoutes);
apiRouter.use('/bus-driver', driverAppRoutes);
apiRouter.use('/driver-app', driverAppRoutes);
apiRouter.use('/vehicles', vehicleRoutes);
apiRouter.use('/routes', routeRoutes);
apiRouter.use('/trips', tripRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/refunds', refundRoutes);
apiRouter.use('/', otherRoutes);

// Mount API on standard /api as well as subpath /bus-operator-dev/api
app.use('/api', limiter, apiRouter);
app.use('/bus-operator-dev/api', limiter, apiRouter);

// ── SPA Fallback ─────────────────────────────────────────────
app.get('{*splat}', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/bus-operator-dev/api')) {
    return res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Error Handlers ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4000');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    // Sync models (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Models synchronized');
    }
    app.listen(PORT, () => {
      console.log(`🚀 OncabShuttle server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
