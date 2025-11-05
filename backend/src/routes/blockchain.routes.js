const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const blockchainController = require('../controllers/blockchain.controller');

// Public routes
router.get('/status', blockchainController.getStatus);
router.get('/contracts', blockchainController.getContracts);
router.get('/transaction/:txHash', blockchainController.getTransaction);
router.get('/verify/product/:productId', blockchainController.verifyProduct);
router.get('/history/product/:productId', blockchainController.getProductHistory);
router.post('/verify-signature', blockchainController.verifySignature);
router.post('/estimate-gas', blockchainController.estimateGas);

// Protected routes
router.get('/payment/:paymentId', protect, blockchainController.getPayment);
router.post('/transfer', protect, blockchainController.transferOwnership);
router.post('/update-status', protect, blockchainController.updateProductStatus);

module.exports = router;
