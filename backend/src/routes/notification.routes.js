const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller');

// Notification routes
router.get('/', authenticate, notificationController.getNotifications);
router.put('/:notificationId/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:notificationId', authenticate, notificationController.deleteNotification);

// Admin route to send notifications
router.post('/send', authenticate, requireRole('admin'), notificationController.sendNotification);

module.exports = router;
