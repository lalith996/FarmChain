const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

/**
 * Delivery Update Routes with RBAC
 */

// Add delivery update (seller/admin only)
router.post('/updates', 
  authenticate,
  requireRole('FARMER', 'DISTRIBUTOR', 'RETAILER', 'ADMIN'),
  deliveryController.addUpdate
);

// Get all updates for an order (authenticated users)
router.get('/updates/:orderId', 
  authenticate,
  deliveryController.getOrderUpdates
);

// Get latest update for an order (authenticated users)
router.get('/updates/:orderId/latest', 
  authenticate,
  deliveryController.getLatestUpdate
);

// Get delivery timeline (authenticated users)
router.get('/timeline/:orderId', 
  authenticate,
  deliveryController.getTimeline
);

module.exports = router;
