const { asyncHandler, AppError } = require('../middleware/errorHandler');
const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const logger = require('../utils/logger');

/**
 * @desc    Get platform analytics
 * @route   GET /api/v1/admin/analytics
 * @access  Private (Admin)
 */
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const { period = '30' } = req.query; // days
  const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

  // User analytics
  const [
    totalUsers,
    newUsers,
    usersByRole,
    verifiedUsers
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: daysAgo } }),
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    User.countDocuments({ 'verification.isVerified': true })
  ]);

  // Product analytics
  const [
    totalProducts,
    newProducts,
    productsByCategory,
    activeProducts
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ createdAt: { $gte: daysAgo } }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$basicInfo.category', count: { $sum: 1 } } }
    ]),
    Product.countDocuments({ isActive: true })
  ]);

  // Order analytics
  const [
    totalOrders,
    newOrders,
    ordersByStatus,
    completedOrders,
    totalRevenue
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: daysAgo } }),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Order.countDocuments({ status: 'delivered' }),
    Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$orderDetails.totalAmount' } } }
    ])
  ]);

  // Payment analytics
  const [
    totalPayments,
    successfulPayments,
    failedPayments,
    disputedOrders
  ] = await Promise.all([
    Order.countDocuments({ 'payment.paymentId': { $exists: true } }),
    Order.countDocuments({ 'payment.status': 'completed' }),
    Order.countDocuments({ 'payment.status': 'failed' }),
    Order.countDocuments({ 'dispute.isDisputed': true, 'dispute.status': 'open' })
  ]);

  // Growth trends (daily for the period)
  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: daysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const orderGrowth = await Order.aggregate([
    { $match: { createdAt: { $gte: daysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$orderDetails.totalAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        new: newUsers,
        byRole: usersByRole,
        verified: verifiedUsers
      },
      products: {
        total: totalProducts,
        new: newProducts,
        byCategory: productsByCategory,
        active: activeProducts
      },
      orders: {
        total: totalOrders,
        new: newOrders,
        byStatus: ordersByStatus,
        completed: completedOrders
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        failed: failedPayments,
        disputed: disputedOrders
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        period: `${period} days`
      },
      growth: {
        users: userGrowth,
        orders: orderGrowth
      }
    }
  });
});

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin)
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const filter = {};
  
  if (req.query.role) {
    filter.role = req.query.role;
  }
  
  if (req.query.verified !== undefined) {
    filter['verification.isVerified'] = req.query.verified === 'true';
  }

  if (req.query.kycStatus) {
    filter['verification.kycStatus'] = req.query.kycStatus;
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
 * @desc    Update user status (Admin)
 * @route   PUT /api/v1/admin/users/:userId
 * @access  Private (Admin)
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { isActive, kycStatus, role } = req.body;

  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Update fields if provided
  if (isActive !== undefined) {
    user.isActive = isActive;
  }

  if (kycStatus) {
    user.verification.kycStatus = kycStatus;
    user.verification.isVerified = kycStatus === 'approved';
    if (kycStatus === 'approved') {
      user.verification.verifiedAt = new Date();
    }
  }

  if (role && ['farmer', 'distributor', 'retailer', 'consumer', 'admin'].includes(role)) {
    user.role = role;
  }

  await user.save();

  logger.info(`User ${user.walletAddress} updated by admin ${req.user.walletAddress}`);

  res.status(200).json({
    success: true,
    data: { user },
    message: 'User updated successfully'
  });
});

