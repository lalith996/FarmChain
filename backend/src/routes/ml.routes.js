const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { rateLimitByRole } = require('../middleware/rateLimit.middleware');
const { auditLog } = require('../middleware/audit.middleware');
const mlController = require('../controllers/ml.controller');

/**
 * ML Prediction Routes
 * All routes require FARMER role
 */

// Predict crop yield
router.post('/predict-yield',
  authenticate,
  requireRole('FARMER', 'ADMIN'),
  rateLimitByRole('api_call', 'minute'),
  auditLog(),
  mlController.predictYield
);

// Recommend crop
router.post('/recommend-crop',
  authenticate,
  requireRole('FARMER', 'ADMIN'),
  rateLimitByRole('api_call', 'minute'),
  auditLog(),
  mlController.recommendCrop
);

// Batch recommendations
router.post('/batch-recommend',
  authenticate,
  requireRole('FARMER', 'ADMIN'),
  rateLimitByRole('api_call', 'minute'),
  auditLog(),
  mlController.batchRecommend
);

// ML service health check
router.get('/health',
  authenticate,
  mlController.getMLHealth
);

module.exports = router;
