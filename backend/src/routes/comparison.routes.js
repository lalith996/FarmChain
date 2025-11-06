const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparison.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * Comparison Routes
 */

// Public route - get comparison by token
router.get('/:id', comparisonController.getComparison);

// Compare products without saving (no auth required)
router.post('/compare', comparisonController.compareProducts);

// Protected routes
router.use(authenticate);

// Save comparison
router.post('/', comparisonController.saveComparison);

// Delete comparison
router.delete('/:id', comparisonController.deleteComparison);

module.exports = router;
