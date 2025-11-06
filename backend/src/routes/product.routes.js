const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const productController = require('../controllers/product.controller');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:productId', productController.getProductById);
router.get('/:productId/history', productController.getProductHistory);
router.get('/:productId/verify', productController.verifyProduct);

// Protected routes (Farmers)
router.post(
  '/register',
  authenticate,
  requireRole('farmer'),
  productController.registerProduct
);

router.put(
  '/:productId',
  authenticate,
  requireRole('farmer', 'admin'),
  productController.updateProduct
);

router.delete(
  '/:productId',
  authenticate,
  requireRole('farmer', 'admin'),
  productController.deleteProduct
);

router.post(
  '/:productId/quality-check',
  authenticate,
  requireRole('farmer', 'admin'),
  productController.addQualityCheck
);

router.get(
  '/farmer/:farmerId',
  authenticate,
  productController.getFarmerProducts
);

module.exports = router;
