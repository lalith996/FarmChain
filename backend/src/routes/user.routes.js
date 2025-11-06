const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

// User routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/dashboard', authenticate, userController.getDashboard);
router.delete('/account', authenticate, userController.deleteAccount);

// KYC routes
router.post('/kyc/upload', authenticate, userController.uploadKYC);
router.put('/:userId/verify', authenticate, requireRole('ADMIN'), userController.verifyKYC);

// Public routes
router.get('/search', userController.searchUsers);
router.get('/:userId', userController.getUserById);

// Admin routes
router.get('/', authenticate, requireRole('ADMIN'), userController.getAllUsers);
router.get('/stats/overview', authenticate, requireRole('ADMIN'), userController.getUserStats);

module.exports = router;
