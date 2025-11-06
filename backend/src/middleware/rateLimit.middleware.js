const RateLimitTracker = require('../models/RateLimitTracker.model');
const Role = require('../models/Role.model');
const logger = require('../utils/logger');

// FIX H2.2: Shared rate limit store with automatic cleanup
const ipLimits = new Map();
let cleanupIntervalId = null;

/**
 * Cleanup old entries from rate limit cache
 * Runs every 5 minutes to prevent memory leak
 */
function startCleanupInterval() {
  if (cleanupIntervalId) {
    return; // Already running
  }

  cleanupIntervalId = setInterval(() => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    let removedCount = 0;
    for (const [key, data] of ipLimits.entries()) {
      if (now - data.windowStart > maxAge) {
        ipLimits.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.info(`Rate limit cleanup: removed ${removedCount} expired entries. Map size: ${ipLimits.size}`);
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  // Ensure cleanup stops on process exit
  process.on('SIGTERM', stopCleanupInterval);
  process.on('SIGINT', stopCleanupInterval);

  logger.info('Rate limit cleanup interval started');
}

/**
 * Stop cleanup interval
 */
function stopCleanupInterval() {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    logger.info('Rate limit cleanup interval stopped');
  }
}

// Start cleanup when module is loaded
startCleanupInterval();

/**
 * Rate limiting middleware based on user role
 * Different roles have different rate limits
 */
const rateLimitByRole = (action, windowType = 'minute') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        // For unauthenticated requests, use IP-based rate limiting
        return ipRateLimit(action, 20, windowType)(req, res, next);
      }

      // Get user's role limits
      const role = await Role.findOne({ name: req.user.primaryRole });

      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'User role not found'
        });
      }

      // Get limit for this action
      const limit = role.getRateLimit(action);

      if (limit === 0) {
        // No limit for this action
        return next();
      }

      // Check rate limit
      const limitCheck = await RateLimitTracker.checkLimit(
        req.user._id,
        req.user.walletAddress,
        action,
        limit,
        windowType
      );

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', limitCheck.limit);
      res.setHeader('X-RateLimit-Remaining', limitCheck.remaining);
      res.setHeader('X-RateLimit-Reset', limitCheck.resetAt.toISOString());

      if (!limitCheck.allowed) {
        return res.status(429).json({
          success: false,
          message: limitCheck.isBlocked
            ? 'You have been temporarily blocked due to rate limit violations'
            : 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          limit: limitCheck.limit,
          resetAt: limitCheck.resetAt,
          isBlocked: limitCheck.isBlocked,
          blockReason: limitCheck.reason
        });
      }

      // Increment counter
      await RateLimitTracker.increment(
        req.user._id,
        req.user.walletAddress,
        action,
        limit,
        windowType,
        req.ip
      );

      next();
    } catch (error) {
      logger.error('Rate limit error:', { error: error.message, stack: error.stack });
      // SECURITY FIX: Fail closed - don't allow request if rate limiting fails
      // This prevents DoS attacks when Redis is down
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again later.',
        code: 'RATE_LIMIT_SERVICE_ERROR'
      });
    }
  };
};

/**
 * IP-based rate limiting for unauthenticated requests
 * FIX H2.2: Now uses shared Map with automatic cleanup
 */
const ipRateLimit = (action, limit, windowType = 'minute') => {
  return async (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const key = `${ip}:${action}`;

    // Window duration in ms
    const windowMs = {
      'minute': 60 * 1000,
      'hour': 60 * 60 * 1000,
      'day': 24 * 60 * 60 * 1000
    };

    const duration = windowMs[windowType] || windowMs.minute;

    // Get or create limit data
    let limitData = ipLimits.get(key);

    if (!limitData || now - limitData.windowStart > duration) {
      // Create new window
      limitData = {
        windowStart: now,
        count: 0,
        lastAccess: now
      };
      ipLimits.set(key, limitData);
    } else {
      // Update last access time
      limitData.lastAccess = now;
    }

    // Check limit
    if (limitData.count >= limit) {
      const resetAt = new Date(limitData.windowStart + duration);

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', resetAt.toISOString());

      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        resetAt
      });
    }

    // Increment counter
    limitData.count++;

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - limitData.count);
    res.setHeader('X-RateLimit-Reset', new Date(limitData.windowStart + duration).toISOString());

    next();
  };
};

/**
 * Special rate limit for blockchain transactions
 */
const blockchainTxRateLimit = async (req, res, next) => {
  return rateLimitByRole('blockchain_tx', 'hour')(req, res, next);
};

/**
 * Custom action rate limit
 */
const customActionLimit = (action, maxCount, windowMinutes) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const windowType = windowMinutes <= 1 ? 'minute' :
                      windowMinutes <= 60 ? 'hour' : 'day';

    const limitCheck = await RateLimitTracker.checkLimit(
      req.user._id,
      req.user.walletAddress,
      action,
      maxCount,
      windowType
    );

    res.setHeader('X-RateLimit-Limit', limitCheck.limit);
    res.setHeader('X-RateLimit-Remaining', limitCheck.remaining);
    res.setHeader('X-RateLimit-Reset', limitCheck.resetAt.toISOString());

    if (!limitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded for this action',
        code: 'RATE_LIMIT_EXCEEDED',
        limit: limitCheck.limit,
        resetAt: limitCheck.resetAt
      });
    }

    await RateLimitTracker.increment(
      req.user._id,
      req.user.walletAddress,
      action,
      maxCount,
      windowType,
      req.ip
    );

    next();
  };
};

/**
 * Rate limit for product creation (farmers only)
 */
const productCreationLimit = async (req, res, next) => {
  return rateLimitByRole('product_creation', 'day')(req, res, next);
};

/**
 * Rate limit for order creation
 */
const orderCreationLimit = async (req, res, next) => {
  return rateLimitByRole('order_creation', 'day')(req, res, next);
};

/**
 * Rate limit for login attempts
 */
const loginAttemptLimit = async (req, res, next) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return next();
  }

  // Use IP + wallet address for rate limiting
  const key = `${req.ip}:${walletAddress.toLowerCase()}`;

  // 5 attempts per 15 minutes
  return customActionLimit('login_attempt', 5, 15)(req, res, next);
};

/**
 * Global API rate limit
 */
const globalApiLimit = (req, res, next) => {
  if (req.user) {
    return rateLimitByRole('api_call', 'minute')(req, res, next);
  } else {
    return ipRateLimit('api_call', 20, 'minute')(req, res, next);
  }
};

/**
 * Get rate limit statistics (for monitoring/debugging)
 */
const getRateLimitStats = () => {
  return {
    totalEntries: ipLimits.size,
    cleanupIntervalActive: !!cleanupIntervalId
  };
};

module.exports = {
  rateLimitByRole,
  ipRateLimit,
  blockchainTxRateLimit,
  customActionLimit,
  productCreationLimit,
  orderCreationLimit,
  loginAttemptLimit,
  globalApiLimit,
  getRateLimitStats,
  stopCleanupInterval // For testing
};
