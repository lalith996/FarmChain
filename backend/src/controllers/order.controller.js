const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const blockchainService = require('../config/blockchain');
const logger = require('../utils/logger');

/**
 * @desc    Create a new order
 * @route   POST /api/v1/orders/create
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    productId,
    quantity,
    deliveryAddress,
    qualityVerificationRequired,
    notes
  } = req.body;

  // Validate required fields
  if (!productId || !quantity || !deliveryAddress) {
    return next(new AppError('Please provide all required fields', 400, 'MISSING_FIELDS'));
  }

  // Find product
  const product = await Product.findOne({
    $or: [
      { _id: productId },
      { productId: productId }
    ]
  }).populate('farmer');

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  if (!product.isActive) {
    return next(new AppError('Product is not available', 400, 'PRODUCT_UNAVAILABLE'));
  }

  // Check if buyer is not the seller
  if (product.farmer._id.toString() === req.user._id.toString()) {
    return next(new AppError('Cannot order your own product', 400, 'INVALID_ORDER'));
  }

  // Check quantity availability
  if (product.quantity.available < quantity) {
    return next(new AppError(
      `Insufficient quantity. Only ${product.quantity.available} ${product.quantity.unit} available`,
      400,
      'INSUFFICIENT_QUANTITY'
    ));
  }

  // Calculate total amount
  const totalAmount = product.pricing.currentPrice * quantity;

  // Create order
  const order = await Order.create({
    orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    buyer: req.user._id,
    buyerWallet: req.user.walletAddress,
    seller: product.farmer._id,
    sellerWallet: product.farmer.walletAddress,
    product: product._id,
    productSnapshot: {
      productId: product.productId,
      name: product.basicInfo.name,
      category: product.basicInfo.category,
      images: product.basicInfo.images,
      grade: product.quality.grade
    },
    orderDetails: {
      quantity,
      unit: product.quantity.unit,
      pricePerUnit: product.pricing.currentPrice,
      totalAmount,
      currency: product.pricing.currency
    },
    delivery: {
      address: deliveryAddress,
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    qualityVerification: {
      required: qualityVerificationRequired || false
    },
    notes,
    status: 'pending'
  });

  // Update product quantity (reserve the quantity)
  await product.updateQuantity(quantity, 0);

  logger.info(`Order created: ${order.orderId} by ${req.user.walletAddress}`);

  res.status(201).json({
    success: true,
    data: { order },
    message: 'Order created successfully. Please proceed with payment.'
  });
});

/**
 * @desc    Get all orders for user
 * @route   GET /api/v1/orders
 * @access  Private
 */
exports.getOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build filter based on user role
  let filter = {};
  
  if (req.query.type === 'purchases') {
    filter.buyer = req.user._id;
  } else if (req.query.type === 'sales') {
    filter.seller = req.user._id;
  } else {
    // Get both purchases and sales
    filter.$or = [
      { buyer: req.user._id },
      { seller: req.user._id }
    ];
  }

  // Add status filter if provided
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('buyer', 'profile.name walletAddress')
      .populate('seller', 'profile.name walletAddress')
      .populate('product', 'basicInfo.name basicInfo.images productId')
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
 * @desc    Get order by ID
 * @route   GET /api/v1/orders/:orderId
 * @access  Private
 */
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    $or: [
      { _id: req.params.orderId },
      { orderId: req.params.orderId }
    ]
  })
    .populate('buyer', 'profile.name profile.email walletAddress rating')
    .populate('seller', 'profile.name profile.email walletAddress rating')
    .populate('product');

  if (!order) {
    return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
  }

  // Check if user is authorized to view this order
  const isBuyer = order.buyer._id.toString() === req.user._id.toString();
  const isSeller = order.seller._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isSeller && !isAdmin) {
    return next(new AppError('Not authorized to view this order', 403, 'FORBIDDEN'));
  }

  res.status(200).json({
    success: true,
    data: { order }
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/v1/orders/:orderId/status
 * @access  Private
 */
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, notes, location } = req.body;

  if (!status) {
    return next(new AppError('Please provide status', 400, 'MISSING_STATUS'));
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

  // Check authorization
  const isSeller = order.seller.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isSeller && !isAdmin) {
    return next(new AppError('Not authorized to update this order', 403, 'FORBIDDEN'));
  }

  // Validate status transition
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['payment_initiated', 'cancelled'],
    payment_initiated: ['payment_completed', 'cancelled'],
    payment_completed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['in_transit'],
    in_transit: ['out_for_delivery', 'delivered'],
    out_for_delivery: ['delivered'],
    delivered: ['disputed'],
    cancelled: [],
    refunded: [],
    disputed: []
  };

  if (!validTransitions[order.status].includes(status)) {
    return next(new AppError(
      `Invalid status transition from ${order.status} to ${status}`,
      400,
      'INVALID_TRANSITION'
    ));
  }

  // Update status
  await order.updateStatus(status, req.user._id, notes || '', location || '');

  // If order is delivered, update product quantity
  if (status === 'delivered') {
    const product = await Product.findById(order.product);
    if (product) {
      await product.updateQuantity(0, order.orderDetails.quantity);
    }
  }

  // If order is cancelled, restore product quantity
  if (status === 'cancelled' && order.status !== 'delivered') {
    const product = await Product.findById(order.product);
    if (product) {
      product.quantity.available += order.orderDetails.quantity;
      await product.save();
    }
  }

  logger.info(`Order ${order.orderId} status updated to ${status} by ${req.user.walletAddress}`);

  res.status(200).json({
    success: true,
    data: { order },
    message: `Order status updated to ${status}`
  });
});

