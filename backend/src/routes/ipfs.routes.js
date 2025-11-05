const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder routes
router.post('/upload', protect, (req, res) => {
  res.json({ success: true, message: 'IPFS upload endpoint' });
});

router.get('/retrieve/:hash', (req, res) => {
  res.json({ success: true, message: 'IPFS retrieve endpoint' });
});

module.exports = router;
