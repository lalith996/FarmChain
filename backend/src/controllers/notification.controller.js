const { asyncHandler, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Notification model (simplified for now - can be enhanced later)
const notifications = new Map(); // In-memory store (use MongoDB in production)

/**
 * @desc    Get user notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.user._id.toString();
  const userNotifications = notifications.get(userId) || [];

  // Filter by read/unread status if requested
  let filtered = userNotifications;
  if (req.query.unread === 'true') {
    filtered = userNotifications.filter(n => !n.read);
  }

  res.status(200).json({
    success: true,
    data: {
      notifications: filtered,
      unreadCount: userNotifications.filter(n => !n.read).length,
      total: userNotifications.length
    }
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/v1/notifications/:notificationId/read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const userId = req.user._id.toString();
  const { notificationId } = req.params;

  const userNotifications = notifications.get(userId) || [];
  const notification = userNotifications.find(n => n.id === notificationId);

  if (!notification) {
    return next(new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND'));
  }

  notification.read = true;
  notification.readAt = new Date();

  notifications.set(userId, userNotifications);

  res.status(200).json({
    success: true,
    data: { notification },
    message: 'Notification marked as read'
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/v1/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  const userId = req.user._id.toString();
  const userNotifications = notifications.get(userId) || [];

  userNotifications.forEach(n => {
    n.read = true;
    n.readAt = new Date();
  });

  notifications.set(userId, userNotifications);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/v1/notifications/:notificationId
 * @access  Private
 */
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const userId = req.user._id.toString();
  const { notificationId } = req.params;

  const userNotifications = notifications.get(userId) || [];
  const filtered = userNotifications.filter(n => n.id !== notificationId);

  if (filtered.length === userNotifications.length) {
    return next(new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND'));
  }

  notifications.set(userId, filtered);

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

/**
 * @desc    Create notification (internal helper)
 * @param   {String} userId - User ID to send notification to
 * @param   {Object} notificationData - Notification data
 */
const createNotification = (userId, notificationData) => {
  const userNotifications = notifications.get(userId) || [];
  
  const notification = {
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...notificationData,
    read: false,
    createdAt: new Date()
  };

  userNotifications.unshift(notification); // Add to beginning
  
  // Keep only last 100 notifications per user
  if (userNotifications.length > 100) {
    userNotifications.pop();
  }

  notifications.set(userId, userNotifications);
  
  logger.info(`Notification created for user ${userId}: ${notification.type}`);
  
  return notification;
};

/**
 * @desc    Send notification (can be called from other controllers)
 * @route   POST /api/v1/notifications/send
 * @access  Private (Admin)
 */
exports.sendNotification = asyncHandler(async (req, res, next) => {
  const { userId, type, title, message, data } = req.body;

  if (!userId || !type || !title || !message) {
    return next(new AppError('Please provide all required fields', 400, 'MISSING_FIELDS'));
  }

  const notification = createNotification(userId, {
    type,
    title,
    message,
    data: data || {}
  });

  res.status(201).json({
    success: true,
    data: { notification },
    message: 'Notification sent successfully'
  });
});

/**
 * Helper function to send order notifications
 */
exports.notifyOrderUpdate = (userId, orderId, status, message) => {
  return createNotification(userId, {
    type: 'order',
    title: 'Order Update',
    message,
    data: {
      orderId,
      status
    }
  });
};

/**
 * Helper function to send payment notifications
 */
exports.notifyPayment = (userId, orderId, paymentStatus, message) => {
  return createNotification(userId, {
    type: 'payment',
    title: 'Payment Update',
    message,
    data: {
      orderId,
      paymentStatus
    }
  });
};

/**
 * Helper function to send product notifications
 */
exports.notifyProduct = (userId, productId, message) => {
  return createNotification(userId, {
    type: 'product',
    title: 'Product Update',
    message,
    data: {
      productId
    }
  });
};

/**
 * Helper function to send KYC notifications
 */
exports.notifyKYC = (userId, kycStatus, message) => {
  return createNotification(userId, {
    type: 'kyc',
    title: 'KYC Update',
    message,
    data: {
      kycStatus
    }
  });
};

// Export helper functions for use in other controllers
module.exports.createNotification = createNotification;
