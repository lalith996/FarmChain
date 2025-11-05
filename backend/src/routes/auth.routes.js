const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-wallet', authController.verifyWallet);

// Protected routes
router.post('/refresh-token', authController.refreshToken);
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;
