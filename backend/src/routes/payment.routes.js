const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/payment.controller');

// Payment routes
router.post('/create', protect, paymentController.createPayment);
router.post('/release', protect, paymentController.releasePayment);
router.post('/refund', protect, paymentController.requestRefund);
router.post('/cancel', protect, paymentController.cancelPayment);
router.post('/resolve-dispute', protect, paymentController.resolveDispute);
router.get('/stats', protect, paymentController.getPaymentStats);
router.get('/:paymentId', protect, paymentController.getPaymentDetails);

module.exports = router;
