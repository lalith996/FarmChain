const app = require('./app');
const logger = require('./utils/logger');
const redisService = require('./services/redis.service');
const { validateEnvironment, getEnvironmentInfo } = require('./utils/validateEnv');

const PORT = process.env.PORT || 5000;

// FIX #9 & #14: Validate environment and initialize Redis before starting server
async function startServer() {
  try {
    // FIX #14: Validate environment variables
    logger.info('🔍 Validating environment configuration...');
    validateEnvironment();
    
    // Log environment info (sanitized)
    const envInfo = getEnvironmentInfo();
    logger.info('Environment:', envInfo);

    // Connect to Redis
    await redisService.connect();
    logger.info('✅ Redis connected successfully');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`📊 API available at http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
    });

    return server;
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

const serverPromise = startServer();
let server;
serverPromise.then(s => { server = s; });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  
  // FIX #9: Close Redis connection on shutdown
  await redisService.disconnect();
  
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = serverPromise;
