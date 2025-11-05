const { asyncHandler, AppError } = require('../middleware/errorHandler');
const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const logger = require('../utils/logger');

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-__v');

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const allowedUpdates = [
    'profile.name',
    'profile.email',
    'profile.phone',
    'profile.avatar',
    'profile.location',
    'businessInfo'
  ];

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Update profile fields
  if (req.body.profile) {
    Object.keys(req.body.profile).forEach(key => {
      if (user.profile[key] !== undefined) {
        user.profile[key] = req.body.profile[key];
      }
    });
  }

  // Update business info for farmers
  if (req.body.businessInfo && user.role === 'farmer') {
    user.businessInfo = { ...user.businessInfo.toObject(), ...req.body.businessInfo };
  }

  await user.save();

  logger.info(`Profile updated for user: ${user.walletAddress}`);

  res.status(200).json({
    success: true,
    data: { user },
    message: 'Profile updated successfully'
  });
});

/**
 * @desc    Get user by wallet address or ID
 * @route   GET /api/v1/users/:userId
 * @access  Public
 */
exports.getUserById = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Try to find by ID or wallet address
  const user = await User.findOne({
    $or: [
      { _id: userId },
      { walletAddress: userId.toLowerCase() }
    ]
  }).select('-verification.documents -businessInfo.registrationNumber');

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Get user's products count if farmer
  let productsCount = 0;
  if (user.role === 'farmer') {
    productsCount = await Product.countDocuments({ farmer: user._id, isActive: true });
  }

  // Get completed orders count
  const ordersCount = await Order.countDocuments({
    $or: [{ buyer: user._id }, { seller: user._id }],
    status: 'delivered'
  });

  res.status(200).json({
    success: true,
    data: {
      user,
      stats: {
        productsCount,
        ordersCount
      }
    }
  });
});

/**
 * @desc    Get all users with filters
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.verified) {
    filter['verification.isVerified'] = req.query.verified === 'true';
  }

  if (req.query.kycStatus) {
    filter['verification.kycStatus'] = req.query.kycStatus;
  }

  if (req.query.search) {
    filter.$or = [
      { 'profile.name': { $regex: req.query.search, $options: 'i' } },
      { 'profile.email': { $regex: req.query.search, $options: 'i' } },
      { walletAddress: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-verification.documents')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * @desc    Upload KYC documents
 * @route   POST /api/v1/users/kyc/upload
 * @access  Private
 */
