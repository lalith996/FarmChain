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
  const { days = '30' } = req.query;
  const period = parseInt(days);
  const daysAgo = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
  
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // User analytics
  const [
    totalUsers,
    thisMonthUsers,
    lastMonthUsers,
    usersByRole
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: thisMonthStart } }),
    User.countDocuments({ 
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } 
    }),
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ])
  ]);

  // Order analytics
  const [
    totalOrders,
    thisMonthOrders,
    lastMonthOrders,
    ordersByStatus
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: thisMonthStart } }),
    Order.countDocuments({ 
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } 
    }),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  // Revenue analytics
  const [
    totalRevenueData,
    thisMonthRevenueData,
    lastMonthRevenueData
  ] = await Promise.all([
    Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$orderDetails.totalAmount' } } }
    ]),
    Order.aggregate([
      { 
        $match: { 
          'payment.status': 'completed',
          createdAt: { $gte: thisMonthStart }
        } 
      },
      { $group: { _id: null, total: { $sum: '$orderDetails.totalAmount' } } }
    ]),
    Order.aggregate([
      { 
        $match: { 
          'payment.status': 'completed',
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        } 
      },
      { $group: { _id: null, total: { $sum: '$orderDetails.totalAmount' } } }
    ])
  ]);

  const totalRevenue = totalRevenueData[0]?.total || 0;
  const thisMonthRevenue = thisMonthRevenueData[0]?.total || 0;
  const lastMonthRevenue = lastMonthRevenueData[0]?.total || 0;

  // Calculate growth percentages
  const userGrowth = lastMonthUsers > 0 
    ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 
    : 0;
  const orderGrowth = lastMonthOrders > 0 
    ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 
    : 0;
  const revenueGrowth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Monthly trends (last 12 months)
  const revenueByMonth = await Order.aggregate([
    { 
      $match: { 
        'payment.status': 'completed',
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) }
      } 
    },
    {
      $group: {
        _id: { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$orderDetails.totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const usersByMonth = await User.aggregate([
    {
      $group: {
        _id: { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        users: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Format monthly data
  const formattedRevenueByMonth = [];
  const formattedUsersByMonth = [];
  
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1;
    
    const revenueData = revenueByMonth.find(r => r._id.year === year && r._id.month === month);
    formattedRevenueByMonth.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: revenueData?.revenue || 0
    });

    // Cumulative user count up to this month
    const usersUpToMonth = await User.countDocuments({
      createdAt: { $lte: new Date(year, month, 0) }
    });
    formattedUsersByMonth.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      users: usersUpToMonth
    });
  }

  // Convert usersByRole array to object
  const byRoleObject = {};
  usersByRole.forEach(item => {
    byRoleObject[item._id] = item.count;
  });

  // Convert ordersByStatus array to object
  const byStatusObject = {};
  ordersByStatus.forEach(item => {
    byStatusObject[item._id] = item.count;
  });

  // Top products
  const topProducts = await Order.aggregate([
    { $match: { 'payment.status': 'completed' } },
    {
      $group: {
        _id: '$product',
        totalSold: { $sum: '$orderDetails.quantity' },
        revenue: { $sum: '$orderDetails.totalAmount' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } }
  ]);

  const formattedTopProducts = topProducts.map(p => ({
    _id: p._id,
    name: p.productInfo?.basicInfo?.name || 'Unknown Product',
    category: p.productInfo?.basicInfo?.category || 'Unknown',
    totalSold: p.totalSold,
    revenue: p.revenue
  }));

  // Top farmers
  const topFarmers = await Order.aggregate([
    { $match: { 'payment.status': 'completed' } },
    {
      $group: {
        _id: '$seller',
        totalOrders: { $sum: 1 },
        revenue: { $sum: '$orderDetails.totalAmount' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'farmerInfo'
      }
    },
    { $unwind: { path: '$farmerInfo', preserveNullAndEmptyArrays: true } }
  ]);

  const formattedTopFarmers = topFarmers.map(f => ({
    _id: f._id,
    name: f.farmerInfo?.profile?.name || 'Unknown Farmer',
    totalOrders: f.totalOrders,
    revenue: f.revenue,
    rating: f.farmerInfo?.stats?.averageRating || 4.5
  }));

  res.status(200).json({
    success: true,
    data: {
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: revenueGrowth,
        byMonth: formattedRevenueByMonth
      },
      users: {
        total: totalUsers,
        thisMonth: thisMonthUsers,
        lastMonth: lastMonthUsers,
        growth: userGrowth,
        byMonth: formattedUsersByMonth,
        byRole: byRoleObject
      },
      orders: {
        total: totalOrders,
        thisMonth: thisMonthOrders,
        lastMonth: lastMonthOrders,
        growth: orderGrowth,
        byStatus: byStatusObject
      },
      topProducts: formattedTopProducts,
      topFarmers: formattedTopFarmers
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

  // Add search functionality
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { 'profile.name': searchRegex },
      { 'profile.email': searchRegex },
      { walletAddress: searchRegex }
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
  const limit = parseInt(req.query.limit) || 20;

  const [recentUsers, recentProducts, recentOrders, pendingKYC] = await Promise.all([
    User.find()
      .select('_id profile.name walletAddress role createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Product.find()
      .populate('farmer', 'profile.name walletAddress')
      .select('_id productId basicInfo.name createdAt isActive')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Order.find()
      .populate('buyer', 'profile.name walletAddress')
      .populate('seller', 'profile.name walletAddress')
      .populate('product', 'basicInfo.name productId')
      .select('_id orderId status orderDetails.totalAmount createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    User.find({ 'verification.kycStatus': 'pending' })
      .select('_id profile.name walletAddress role createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  ]);

  // Format activities with proper timestamps and types
  const activities = [];

  recentUsers.forEach(user => {
    activities.push({
      _id: user._id,
      type: 'user_registered',
      description: `New user registered: ${user.profile?.name || 'Anonymous'}`,
      user: {
        name: user.profile?.name || 'Anonymous',
        walletAddress: user.walletAddress,
        role: user.role
      },
      timestamp: user.createdAt
    });
  });

  recentProducts.forEach(product => {
    activities.push({
      _id: product._id,
      type: 'product_added',
      description: `New product added: ${product.basicInfo?.name || 'Unknown'}`,
      product: {
        id: product.productId,
        name: product.basicInfo?.name || 'Unknown',
        farmer: product.farmer?.profile?.name || 'Unknown'
      },
      timestamp: product.createdAt
    });
  });

  recentOrders.forEach(order => {
    activities.push({
      _id: order._id,
      type: 'order_placed',
      description: `Order placed: ${order.orderId}`,
      order: {
        id: order.orderId,
        status: order.status,
        amount: order.orderDetails?.totalAmount || 0,
        buyer: order.buyer?.profile?.name || 'Unknown',
        seller: order.seller?.profile?.name || 'Unknown',
        product: order.product?.basicInfo?.name || 'Unknown'
      },
      timestamp: order.createdAt
    });
  });

  pendingKYC.forEach(user => {
    activities.push({
      _id: user._id,
      type: 'kyc_pending',
      description: `KYC verification pending: ${user.profile?.name || 'Anonymous'}`,
      user: {
        name: user.profile?.name || 'Anonymous',
        walletAddress: user.walletAddress,
        role: user.role
      },
      timestamp: user.createdAt
    });
  });

  // Sort all activities by timestamp
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.status(200).json({
    success: true,
    data: {
      activities: activities.slice(0, limit),
      recentUsers,
      recentProducts,
      recentOrders,
      pendingKYC
    }
  });
});
