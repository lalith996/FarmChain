const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const blockchainRoutes = require('./routes/blockchain.routes');
const ipfsRoutes = require('./routes/ipfs.routes');
const aiRoutes = require('./routes/ai.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const rbacRoutes = require('./routes/rbac.routes');

const app = express();

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(mongoSanitize());
app.use(hpp());

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression Middleware
app.use(compression());

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AgriChain API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}`, rbacRoutes); // RBAC routes (auth, verification, admin/rbac)
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/products`, productRoutes);
app.use(`/api/${apiVersion}/orders`, orderRoutes);
app.use(`/api/${apiVersion}/payments`, paymentRoutes);
app.use(`/api/${apiVersion}/blockchain`, blockchainRoutes);
app.use(`/api/${apiVersion}/ipfs`, ipfsRoutes);
app.use(`/api/${apiVersion}/ai`, aiRoutes);
app.use(`/api/${apiVersion}/notifications`, notificationRoutes);
app.use(`/api/${apiVersion}/admin`, adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
