const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Order = require('../models/Order.model');
const blockchainService = require('../config/blockchain');
const logger = require('../utils/logger');
const { ethers } = require('ethers');
const exchangeRateService = require('../services/exchangeRate.service');

/**
 * @desc    Create escrow payment for order
 * @route   POST /api/v1/payments/create
 * @access  Private (Buyer)
 */
exports.createPayment = asyncHandler(async (req, res, next) => {
  const { orderId, paymentMethod } = req.body;

  if (!orderId) {
    return next(new AppError('Please provide order ID', 400, 'MISSING_ORDER_ID'));
  }

  // Find order
  const order = await Order.findOne({
    $or: [
      { _id: orderId },
      { orderId: orderId }
    ]
  }).populate('seller', 'walletAddress');

  if (!order) {
    return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
  }

  // Verify buyer
  if (order.buyer.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to make payment for this order', 403, 'FORBIDDEN'));
  }

  // Check order status
  if (order.status !== 'pending' && order.status !== 'confirmed') {
    return next(new AppError('Order is not in valid state for payment', 400, 'INVALID_ORDER_STATE'));
  }

  // Check if payment already exists
  if (order.payment.status === 'completed') {
    return next(new AppError('Payment already completed for this order', 400, 'PAYMENT_EXISTS'));
  }

  try {
    // Convert amount to Wei (assuming payment in MATIC/ETH)
    // For production, you'd get the exchange rate and convert INR to crypto
    const amountInEth = ethers.parseEther((order.orderDetails.totalAmount / 1000).toString()); // Mock conversion

    // Create payment on blockchain
    const paymentResult = await blockchainService.createPayment(
      order.orderId,
      order.seller.walletAddress,
      amountInEth.toString()
    );

    // Update order with payment details
    order.payment.paymentId = paymentResult.paymentId;
    order.payment.method = paymentMethod || 'escrow';
    order.payment.status = 'pending';
    order.payment.transactionHash = paymentResult.txHash;
    order.blockchain.paymentTxHash = paymentResult.txHash;
    order.status = 'payment_initiated';

    await order.save();

    logger.info(`Payment created for order ${order.orderId}: ${paymentResult.txHash}`);

    res.status(201).json({
      success: true,
      data: {
        order,
        payment: {
          paymentId: paymentResult.paymentId,
          transactionHash: paymentResult.txHash,
          amount: amountInEth.toString(),
          currency: 'MATIC'
        }
      },
      message: 'Payment escrow created successfully'
    });
  } catch (error) {
    logger.error('Error creating payment:', error);
    return next(new AppError('Failed to create payment on blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Release escrow payment to seller
 * @route   POST /api/v1/payments/release
 * @access  Private (Buyer)
 */
exports.releasePayment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  if (!orderId) {
    return next(new AppError('Please provide order ID', 400, 'MISSING_ORDER_ID'));
  }

  // Find order
  const order = await Order.findOne({
    $or: [
      { _id: orderId },
      { orderId: orderId }
    ]
  });

  if (!order) {
    return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
  }

  // Verify buyer
  if (order.buyer.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to release payment for this order', 403, 'FORBIDDEN'));
  }

  // Check if payment exists
  if (!order.payment.paymentId) {
    return next(new AppError('No payment found for this order', 400, 'NO_PAYMENT'));
  }

  // Check if payment already released
  if (order.payment.status === 'completed') {
    return next(new AppError('Payment already released', 400, 'PAYMENT_RELEASED'));
  }

  // Check order status (should be delivered or quality verified)
  if (order.status !== 'delivered' && !order.qualityVerification.completed) {
    return next(new AppError('Order must be delivered before releasing payment', 400, 'ORDER_NOT_DELIVERED'));
  }

  try {
    // Release payment on blockchain
    const releaseResult = await blockchainService.releasePayment(order.payment.paymentId);

    // Update order
    await order.completePayment(releaseResult.txHash);
    order.status = 'delivered';
    await order.save();

    logger.info(`Payment released for order ${order.orderId}: ${releaseResult.txHash}`);

    res.status(200).json({
      success: true,
      data: {
        order,
        payment: {
          transactionHash: releaseResult.txHash,
          status: 'completed'
        }
      },
      message: 'Payment released to seller successfully'
    });
  } catch (error) {
    logger.error('Error releasing payment:', error);
    return next(new AppError('Failed to release payment on blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Request refund for order
 * @route   POST /api/v1/payments/refund
 * @access  Private (Buyer)
 */
exports.requestRefund = asyncHandler(async (req, res, next) => {
  const { orderId, reason } = req.body;

  if (!orderId || !reason) {
    return next(new AppError('Please provide order ID and reason', 400, 'MISSING_FIELDS'));
  }

  // Find order
  const order = await Order.findOne({
    $or: [
      { _id: orderId },
      { orderId: orderId }
    ]
  });

  if (!order) {
    return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
  }

  // Verify buyer
  if (order.buyer.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to request refund for this order', 403, 'FORBIDDEN'));
  }

  // Check if payment exists
  if (!order.payment.paymentId) {
    return next(new AppError('No payment found for this order', 400, 'NO_PAYMENT'));
  }

  // Check if payment already refunded
  if (order.payment.status === 'refunded') {
    return next(new AppError('Payment already refunded', 400, 'ALREADY_REFUNDED'));
  }

  // Check if payment already released
  if (order.payment.status === 'completed') {
    return next(new AppError('Payment already released to seller', 400, 'PAYMENT_RELEASED'));
  }

  try {
    // Request refund on blockchain
    const refundResult = await blockchainService.requestRefund(order.payment.paymentId, reason);

    // Raise dispute
    await order.raiseDispute(reason, req.user._id);

    logger.info(`Refund requested for order ${order.orderId}: ${refundResult.txHash}`);

    res.status(200).json({
      success: true,
      data: {
        order,
        refund: {
          transactionHash: refundResult.txHash
        }
      },
      message: 'Refund request submitted. Admin will review the dispute.'
    });
  } catch (error) {
    logger.error('Error requesting refund:', error);
    return next(new AppError('Failed to request refund on blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Get payment details
 * @route   GET /api/v1/payments/:paymentId
 * @access  Private
 */
exports.getPaymentDetails = asyncHandler(async (req, res, next) => {
  const { paymentId } = req.params;

  // Find order with this payment ID
  const order = await Order.findOne({
    'payment.paymentId': paymentId
  })
    .populate('buyer', 'profile.name walletAddress')
    .populate('seller', 'profile.name walletAddress');

  if (!order) {
    return next(new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND'));
  }

  // Check authorization
  const isBuyer = order.buyer._id.toString() === req.user._id.toString();
  const isSeller = order.seller._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isSeller && !isAdmin) {
    return next(new AppError('Not authorized to view this payment', 403, 'FORBIDDEN'));
  }

  try {
    // Get payment details from blockchain
    const blockchainPayment = await blockchainService.getPayment(paymentId);

    res.status(200).json({
      success: true,
      data: {
        payment: order.payment,
        order: {
          orderId: order.orderId,
          status: order.status,
          amount: order.orderDetails.totalAmount
        },
        blockchain: blockchainPayment
      }
    });
  } catch (error) {
    logger.error('Error fetching payment details:', error);
    
    // Return database info even if blockchain call fails
    res.status(200).json({
      success: true,
      data: {
        payment: order.payment,
        order: {
          orderId: order.orderId,
          status: order.status,
          amount: order.orderDetails.totalAmount
        },
        blockchain: null
      },
      warning: 'Could not fetch blockchain details'
    });
  }
});

/**
 * @desc    Resolve payment dispute (Admin only)
 * @route   POST /api/v1/payments/resolve-dispute
 * @access  Private (Admin)
 */
exports.resolveDispute = asyncHandler(async (req, res, next) => {
  const { orderId, resolution, refundBuyer } = req.body;

  if (!orderId || !resolution) {
    return next(new AppError('Please provide order ID and resolution', 400, 'MISSING_FIELDS'));
  }

  // Find order
  const order = await Order.findOne({
    $or: [
      { _id: orderId },
      { orderId: orderId }
    ]
  });

  if (!order) {
    return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
  }

  if (!order.dispute.isDisputed) {
    return next(new AppError('No dispute found for this order', 400, 'NO_DISPUTE'));
  }

  try {
    // Resolve dispute on blockchain
    const disputeResult = await blockchainService.resolveDispute(
      order.payment.paymentId,
      refundBuyer || false
    );

    // Update order
    order.dispute.status = 'resolved';
    order.dispute.resolution = resolution;
    order.dispute.resolvedBy = req.user._id;
    order.dispute.resolvedAt = new Date();

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

    logger.info(`Dispute resolved for order ${order.orderId}: ${refundBuyer ? 'Refunded' : 'Released to seller'}`);

    res.status(200).json({
      success: true,
      data: {
        order,
        dispute: {
          transactionHash: disputeResult.txHash,
          resolution: refundBuyer ? 'Refunded to buyer' : 'Released to seller'
        }
      },
      message: 'Dispute resolved successfully'
    });
  } catch (error) {
    logger.error('Error resolving dispute:', error);
    return next(new AppError('Failed to resolve dispute on blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Cancel payment within grace period
 * @route   POST /api/v1/payments/cancel
 * @access  Private (Buyer)
 */
exports.cancelPayment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  if (!orderId) {
    return next(new AppError('Please provide order ID', 400, 'MISSING_ORDER_ID'));
  }

  // Find order
  const order = await Order.findOne({
    $or: [
      { _id: orderId },
      { orderId: orderId }
    ]
  });

  if (!order) {
    return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
  }

  // Verify buyer
  if (order.buyer.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to cancel payment for this order', 403, 'FORBIDDEN'));
  }

  // Check if payment exists
  if (!order.payment.paymentId) {
    return next(new AppError('No payment found for this order', 400, 'NO_PAYMENT'));
  }

  // Check if within grace period (1 hour)
  const paymentCreatedAt = order.payment.createdAt || order.updatedAt;
  const gracePeriodEnd = new Date(paymentCreatedAt.getTime() + 60 * 60 * 1000); // 1 hour

  if (new Date() > gracePeriodEnd) {
    return next(new AppError('Grace period for cancellation has expired', 400, 'GRACE_PERIOD_EXPIRED'));
  }

  try {
    // Cancel payment on blockchain
    const cancelResult = await blockchainService.cancelPayment(order.payment.paymentId);

    // Update order
    order.payment.status = 'refunded';
    order.payment.refundedAt = new Date();
    order.status = 'cancelled';
    await order.save();

    // Restore product quantity
    const Product = require('../models/Product.model');
    const product = await Product.findById(order.product);
    if (product) {
      product.quantity.available += order.orderDetails.quantity;
      await product.save();
    }

    logger.info(`Payment cancelled for order ${order.orderId}: ${cancelResult.txHash}`);

    res.status(200).json({
      success: true,
      data: {
        order,
        cancellation: {
          transactionHash: cancelResult.txHash
        }
      },
      message: 'Payment cancelled successfully'
    });
  } catch (error) {
    logger.error('Error cancelling payment:', error);
    return next(new AppError('Failed to cancel payment on blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Get payment statistics
 * @route   GET /api/v1/payments/stats
 * @access  Private
 */
exports.getPaymentStats = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Get payments sent (as buyer)
  const sentPayments = await Order.aggregate([
    { $match: { buyer: userId, 'payment.status': 'completed' } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$orderDetails.totalAmount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Get payments received (as seller)
  const receivedPayments = await Order.aggregate([
    { $match: { seller: userId, 'payment.status': 'completed' } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$orderDetails.totalAmount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Get pending payments
  const pendingPayments = await Order.countDocuments({
    $or: [{ buyer: userId }, { seller: userId }],
    'payment.status': 'pending'
  });

  res.status(200).json({
    success: true,
    data: {
      sent: sentPayments[0] || { totalAmount: 0, count: 0 },
      received: receivedPayments[0] || { totalAmount: 0, count: 0 },
      pending: pendingPayments
    }
  });
});
