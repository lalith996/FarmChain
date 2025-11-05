const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

// Notification routes
router.get('/', protect, notificationController.getNotifications);
router.put('/:notificationId/read', protect, notificationController.markAsRead);
router.put('/read-all', protect, notificationController.markAllAsRead);
router.delete('/:notificationId', protect, notificationController.deleteNotification);

// Admin route to send notifications
router.post('/send', protect, authorize('admin'), notificationController.sendNotification);

module.exports = router;
