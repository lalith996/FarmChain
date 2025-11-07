const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const farmerController = require('../controllers/farmer.controller');

// All routes require authentication and FARMER role
router.use(authenticate);
router.use(requireRole('FARMER'));

// Dashboard
router.get('/dashboard', farmerController.getDashboard);

// Inventory/Products
router.get('/inventory', farmerController.getInventory);
router.get('/listings', farmerController.getListings);

// Orders
router.get('/orders', farmerController.getOrders);

// Analytics & Earnings
router.get('/analytics', farmerController.getAnalytics);
router.get('/earnings', farmerController.getEarnings);
router.get('/finance', farmerController.getFinance);

// ML Insights
router.get('/ml-insights', farmerController.getMLInsights);

// Certifications
router.get('/certifications', farmerController.getCertifications);

// Farm Management
router.get('/crops', farmerController.getCrops);
router.get('/fields', farmerController.getFields);
router.get('/equipment', farmerController.getEquipment);
router.get('/harvest', farmerController.getHarvest);
router.get('/weather', farmerController.getWeather);

// Market
router.get('/market', farmerController.getMarket);

module.exports = router;
