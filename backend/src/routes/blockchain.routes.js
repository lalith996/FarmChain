const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
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
router.get('/payment/:paymentId', authenticate, blockchainController.getPayment);
router.post('/transfer', authenticate, blockchainController.transferOwnership);
router.post('/update-status', authenticate, blockchainController.updateProductStatus);

module.exports = router;
