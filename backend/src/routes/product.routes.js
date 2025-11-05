const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
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
  protect,
  authorize('farmer'),
  productController.registerProduct
);

router.put(
  '/:productId',
  protect,
  authorize('farmer', 'admin'),
  productController.updateProduct
);

router.delete(
  '/:productId',
  protect,
  authorize('farmer', 'admin'),
  productController.deleteProduct
);

router.post(
  '/:productId/quality-check',
  protect,
  authorize('farmer', 'admin'),
  productController.addQualityCheck
);

router.get(
  '/farmer/:farmerId',
  protect,
  productController.getFarmerProducts
);

module.exports = router;
