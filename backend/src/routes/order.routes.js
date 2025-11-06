const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');

// Order routes
router.post('/create', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/stats', authenticate, orderController.getOrderStats);
router.get('/:orderId', authenticate, orderController.getOrderById);
router.put('/:orderId/status', authenticate, orderController.updateOrderStatus);
router.put('/:orderId/cancel', authenticate, orderController.cancelOrder);
router.post('/:orderId/rate', authenticate, orderController.rateOrder);
router.post('/:orderId/dispute', authenticate, orderController.raiseDispute);

module.exports = router;
