const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

/**
 * Subscription Routes with RBAC
 */

// Get user's subscriptions (customers)
router.get('/', 
  authenticate,
  subscriptionController.getUserSubscriptions
);

// Create subscription (customers)
router.post('/', 
  authenticate,
  requireRole('CONSUMER', 'RETAILER', 'DISTRIBUTOR'),
  subscriptionController.createSubscription
);

// Get subscription by ID (customers)
router.get('/:id', 
  authenticate,
  subscriptionController.getSubscription
);

// Update subscription (customers)
router.put('/:id', 
  authenticate,
  requireRole('CONSUMER', 'RETAILER', 'DISTRIBUTOR'),
  subscriptionController.updateSubscription
);

// Pause subscription (customers)
router.post('/:id/pause', 
  authenticate,
  requireRole('CONSUMER', 'RETAILER', 'DISTRIBUTOR'),
  subscriptionController.pauseSubscription
);

// Resume subscription (customers)
router.post('/:id/resume', 
  authenticate,
  requireRole('CONSUMER', 'RETAILER', 'DISTRIBUTOR'),
  subscriptionController.resumeSubscription
);

// Cancel subscription (customers)
router.post('/:id/cancel', 
  authenticate,
  requireRole('CONSUMER', 'RETAILER', 'DISTRIBUTOR'),
  subscriptionController.cancelSubscription
);

// Get due subscriptions (admin/cron only)
router.get('/admin/due', 
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  subscriptionController.getDueSubscriptions
);

module.exports = router;
