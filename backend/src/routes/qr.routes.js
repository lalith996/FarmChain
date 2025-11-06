const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');

/**
 * QR Code Routes
 * Public routes for verification
 */

// Generate QR code for product
router.get('/generate/product/:productId', qrController.generateProductQR);

// Verify product by ID
router.get('/verify/product/:productId', qrController.verifyProduct);

// Verify QR code data
router.post('/verify', qrController.verifyQRData);

// Get product history/timeline
router.get('/history/product/:productId', qrController.getProductHistory);

module.exports = router;
