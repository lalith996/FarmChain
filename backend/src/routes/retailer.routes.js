const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const retailerController = require('../controllers/retailer.controller');

// All routes require authentication and RETAILER role
router.use(authenticate);
router.use(requireRole('RETAILER'));

// Dashboard
router.get('/dashboard', retailerController.getDashboard);

// Inventory
router.get('/inventory', retailerController.getInventory);

// Orders
router.get('/orders', retailerController.getOrders);
router.get('/orders/purchase', retailerController.getPurchaseOrders);

// Analytics & Sales
router.get('/analytics', retailerController.getAnalytics);
router.get('/sales', retailerController.getSales);

// Customers
router.get('/customers', retailerController.getCustomers);

// Store Management
router.get('/store', retailerController.getStore);
router.get('/pos', retailerController.getPOS);

// Sourcing
router.get('/sourcing', retailerController.getSourcing);

// Payments & Pricing
router.get('/payments', retailerController.getPayments);
router.get('/pricing', retailerController.getPricing);

// Marketing & Promotions
router.get('/promotions', retailerController.getPromotions);
router.get('/marketing', retailerController.getMarketing);

// Staff
router.get('/staff', retailerController.getStaff);

// Settings
router.get('/settings', retailerController.getSettings);

module.exports = router;
