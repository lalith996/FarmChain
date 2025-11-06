const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');

// Placeholder routes
router.post('/upload', authenticate, (req, res) => {
  res.json({ success: true, message: 'IPFS upload endpoint' });
});

router.get('/retrieve/:hash', (req, res) => {
  res.json({ success: true, message: 'IPFS retrieve endpoint' });
});

module.exports = router;
