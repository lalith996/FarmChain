/**
 * Environment Variable Validation
 * FIX #14: Validate critical environment variables at startup
 */

const logger = require('./logger');

/**
 * Validate required environment variables
 * @throws {Error} If required variables are missing or invalid
 */
function validateEnvironment() {
  const errors = [];
  const warnings = [];

  // Critical variables (MUST be set)
  const required = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET, // FIX #14: Required
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
  };

  // Check for missing required variables
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  // FIX #14: Validate JWT secrets are different
  if (process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET) {
    if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
      errors.push('JWT_SECRET and JWT_REFRESH_SECRET must be different for security');
    }
  }

  // Validate JWT secret strength (minimum 32 characters)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters for security');
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    warnings.push('JWT_REFRESH_SECRET should be at least 32 characters for security');
  }

  // Validate weak/default secrets
  const weakSecrets = [
    'your_jwt_secret_key_here_change_in_production',
    'your_refresh_token_secret_here',
    'secret',
    'password',
    '123456'
  ];

  if (weakSecrets.includes(process.env.JWT_SECRET)) {
    errors.push('JWT_SECRET is using a weak/default value. Change it immediately!');
  }

  if (weakSecrets.includes(process.env.JWT_REFRESH_SECRET)) {
    errors.push('JWT_REFRESH_SECRET is using a weak/default value. Change it immediately!');
  }

  // Validate MongoDB URI format
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    errors.push('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }

  // Validate Redis port
  if (process.env.REDIS_PORT) {
    const port = parseInt(process.env.REDIS_PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push('REDIS_PORT must be a valid port number (1-65535)');
    }
  }

  // Validate PORT
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push('PORT must be a valid port number (1-65535)');
    }
  }

  // Important but optional variables
  const important = {
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    BLOCKCHAIN_NETWORK: process.env.BLOCKCHAIN_NETWORK,
    RPC_URL: process.env.RPC_URL,
  };

  for (const [key, value] of Object.entries(important)) {
    if (!value) {
      warnings.push(`Missing recommended environment variable: ${key}`);
    }
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    // Redis password is critical in production
    if (!process.env.REDIS_PASSWORD) {
      errors.push('REDIS_PASSWORD is required in production');
    }

    // Blockchain configuration required in production
    if (!process.env.RPC_URL) {
      errors.push('RPC_URL is required in production');
    }

    if (!process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS) {
      warnings.push('SUPPLY_CHAIN_CONTRACT_ADDRESS not set');
    }

    if (!process.env.PAYMENT_CONTRACT_ADDRESS) {
      warnings.push('PAYMENT_CONTRACT_ADDRESS not set');
    }

    // CORS origin should be set
    if (!process.env.CORS_ORIGIN) {
      warnings.push('CORS_ORIGIN not set - will allow all origins');
    }
  }

  // Log results
  if (errors.length > 0) {
    logger.error('❌ Environment validation failed:');
    errors.forEach(error => logger.error(`  - ${error}`));
    throw new Error(`Environment validation failed with ${errors.length} error(s)`);
  }

  if (warnings.length > 0) {
    logger.warn('⚠️  Environment validation warnings:');
    warnings.forEach(warning => logger.warn(`  - ${warning}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    logger.info('✅ Environment validation passed');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get environment info for logging
 */
function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    mongoUri: process.env.MONGODB_URI ? '***configured***' : 'missing',
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    redisPassword: process.env.REDIS_PASSWORD ? '***set***' : 'not set',
    jwtSecret: process.env.JWT_SECRET ? '***set***' : 'missing',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ? '***set***' : 'missing',
    blockchainNetwork: process.env.BLOCKCHAIN_NETWORK || 'not set',
    corsOrigin: process.env.CORS_ORIGIN || 'all origins',
  };
}

module.exports = {
  validateEnvironment,
  getEnvironmentInfo
};
