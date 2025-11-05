const jwt = require('jsonwebtoken');
const { AppError, asyncHandler } = require('./errorHandler');
const User = require('../models/User.model');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401, 'NO_TOKEN'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-wallet.transactions');

    if (!req.user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    if (!req.user.isActive) {
      return next(new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED'));
    }

    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401, 'INVALID_TOKEN'));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized', 401, 'NO_USER'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

exports.verifyWalletOwnership = asyncHandler(async (req, res, next) => {
  const { walletAddress } = req.params;

  if (!walletAddress) {
    return next(new AppError('Wallet address required', 400, 'MISSING_WALLET'));
  }

  if (req.user.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    return next(new AppError('Not authorized to access this wallet', 403, 'FORBIDDEN'));
  }

  next();
});
