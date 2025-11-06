const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const crypto = require('crypto');
const User = require('../models/User.model'); // FIX #12: Using consolidated User model
const Role = require('../models/Role.model');
const AuditLog = require('../models/AuditLog.model');
const redisService = require('./redis.service');

// FIX #9: Removed in-memory storage - now using Redis
// const nonceStore = new Map();
// const refreshTokenStore = new Map();
// const blacklistedTokens = new Set();

/**
 * Authentication Service
 * Handles user registration, login, logout, and token management
 */
class AuthService {
  /**
   * Generate a unique nonce for wallet signature
   * @param {string} walletAddress - User's wallet address
   * @returns {object} - Nonce and timestamp
   */
  async generateNonce(walletAddress) {
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();

    // FIX #9: Store nonce in Redis with 5-minute expiry
    await redisService.storeNonce(walletAddress.toLowerCase(), nonce, 300);

    return { nonce, timestamp };
  }

  /**
   * Register a new user
   * @param {object} data - Registration data
   * @returns {object} - User and tokens
   */
  async register(data) {
    const { walletAddress, role, profile, signature, message, nonce } = data;

    // Validate wallet address
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address format');
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Check if wallet already registered
    const existingUser = await User.findOne({ walletAddress: normalizedAddress });
    if (existingUser) {
      throw new Error('Wallet address already registered');
    }

    // Verify signature if provided
    if (signature && message && nonce) {
      await this.verifyWalletOwnership({
        walletAddress: normalizedAddress,
        signature,
        message,
        nonce
      });
    }

    // Validate role selection
    const validRoles = ['FARMER', 'DISTRIBUTOR', 'RETAILER', 'CONSUMER'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be one of: FARMER, DISTRIBUTOR, RETAILER, CONSUMER');
    }

    // Get role details
    const roleData = await Role.findOne({ name: role });
    if (!roleData) {
      throw new Error('Role not found in system');
    }

    // Create user
    const user = new User({
      walletAddress: normalizedAddress,
      roles: [role],
      primaryRole: role,
      permissions: [],
      profile: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        businessName: profile.businessName,
        businessType: profile.businessType
      },
      verification: {
        isVerified: false,
        kycStatus: roleData.requirements.requiresKYC ? 'not_started' : 'not_started',
        verificationLevel: 0
      },
      status: {
        isActive: true,
        isSuspended: false
      },
      blockchain: {
        hasBlockchainRole: false
      }
    });

    await user.save();

    // Generate tokens
    const tokens = this._generateTokens(user);

    // FIX #9: Store refresh token in Redis
    await redisService.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    // Log registration
    await AuditLog.logAction({
      user: user._id,
      walletAddress: normalizedAddress,
      action: 'auth:register',
      actionCategory: 'authentication',
      resource: 'User',
      resourceId: user._id.toString(),
      success: true,
      metadata: {
        roleAtTime: role,
        registrationMethod: signature ? 'wallet_signature' : 'direct'
      }
    });

    // Initiate KYC process if required
    if (roleData.requirements.requiresKYC) {
      // TODO: Send KYC initiation email/notification
      console.log(`KYC required for user ${user._id}. Initiation email should be sent.`);
    }

