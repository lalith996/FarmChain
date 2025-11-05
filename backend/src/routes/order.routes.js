const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');

// Order routes
router.post('/create', protect, orderController.createOrder);
router.get('/', protect, orderController.getOrders);
router.get('/stats', protect, orderController.getOrderStats);
router.get('/:orderId', protect, orderController.getOrderById);
router.put('/:orderId/status', protect, orderController.updateOrderStatus);
router.put('/:orderId/cancel', protect, orderController.cancelOrder);
router.post('/:orderId/rate', protect, orderController.rateOrder);
router.post('/:orderId/dispute', protect, orderController.raiseDispute);

module.exports = router;
