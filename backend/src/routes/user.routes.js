const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

// User routes
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/dashboard', protect, userController.getDashboard);
router.delete('/account', protect, userController.deleteAccount);

// KYC routes
router.post('/kyc/upload', protect, userController.uploadKYC);
router.put('/:userId/verify', protect, authorize('admin'), userController.verifyKYC);

// Public routes
router.get('/search', userController.searchUsers);
router.get('/:userId', userController.getUserById);

// Admin routes
router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.get('/stats/overview', protect, authorize('admin'), userController.getUserStats);

module.exports = router;