    return {
      user: user.toPublicJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      requiresKYC: roleData.requirements.requiresKYC
    };
  }

  /**
   * Login user with wallet signature
   * @param {object} data - Login data
   * @returns {object} - User and tokens
   */
  async login(data) {
    const { walletAddress, signature, message, nonce, ipAddress } = data;

    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address format');
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Find user
    const user = await User.findOne({ walletAddress: normalizedAddress });
    if (!user) {
      throw new Error('User not found. Please register first.');
    }

    // Check if account is active
    if (!user.status.isActive) {
      throw new Error('Account is deactivated. Please contact support.');
    }

    // Check if account is suspended
    if (user.status.isSuspended) {
      throw new Error(`Account is suspended: ${user.status.suspensionReason}`);
    }

    // Check if account is locked
    if (user.security.accountLockedUntil && user.security.accountLockedUntil > new Date()) {
      const unlockTime = user.security.accountLockedUntil.toISOString();
      throw new Error(`Account is locked until ${unlockTime} due to failed login attempts.`);
    }

    // Verify wallet ownership
    try {
      await this.verifyWalletOwnership({
        walletAddress: normalizedAddress,
        signature,
        message,
        nonce
      });

      // Reset failed attempts on successful verification
      user.security.failedLoginAttempts = 0;
      user.security.accountLockedUntil = null;
    } catch (error) {
      // Increment failed attempts
      user.security.failedLoginAttempts = (user.security.failedLoginAttempts || 0) + 1;
      user.security.lastLoginIP = ipAddress;

      // Lock account after 5 failed attempts
      if (user.security.failedLoginAttempts >= 5) {
        user.security.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await user.save();

      // Log failed attempt
      await AuditLog.logAction({
        user: user._id,
        walletAddress: normalizedAddress,
        action: 'auth:login_failed',
        actionCategory: 'authentication',
        ipAddress,
        success: false,
        errorMessage: error.message,
        metadata: {
          failedAttempts: user.security.failedLoginAttempts
        },
        securityFlags: {
          isSuspicious: user.security.failedLoginAttempts >= 3
        }
      });

      throw new Error('Signature verification failed. Invalid signature.');
    }

    // Update last login
    user.security.lastLogin = new Date();
    user.security.lastLoginIP = ipAddress;
    await user.save();

    // Generate tokens
    const tokens = this._generateTokens(user);

    // FIX #9: Store refresh token in Redis
    await redisService.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    // Log successful login
    await AuditLog.logAction({
      user: user._id,
      walletAddress: normalizedAddress,
      action: 'auth:login',
      actionCategory: 'authentication',
      ipAddress,
      success: true,
      metadata: {
        roleAtTime: user.primaryRole,
        loginMethod: 'wallet_signature'
      }
    });

    return {
      user: this._sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    };
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {object} - New tokens
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    // FIX #9: Check if token is blacklisted in Redis
    const isBlacklisted = await redisService.isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new Error('Refresh token has been revoked');
    }

    // Verify refresh token
    // FIX #14: Use JWT_REFRESH_SECRET (no fallback - validated at startup)
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }

    // FIX #9: Check if refresh token exists in Redis
    const storedToken = await redisService.getRefreshToken(decoded.userId.toString());
    if (!storedToken || storedToken !== refreshToken) {
      throw new Error('Refresh token not found or has been revoked');
    }

    // Fetch user with current roles
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.status.isActive || user.status.isSuspended) {
      throw new Error('User account is not active');
    }

    // Generate new tokens
    const tokens = this._generateTokens(user);

    // Optionally rotate refresh token (recommended for security)
    if (process.env.REFRESH_TOKEN_ROTATION === 'true') {
      // FIX #9: Revoke old refresh token in Redis
      await redisService.deleteRefreshToken(user._id.toString());
      
      // Blacklist old token
      const decoded = jwt.decode(refreshToken);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      await redisService.blacklistToken(refreshToken, expiresIn);

      // Store new refresh token
      await redisService.storeRefreshToken(user._id.toString(), tokens.refreshToken);
    } else {
      // Keep same refresh token
      tokens.refreshToken = refreshToken;
    }

    // Log token refresh
    await AuditLog.logAction({
      user: user._id,
      walletAddress: user.walletAddress,
      action: 'auth:refresh_token',
      actionCategory: 'authentication',
      success: true,
      metadata: {
        roleAtTime: user.primaryRole,
        tokenRotated: process.env.REFRESH_TOKEN_ROTATION === 'true'
      }
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    };
  }

  /**
   * Logout user and invalidate tokens
   * @param {string} userId - User ID
   * @param {string} accessToken - Access token to blacklist
   * @param {string} refreshToken - Refresh token to revoke
   */
  async logout(userId, accessToken, refreshToken) {
    // FIX #9: Blacklist access token in Redis
    if (accessToken) {
      const decoded = jwt.decode(accessToken);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await redisService.blacklistToken(accessToken, expiresIn);
      }
    }

    // FIX #9: Revoke refresh token in Redis
    if (refreshToken) {
      await redisService.deleteRefreshToken(userId.toString());
      
      const decoded = jwt.decode(refreshToken);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await redisService.blacklistToken(refreshToken, expiresIn);
      }
    }

    // Log logout
    await AuditLog.logAction({
      user: userId,
      action: 'auth:logout',
      actionCategory: 'authentication',
      success: true
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Verify wallet ownership via signature
   * @param {object} data - Verification data
   * @returns {boolean} - Verification result
   */
  async verifyWalletOwnership(data) {
    const { walletAddress, signature, message, nonce } = data;

    // FIX #9 & #10: Get stored nonce from Redis
    const storedNonceData = await redisService.getNonce(walletAddress.toLowerCase());
    
    if (!storedNonceData) {
      throw new Error('Nonce not found. Please request a new nonce.');
    }

    // FIX #10: Verify nonce matches (nonce validation)
    if (storedNonceData.nonce !== nonce) {
      throw new Error('Invalid nonce');
    }

    // Check if nonce has expired (Redis handles TTL, but double-check timestamp)
    const nonceAge = Date.now() - storedNonceData.timestamp;
    if (nonceAge > 5 * 60 * 1000) { // 5 minutes
      await redisService.deleteNonce(walletAddress.toLowerCase());
      throw new Error('Nonce expired. Please request a new nonce.');
    }

    // Verify message format
    const expectedMessagePrefix = `Sign this message to login to AgriChain.\nNonce: ${nonce}\nTimestamp: `;
    if (!message.startsWith(expectedMessagePrefix)) {
      throw new Error('Invalid message format');
    }

    // Extract and verify timestamp
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (!timestampMatch) {
      throw new Error('Message missing timestamp');
    }

    const messageTimestamp = parseInt(timestampMatch[1]);
    
    // Check timestamp is not too old (5 minutes)
    if (Date.now() - messageTimestamp > 5 * 60 * 1000) {
      throw new Error('Message timestamp expired');
    }

    // Verify signature
    let recoveredAddress;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch (error) {
      throw new Error('Invalid signature format');
    }

    // Check if recovered address matches wallet address
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Signature verification failed. Address mismatch.');
    }

    // FIX #9: Delete used nonce from Redis to prevent replay attacks
    await redisService.deleteNonce(walletAddress.toLowerCase());

    return true;
  }

  /**
   * Change password (additional security layer)
   * @param {string} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password if one exists
    if (user.security.passwordHash) {
      const isValid = await user.verifyPassword(oldPassword);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Set new password
    await user.setPassword(newPassword);

    // Log password change
    await AuditLog.logAction({
      user: user._id,
      walletAddress: user.walletAddress,
      action: 'auth:change_password',
      actionCategory: 'authentication',
      success: true,
      metadata: {
        hashedPasswordBefore: !!user.security.passwordHash
      },
      securityFlags: {
        isCritical: true
      }
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Check if token is blacklisted
   * FIX #9 & #11: Check Redis instead of in-memory
   * @param {string} token - Token to check
   * @returns {boolean}
   */
  async isTokenBlacklisted(token) {
    return await redisService.isTokenBlacklisted(token);
  }

  /**
   * Generate access and refresh tokens
   * @private
   */
  _generateTokens(user) {
    const payload = {
      userId: user._id.toString(),
      walletAddress: user.walletAddress,
      roles: user.roles,
      primaryRole: user.primaryRole
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    // FIX #14: No fallback - JWT_REFRESH_SECRET is required (validated at startup)
    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  // FIX #9: Removed in-memory helper methods - now using Redis service
  // _storeRefreshToken, _revokeRefreshToken, _cleanupExpiredNonces

  /**
   * Sanitize user object for response
   * @private
   */
  _sanitizeUser(user) {
    return {
      id: user._id,
      walletAddress: user.walletAddress,
      roles: user.roles,
      primaryRole: user.primaryRole,
      permissions: user.permissions,
      profile: {
        name: user.profile.name,
        email: user.profile.email,
        avatar: user.profile.avatar,
        businessName: user.profile.businessName
      },
      verification: {
        isVerified: user.verification.isVerified,
        kycStatus: user.verification.kycStatus,
        verificationLevel: user.verification.verificationLevel
      },
      status: {
        isActive: user.status.isActive,
        isSuspended: user.status.isSuspended
      },
      createdAt: user.createdAt
    };
  }
}

module.exports = new AuthService();
