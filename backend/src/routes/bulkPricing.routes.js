const express = require('express');
const router = express.Router();
const bulkPricingController = require('../controllers/bulkPricing.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

/**
 * Bulk Pricing Routes with RBAC
 */

// Public routes
router.get('/product/:productId', bulkPricingController.getBulkPricing);
router.post('/calculate', bulkPricingController.calculatePrice);

// Protected routes - Farmers/Distributors only
router.post('/', 
  authenticate, 
  requireRole('FARMER', 'DISTRIBUTOR', 'ADMIN'),
  bulkPricingController.setBulkPricing
);

router.get('/seller', 
  authenticate,
  requireRole('FARMER', 'DISTRIBUTOR', 'ADMIN'),
  bulkPricingController.getSellerBulkPricing
);

router.patch('/product/:productId/toggle', 
  authenticate,
  requireRole('FARMER', 'DISTRIBUTOR', 'ADMIN'),
  bulkPricingController.toggleBulkPricing
);

router.delete('/product/:productId', 
  authenticate,
  requireRole('FARMER', 'DISTRIBUTOR', 'ADMIN'),
  bulkPricingController.deleteBulkPricing
);

module.exports = router;
