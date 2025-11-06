const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * Wishlist Routes
 * All routes require authentication except public wishlist view
 */

// Public route - view shared wishlist
router.get('/public/:token', wishlistController.getPublicWishlist);

// Protected routes
router.use(authenticate);

// Get all wishlists for user
router.get('/', wishlistController.getWishlists);

// Create new wishlist
router.post('/', wishlistController.createWishlist);

// Get specific wishlist
router.get('/:id', wishlistController.getWishlistById);

// Update wishlist settings
router.put('/:id', wishlistController.updateWishlist);

// Delete wishlist
router.delete('/:id', wishlistController.deleteWishlist);

// Add product to wishlist
router.post('/items', wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/:wishlistId/items/:productId', wishlistController.removeFromWishlist);

// Update wishlist item
router.patch('/:wishlistId/items/:productId', wishlistController.updateWishlistItem);

module.exports = router;
