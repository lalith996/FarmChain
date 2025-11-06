const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const paymentController = require('../controllers/payment.controller');

// Payment routes
router.post('/create', authenticate, paymentController.createPayment);
router.post('/release', authenticate, paymentController.releasePayment);
router.post('/refund', authenticate, paymentController.requestRefund);
router.post('/cancel', authenticate, paymentController.cancelPayment);
router.post('/resolve-dispute', authenticate, paymentController.resolveDispute);
router.get('/stats', authenticate, paymentController.getPaymentStats);
router.get('/:paymentId', authenticate, paymentController.getPaymentDetails);

module.exports = router;
