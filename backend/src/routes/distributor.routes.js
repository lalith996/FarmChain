const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const distributorController = require('../controllers/distributor.controller');

// All routes require authentication and DISTRIBUTOR role
router.use(authenticate);
router.use(requireRole('DISTRIBUTOR'));

// Dashboard
router.get('/dashboard', distributorController.getDashboard);

// Orders
router.get('/orders', distributorController.getOrders);

// Analytics
router.get('/analytics', distributorController.getAnalytics);

// Warehouse & Inventory
router.get('/warehouse', distributorController.getWarehouse);
router.get('/inventory', distributorController.getInventory);

// Logistics & Fleet
router.get('/logistics', distributorController.getLogistics);
router.get('/fleet', distributorController.getFleet);
router.get('/routes', distributorController.getRoutes);
router.get('/tracking', distributorController.getTracking);

// Business Relationships
router.get('/retailers', distributorController.getRetailers);
router.get('/suppliers', distributorController.getSuppliers);
router.get('/sourcing', distributorController.getSourcing);

// Quality & Finance
router.get('/quality', distributorController.getQuality);
router.get('/finance', distributorController.getFinance);

// Staff & Settings
router.get('/staff', distributorController.getStaff);
router.get('/settings', distributorController.getSettings);

module.exports = router;
