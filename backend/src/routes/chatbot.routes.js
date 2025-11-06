const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const chatbotController = require('../controllers/chatbot.controller');

// Public routes
router.post('/message', chatbotController.sendMessage);
router.get('/suggestions', chatbotController.getSuggestions);

// Protected routes
router.use(authenticate);
router.get('/history', chatbotController.getChatHistory);
router.delete('/history', chatbotController.clearHistory);

module.exports = router;
