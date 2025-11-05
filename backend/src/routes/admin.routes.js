const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Analytics and stats
router.get('/analytics', adminController.getAnalytics);
router.get('/stats', adminController.getPlatformStats);
router.get('/health', adminController.getSystemHealth);
router.get('/activity', adminController.getActivityLogs);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId', adminController.updateUser);

// Product management
router.get('/products', adminController.getAllProducts);
router.put('/products/:productId', adminController.updateProduct);

// Order management
router.get('/orders', adminController.getAllOrders);

// Dispute management
router.get('/disputes', adminController.getDisputes);
router.put('/disputes/:orderId/resolve', adminController.resolveDispute);

module.exports = router;
