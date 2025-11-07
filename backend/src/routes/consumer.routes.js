const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const consumerController = require('../controllers/consumer.controller');

// All routes require authentication and CONSUMER role
router.use(authenticate);
router.use(requireRole('CONSUMER'));

// Dashboard
router.get('/dashboard', consumerController.getDashboard);

// Orders
router.get('/orders', consumerController.getOrders);

// Products & Shopping
router.get('/products', consumerController.getProducts);
router.get('/cart', consumerController.getCart);
router.get('/checkout', consumerController.getCheckout);

// Wishlist & Reviews
router.get('/wishlist', consumerController.getWishlist);
router.get('/reviews', consumerController.getReviews);

// Delivery & Payments
router.get('/delivery', consumerController.getDelivery);
router.get('/payments', consumerController.getPayments);

// Loyalty & Support
router.get('/loyalty', consumerController.getLoyalty);
router.get('/support', consumerController.getSupport);

// Profile & Settings
router.get('/profile', consumerController.getProfile);
router.get('/settings', consumerController.getSettings);

module.exports = router;