/**
 * @desc    Cancel order
 * @route   PUT /api/v1/orders/:orderId/cancel
 * @access  Private
 */
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    $or: [
      { _id: req.params.orderId },
      { orderId: req.params.orderId }
    ]
  });

  if (!order) {
    return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
  }

  // Check if buyer is the one cancelling
  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isAdmin) {
    return next(new AppError('Not authorized to cancel this order', 403, 'FORBIDDEN'));
  }

  // Check if order can be cancelled
  const cancellableStatuses = ['pending', 'confirmed', 'payment_initiated'];
  if (!cancellableStatuses.includes(order.status)) {
    return next(new AppError('Order cannot be cancelled at this stage', 400, 'CANNOT_CANCEL'));
  }

  // Update status
  await order.updateStatus('cancelled', req.user._id, req.body.reason || 'Cancelled by buyer');

  // Restore product quantity
  const product = await Product.findById(order.product);
  if (product) {
    product.quantity.available += order.orderDetails.quantity;
    await product.save();
  }

  logger.info(`Order ${order.orderId} cancelled by ${req.user.walletAddress}`);

  res.status(200).json({
    success: true,
    data: { order },
    message: 'Order cancelled successfully'
  });
});

/**
 * @desc    Add rating to order
 * @route   POST /api/v1/orders/:orderId/rate
 * @access  Private
 */
exports.rateOrder = asyncHandler(async (req, res, next) => {
  const { rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Please provide a valid rating between 1 and 5', 400, 'INVALID_RATING'));
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

  // Check if order is delivered
  if (order.status !== 'delivered') {
    return next(new AppError('Can only rate delivered orders', 400, 'ORDER_NOT_DELIVERED'));
  }

  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isSeller = order.seller.toString() === req.user._id.toString();

  if (!isBuyer && !isSeller) {
    return next(new AppError('Not authorized to rate this order', 403, 'FORBIDDEN'));
  }

  // Update rating
  if (isBuyer) {
    order.ratings.buyerRating = {
      rating,
      review: review || '',
      date: new Date()
    };

    // Update seller's rating
    const seller = await User.findById(order.seller);
    if (seller) {
      await seller.updateRating(rating);
    }
  } else if (isSeller) {
    order.ratings.sellerRating = {
      rating,
      review: review || '',
      date: new Date()
    };

    // Update buyer's rating
    const buyer = await User.findById(order.buyer);
    if (buyer) {
      await buyer.updateRating(rating);
    }
  }

  await order.save();

  res.status(200).json({
    success: true,
    data: { order },
    message: 'Rating added successfully'
  });
});

/**
 * @desc    Raise dispute for order
 * @route   POST /api/v1/orders/:orderId/dispute
 * @access  Private
 */
exports.raiseDispute = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Please provide a reason for dispute', 400, 'MISSING_REASON'));
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

  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isSeller = order.seller.toString() === req.user._id.toString();

  if (!isBuyer && !isSeller) {
    return next(new AppError('Not authorized to raise dispute', 403, 'FORBIDDEN'));
  }

  if (order.dispute.isDisputed) {
    return next(new AppError('Dispute already exists for this order', 400, 'DISPUTE_EXISTS'));
  }

  // Raise dispute
  await order.raiseDispute(reason, req.user._id);

  logger.info(`Dispute raised for order ${order.orderId} by ${req.user.walletAddress}`);

  res.status(200).json({
    success: true,
    data: { order },
    message: 'Dispute raised successfully. Admin will review it soon.'
  });
});

/**
 * @desc    Get order statistics
 * @route   GET /api/v1/orders/stats
 * @access  Private
 */
exports.getOrderStats = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Get buyer stats
  const buyerStats = await Order.aggregate([
    { $match: { buyer: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$orderDetails.totalAmount' }
      }
    }
  ]);

  // Get seller stats
  const sellerStats = await Order.aggregate([
    { $match: { seller: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$orderDetails.totalAmount' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      buyer: buyerStats,
      seller: sellerStats
    }
  });
});
