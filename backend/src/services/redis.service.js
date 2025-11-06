const Redis = require('redis');
const logger = require('../utils/logger');

/**
 * Redis Service
 * Handles all Redis operations for token storage, nonces, and caching
 * FIX #9: Replace in-memory storage with persistent Redis storage
 */
class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      this.client = Redis.createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
        },
        password: process.env.REDIS_PASSWORD || undefined,
        database: process.env.REDIS_DB || 0,
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis Client Ready');
      });

      this.client.on('reconnecting', () => {
        logger.warn('Redis Client Reconnecting');
      });

      await this.client.connect();
      
      logger.info('✅ Redis connection established');
      return true;
    } catch (error) {
      logger.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis connection closed');
    }
  }

  /**
   * Check if Redis is connected
   */
  isReady() {
    return this.isConnected && this.client;
  }

  // ==================== NONCE MANAGEMENT ====================

  /**
   * Store nonce for wallet address
   * @param {string} walletAddress - Wallet address
   * @param {string} nonce - Generated nonce
   * @param {number} expiresIn - Expiry time in seconds (default: 300 = 5 minutes)
   */
  async storeNonce(walletAddress, nonce, expiresIn = 300) {
    const key = `nonce:${walletAddress.toLowerCase()}`;
    const value = JSON.stringify({
      nonce,
      timestamp: Date.now(),
    });
    
    await this.client.setEx(key, expiresIn, value);
    logger.debug(`Nonce stored for ${walletAddress}`);
  }

  /**
   * Get nonce for wallet address
   * @param {string} walletAddress - Wallet address
   * @returns {object|null} - Nonce data or null if not found/expired
   */
  async getNonce(walletAddress) {
    const key = `nonce:${walletAddress.toLowerCase()}`;
    const value = await this.client.get(key);
    
    if (!value) {
      return null;
    }
    
    return JSON.parse(value);
  }

  /**
   * Delete nonce for wallet address
   * @param {string} walletAddress - Wallet address
   */
  async deleteNonce(walletAddress) {
    const key = `nonce:${walletAddress.toLowerCase()}`;
    await this.client.del(key);
    logger.debug(`Nonce deleted for ${walletAddress}`);
  }

  // ==================== TOKEN BLACKLIST ====================

  /**
   * Add token to blacklist
   * @param {string} token - JWT token
   * @param {number} expiresIn - Time until token naturally expires (in seconds)
   */
  async blacklistToken(token, expiresIn) {
    const key = `blacklist:${token}`;
    await this.client.setEx(key, expiresIn, '1');
    logger.debug('Token blacklisted');
  }

  /**
   * Check if token is blacklisted
   * @param {string} token - JWT token
   * @returns {boolean} - True if blacklisted
   */
  async isTokenBlacklisted(token) {
    const key = `blacklist:${token}`;
    const result = await this.client.get(key);
    return result === '1';
  }

  // ==================== REFRESH TOKEN MANAGEMENT ====================

  /**
   * Store refresh token for user
   * @param {string} userId - User ID
   * @param {string} refreshToken - Refresh token
   * @param {number} expiresIn - Expiry time in seconds (default: 7 days)
   */
  async storeRefreshToken(userId, refreshToken, expiresIn = 7 * 24 * 60 * 60) {
    const key = `refresh:${userId}`;
    await this.client.setEx(key, expiresIn, refreshToken);
    logger.debug(`Refresh token stored for user ${userId}`);
  }

  /**
   * Get refresh token for user
   * @param {string} userId - User ID
   * @returns {string|null} - Refresh token or null
   */
  async getRefreshToken(userId) {
    const key = `refresh:${userId}`;
    return await this.client.get(key);
  }

  /**
   * Delete refresh token for user
   * @param {string} userId - User ID
   */
  async deleteRefreshToken(userId) {
    const key = `refresh:${userId}`;
    await this.client.del(key);
    logger.debug(`Refresh token deleted for user ${userId}`);
  }

  /**
   * Delete all refresh tokens for user (logout from all devices)
   * @param {string} userId - User ID
   */
  async deleteAllRefreshTokens(userId) {
    const pattern = `refresh:${userId}*`;
    const keys = await this.client.keys(pattern);
    
    if (keys.length > 0) {
      await this.client.del(keys);
      logger.debug(`All refresh tokens deleted for user ${userId}`);
    }
  }

  // ==================== RATE LIMITING ====================

  /**
   * Increment rate limit counter
   * @param {string} key - Rate limit key (e.g., 'ratelimit:ip:127.0.0.1')
   * @param {number} windowSeconds - Time window in seconds
   * @returns {number} - Current count
   */
  async incrementRateLimit(key, windowSeconds) {
    const count = await this.client.incr(key);
    
    // Set expiry on first increment
    if (count === 1) {
      await this.client.expire(key, windowSeconds);
    }
    
    return count;
  }

  /**
   * Get rate limit count
   * @param {string} key - Rate limit key
   * @returns {number} - Current count
   */
  async getRateLimitCount(key) {
    const count = await this.client.get(key);
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Reset rate limit counter
   * @param {string} key - Rate limit key
   */
  async resetRateLimit(key) {
    await this.client.del(key);
  }

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Store session data
   * @param {string} sessionId - Session ID
   * @param {object} data - Session data
   * @param {number} expiresIn - Expiry time in seconds
   */
  async storeSession(sessionId, data, expiresIn = 24 * 60 * 60) {
    const key = `session:${sessionId}`;
    await this.client.setEx(key, expiresIn, JSON.stringify(data));
  }

  /**
   * Get session data
   * @param {string} sessionId - Session ID
   * @returns {object|null} - Session data or null
   */
  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Delete session
   * @param {string} sessionId - Session ID
   */
  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    await this.client.del(key);
  }

  // ==================== CACHING ====================

  /**
   * Set cache value
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} expiresIn - Expiry time in seconds
   */
  async setCache(key, value, expiresIn = 3600) {
    const cacheKey = `cache:${key}`;
    const serialized = JSON.stringify(value);
    await this.client.setEx(cacheKey, expiresIn, serialized);
  }

  /**
   * Get cache value
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null
   */
  async getCache(key) {
    const cacheKey = `cache:${key}`;
    const value = await this.client.get(cacheKey);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Delete cache value
   * @param {string} key - Cache key
   */
  async deleteCache(key) {
    const cacheKey = `cache:${key}`;
    await this.client.del(cacheKey);
  }

  /**
   * Delete cache by pattern
   * @param {string} pattern - Pattern to match (e.g., 'user:*')
   */
  async deleteCacheByPattern(pattern) {
    const cachePattern = `cache:${pattern}`;
    const keys = await this.client.keys(cachePattern);
    
    if (keys.length > 0) {
      await this.client.del(keys);
      logger.debug(`Deleted ${keys.length} cache entries matching ${pattern}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get Redis info
   * @returns {object} - Redis server info
   */
  async getInfo() {
    const info = await this.client.info();
    return info;
  }

  /**
   * Ping Redis server
   * @returns {string} - 'PONG' if successful
   */
  async ping() {
    return await this.client.ping();
  }

  /**
   * Flush all data (USE WITH CAUTION)
   */
  async flushAll() {
    if (process.env.NODE_ENV !== 'production') {
      await this.client.flushAll();
      logger.warn('⚠️  Redis database flushed');
    } else {
      throw new Error('Cannot flush Redis in production');
    }
  }
}

// Export singleton instance
const redisService = new RedisService();
module.exports = redisService;