exports.uploadKYC = asyncHandler(async (req, res, next) => {
  const { documentType, documentHash, documentNumber } = req.body;

  if (!documentType || !documentHash) {
    return next(new AppError('Please provide document type and hash', 400, 'MISSING_FIELDS'));
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Add document
  user.verification.documents.push({
    type: documentType,
    hash: documentHash,
    number: documentNumber,
    uploadedAt: new Date()
  });

  user.verification.kycStatus = 'pending';

  await user.save();

  logger.info(`KYC document uploaded by user: ${user.walletAddress}`);

  res.status(200).json({
    success: true,
    data: { user },
    message: 'KYC document uploaded successfully. Pending admin verification.'
  });
});

/**
 * @desc    Verify user KYC (Admin only)
 * @route   PUT /api/v1/users/:userId/verify
 * @access  Private (Admin)
 */
exports.verifyKYC = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { kycStatus, notes } = req.body;

  if (!kycStatus || !['approved', 'rejected'].includes(kycStatus)) {
    return next(new AppError('Please provide valid KYC status (approved/rejected)', 400, 'INVALID_STATUS'));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  user.verification.kycStatus = kycStatus;
  user.verification.isVerified = kycStatus === 'approved';
  user.verification.verifiedAt = kycStatus === 'approved' ? new Date() : null;

  await user.save();

  logger.info(`KYC ${kycStatus} for user: ${user.walletAddress} by admin: ${req.user.walletAddress}`);

  res.status(200).json({
    success: true,
    data: { user },
    message: `User KYC ${kycStatus} successfully`
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/account
 * @access  Private
 */
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Check for active orders
  const activeOrders = await Order.countDocuments({
    $or: [{ buyer: user._id }, { seller: user._id }],
    status: { $in: ['pending', 'confirmed', 'payment_initiated', 'payment_completed', 'processing', 'shipped', 'in_transit'] }
  });

  if (activeOrders > 0) {
    return next(new AppError('Cannot delete account with active orders', 400, 'ACTIVE_ORDERS_EXIST'));
  }

  // Deactivate instead of hard delete
  user.isActive = false;
  await user.save();

  logger.info(`Account deactivated: ${user.walletAddress}`);

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

/**
 * @desc    Get user dashboard stats
 * @route   GET /api/v1/users/dashboard
 * @access  Private
 */
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  let stats = {};

  if (userRole === 'farmer') {
    // Farmer dashboard
    const [totalProducts, activeProducts, totalOrders, totalRevenue, recentOrders] = await Promise.all([
      Product.countDocuments({ farmer: userId }),
      Product.countDocuments({ farmer: userId, isActive: true }),
      Order.countDocuments({ seller: userId }),
      Order.aggregate([
        { $match: { seller: userId, 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$orderDetails.totalAmount' } } }
      ]),
      Order.find({ seller: userId })
        .populate('buyer', 'profile.name walletAddress')
        .populate('product', 'basicInfo.name basicInfo.images')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    stats = {
      totalProducts,
      activeProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders
    };
  } else if (userRole === 'distributor' || userRole === 'retailer') {
    // Distributor/Retailer dashboard
    const [totalPurchases, activeOrders, totalSpent, recentPurchases] = await Promise.all([
      Order.countDocuments({ buyer: userId }),
      Order.countDocuments({ buyer: userId, status: { $in: ['confirmed', 'processing', 'shipped', 'in_transit'] } }),
      Order.aggregate([
        { $match: { buyer: userId, 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$orderDetails.totalAmount' } } }
      ]),
      Order.find({ buyer: userId })
        .populate('seller', 'profile.name walletAddress')
        .populate('product', 'basicInfo.name basicInfo.images')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    stats = {
      totalPurchases,
      activeOrders,
      totalSpent: totalSpent[0]?.total || 0,
      recentPurchases
    };
  } else {
    // Consumer dashboard
    const [totalOrders, activeOrders, totalSpent, recentOrders] = await Promise.all([
      Order.countDocuments({ buyer: userId }),
      Order.countDocuments({ buyer: userId, status: { $in: ['confirmed', 'processing', 'shipped', 'in_transit'] } }),
      Order.aggregate([
        { $match: { buyer: userId, 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$orderDetails.totalAmount' } } }
      ]),
      Order.find({ buyer: userId })
        .populate('seller', 'profile.name walletAddress')
        .populate('product', 'basicInfo.name basicInfo.images')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    stats = {
      totalOrders,
      activeOrders,
      totalSpent: totalSpent[0]?.total || 0,
      recentOrders
    };
  }

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Search users
 * @route   GET /api/v1/users/search
 * @access  Public
 */
exports.searchUsers = asyncHandler(async (req, res, next) => {
  const { q, role } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  if (!q) {
    return next(new AppError('Please provide search query', 400, 'MISSING_QUERY'));
  }

  // Build search filter
  const filter = {
    isActive: true,
    $or: [
      { 'profile.name': { $regex: q, $options: 'i' } },
      { walletAddress: { $regex: q, $options: 'i' } },
      { 'profile.email': { $regex: q, $options: 'i' } }
    ]
  };

  if (role) {
    filter.role = role;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('profile.name profile.avatar walletAddress role rating verification.isVerified')
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      searchQuery: q
    }
  });
});

/**
 * @desc    Get user statistics (Admin)
 * @route   GET /api/v1/users/stats/overview
 * @access  Private (Admin)
 */
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const [totalUsers, usersByRole, verifiedUsers, kycPending, recentUsers] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    User.countDocuments({ 'verification.isVerified': true }),
    User.countDocuments({ 'verification.kycStatus': 'pending' }),
    User.find({ isActive: true })
      .select('profile.name walletAddress role createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      usersByRole,
      verifiedUsers,
      kycPending,
      recentUsers
    }
  });
});
