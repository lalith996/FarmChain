const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

/**
 * Review Routes
 */

// Public routes - anyone can view reviews
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/seller/:sellerId', reviewController.getSellerReviews);

// Protected routes - require authentication
// User's own reviews (all authenticated users)
router.get('/my-reviews', 
  authenticate,
  reviewController.getUserReviews
);

// Check if user can review an order (customers only)
router.get('/can-review/:orderId', 
  authenticate,
  requireRole('CONSUMER', 'RETAILER', 'DISTRIBUTOR'),
  reviewController.canReview
);

// Create review (customers only)
router.post('/', 
  authenticate,
  requireRole('CONSUMER', 'RETAILER', 'DISTRIBUTOR'),
  reviewController.createReview
);

// Update review (review owner only - checked in controller)
router.put('/:id', 
  authenticate,
  reviewController.updateReview
);

// Delete review (review owner only - checked in controller)
router.delete('/:id', 
  authenticate,
  reviewController.deleteReview
);

// Vote on review (all authenticated users)
router.post('/:id/vote', 
  authenticate,
  reviewController.voteReview
);

// Seller response (sellers only)
router.post('/:id/response', 
  authenticate,
  requireRole('FARMER', 'DISTRIBUTOR', 'RETAILER'),
  reviewController.addSellerResponse
);

// Flag review (all authenticated users)
router.post('/:id/flag', 
  authenticate,
  reviewController.flagReview
);

module.exports = router;
