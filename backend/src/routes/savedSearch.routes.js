const express = require('express');
const router = express.Router();
const savedSearchController = require('../controllers/savedSearch.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * Saved Search Routes
 * All routes require authentication
 */

router.use(authenticate);

// Get user's saved searches
router.get('/', savedSearchController.getSavedSearches);

// Save a search
router.post('/', savedSearchController.saveSearch);

// Update saved search
router.put('/:id', savedSearchController.updateSavedSearch);

// Delete saved search
router.delete('/:id', savedSearchController.deleteSavedSearch);

// Use saved search (update lastUsed)
router.post('/:id/use', savedSearchController.useSavedSearch);

module.exports = router;