/**
 * @desc    Get all products (Admin)
 * @route   GET /api/v1/admin/products
 * @access  Private (Admin)
 */
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const filter = {};
  
  if (req.query.category) {
    filter['basicInfo.category'] = req.query.category;
  }
  
  if (req.query.status) {
    filter['supplyChain.status'] = req.query.status;
  }

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('farmer', 'profile.name walletAddress rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      products,
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
 * @desc    Update product status (Admin)
 * @route   PUT /api/v1/admin/products/:productId
 * @access  Private (Admin)
 */
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;

  const product = await Product.findOne({
    $or: [
      { _id: req.params.productId },
      { productId: req.params.productId }
    ]
  });

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  if (isActive !== undefined) {
    product.isActive = isActive;
  }

  await product.save();

  logger.info(`Product ${product.productId} updated by admin ${req.user.walletAddress}`);

  res.status(200).json({
    success: true,
    data: { product },
    message: 'Product updated successfully'
  });
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/v1/admin/orders
 * @access  Private (Admin)
 */
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.disputed !== undefined) {
    filter['dispute.isDisputed'] = req.query.disputed === 'true';
  }

  if (req.query.paymentStatus) {
    filter['payment.status'] = req.query.paymentStatus;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('buyer', 'profile.name walletAddress')
      .populate('seller', 'profile.name walletAddress')
      .populate('product', 'basicInfo.name productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders,
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
 * @desc    Get disputed orders (Admin)
 * @route   GET /api/v1/admin/disputes
 * @access  Private (Admin)
 */
exports.getDisputes = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { 'dispute.isDisputed': true };

  if (req.query.status) {
    filter['dispute.status'] = req.query.status;
  }

  const [disputes, total] = await Promise.all([
    Order.find(filter)
      .populate('buyer', 'profile.name walletAddress')
      .populate('seller', 'profile.name walletAddress')
      .populate('product', 'basicInfo.name productId')
      .populate('dispute.raisedBy', 'profile.name walletAddress')
      .populate('dispute.resolvedBy', 'profile.name walletAddress')
      .sort({ 'dispute.raisedAt': -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      disputes,
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
 * @desc    Resolve dispute (Admin)
 * @route   PUT /api/v1/admin/disputes/:orderId/resolve
 * @access  Private (Admin)
 */
exports.resolveDispute = asyncHandler(async (req, res, next) => {
  const { resolution, refundBuyer, notes } = req.body;

  if (!resolution) {
    return next(new AppError('Please provide resolution', 400, 'MISSING_RESOLUTION'));
  }

  const order = await Order.findOne({
    $or: [
      { _id: req.params.orderId },
      { orderId: req.params.orderId }
    ]
  });

  if (!order) {
    return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
  }

  if (!order.dispute.isDisputed) {
    return next(new AppError('No dispute found for this order', 400, 'NO_DISPUTE'));
  }

  // Update dispute
  order.dispute.status = 'resolved';
  order.dispute.resolution = resolution;
  order.dispute.resolvedBy = req.user._id;
  order.dispute.resolvedAt = new Date();

  // Update payment status based on resolution
  if (refundBuyer) {
    order.payment.status = 'refunded';
    order.payment.refundedAt = new Date();
    order.status = 'refunded';
  } else {
    order.payment.status = 'completed';
    order.payment.paidAt = new Date();
    order.status = 'delivered';
  }

  await order.save();

  logger.info(`Dispute resolved for order ${order.orderId} by admin ${req.user.walletAddress}`);

  res.status(200).json({
    success: true,
    data: { order },
    message: 'Dispute resolved successfully'
  });
});

/**
 * @desc    Get platform statistics
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin)
 */
exports.getPlatformStats = asyncHandler(async (req, res, next) => {
  const [
    userStats,
    productStats,
    orderStats,
    revenueStats
  ] = await Promise.all([
    // User statistics
    User.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { isActive: true } }, { $count: 'count' }],
          verified: [{ $match: { 'verification.isVerified': true } }, { $count: 'count' }],
          byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }]
        }
      }
    ]),
    
    // Product statistics
    Product.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { isActive: true } }, { $count: 'count' }],
          byCategory: [
            { $match: { isActive: true } },
            { $group: { _id: '$basicInfo.category', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $match: { isActive: true } },
            { $group: { _id: '$supplyChain.status', count: { $sum: 1 } } }
          ]
        }
      }
    ]),
    
    // Order statistics
    Order.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byPaymentStatus: [{ $group: { _id: '$payment.status', count: { $sum: 1 } } }],
          disputed: [{ $match: { 'dispute.isDisputed': true } }, { $count: 'count' }]
        }
      }
    ]),
    
    // Revenue statistics
    Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$orderDetails.totalAmount' },
          averageOrderValue: { $avg: '$orderDetails.totalAmount' },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: userStats[0],
      products: productStats[0],
      orders: orderStats[0],
      revenue: revenueStats[0] || { totalRevenue: 0, averageOrderValue: 0, count: 0 }
    }
  });
});

/**
 * @desc    Get system health
 * @route   GET /api/v1/admin/health
 * @access  Private (Admin)
 */
exports.getSystemHealth = asyncHandler(async (req, res, next) => {
  const mongoose = require('mongoose');
  
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    database: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  };

  res.status(200).json({
    success: true,
    data: health
  });
});

/**
 * @desc    Get recent activity logs (Admin)
 * @route   GET /api/v1/admin/activity
 * @access  Private (Admin)
 */
exports.getActivityLogs = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 50;

  const [recentUsers, recentProducts, recentOrders] = await Promise.all([
    User.find()
      .select('profile.name walletAddress role createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Product.find()
      .populate('farmer', 'profile.name walletAddress')
      .select('productId basicInfo.name createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Order.find()
      .populate('buyer', 'profile.name walletAddress')
      .populate('seller', 'profile.name walletAddress')
      .select('orderId status orderDetails.totalAmount createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
  ]);

  res.status(200).json({
    success: true,
    data: {
      recentUsers,
      recentProducts,
      recentOrders
    }
  });
});
