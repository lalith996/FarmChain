const jwt = require('jsonwebtoken');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const User = require('../models/User.model'); // FIX #12: Use consolidated User model
const blockchainService = require('../config/blockchain');
const authService = require('../services/auth.service');

/**
 * Generate nonce for wallet signature
 * POST /api/auth/nonce
 */
exports.getNonce = asyncHandler(async (req, res, next) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return next(new AppError('Wallet address is required', 400, 'MISSING_WALLET'));
  }

  const result = await authService.generateNonce(walletAddress);

  // Format message for signing
  const message = `Sign this message to login to AgriChain.\nNonce: ${result.nonce}\nTimestamp: ${result.timestamp}`;

  res.json({
    success: true,
    data: {
      nonce: result.nonce,
      timestamp: result.timestamp,
      message
    }
  });
});

exports.register = asyncHandler(async (req, res, next) => {
  const { walletAddress, role, profile, signature, message, nonce } = req.body;

  // Validate required fields
  if (!walletAddress || !role || !profile) {
    return next(new AppError('Wallet address, role, and profile are required', 400, 'MISSING_FIELDS'));
  }

  if (!profile.name || !profile.email) {
    return next(new AppError('Name and email are required in profile', 400, 'INCOMPLETE_PROFILE'));
  }

  const result = await authService.register({
    walletAddress,
    role,
    profile,
    signature,
    message,
    nonce
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Registration successful'
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { walletAddress, signature, message, nonce } = req.body;

  // Validate required fields
  if (!walletAddress || !signature || !message || !nonce) {
    return next(new AppError('Wallet address, signature, message, and nonce are required', 400, 'MISSING_CREDENTIALS'));
  }

  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await authService.login({
    walletAddress,
    signature,
    message,
    nonce,
    ipAddress
  });

  res.status(200).json({
    success: true,
    data: result,
    message: 'Login successful'
  });
});

exports.verifyWallet = asyncHandler(async (req, res, next) => {
  const { walletAddress, signature, message } = req.body;

  const isValid = await blockchainService.verifyMessage(
    message,
    signature,
    walletAddress
  );

  res.status(200).json({
    success: true,
    data: {
      valid: isValid,
      walletAddress
    }
  });
});

exports.getMe = asyncHandler(async (req, res, next) => {
  // User is already attached by auth middleware
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        roles: user.roles,
        primaryRole: user.primaryRole,
        permissions: user.permissions,
        profile: {
          name: user.profile.name,
          email: user.profile.email,
          phone: user.profile.phone,
          avatar: user.profile.avatar,
          businessName: user.profile.businessName,
          businessType: user.profile.businessType
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
        createdAt: user.createdAt,
        lastLogin: user.security.lastLogin
      }
    }
  });
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400, 'MISSING_TOKEN'));
  }

  const result = await authService.refreshToken(refreshToken);

  res.json({
    success: true,
    data: result,
    message: 'Token refreshed successfully'
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const accessToken = req.token; // Set by auth middleware
  const { refreshToken } = req.body;

  await authService.logout(userId, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});
