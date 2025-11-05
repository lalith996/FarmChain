const { asyncHandler, AppError } = require('../middleware/errorHandler');
const blockchainService = require('../config/blockchain');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const logger = require('../utils/logger');

/**
 * @desc    Get blockchain connection status
 * @route   GET /api/v1/blockchain/status
 * @access  Public
 */
exports.getStatus = asyncHandler(async (req, res, next) => {
  try {
    const network = await blockchainService.getNetwork();
    const blockNumber = await blockchainService.getBlockNumber();
    const gasPrice = await blockchainService.getGasPrice();

    res.status(200).json({
      success: true,
      data: {
        connected: true,
        network: {
          name: network.name,
          chainId: network.chainId
        },
        blockNumber,
        gasPrice: gasPrice.toString()
      }
    });
  } catch (error) {
    logger.error('Error getting blockchain status:', error);
    return next(new AppError('Failed to get blockchain status', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Verify product on blockchain
 * @route   GET /api/v1/blockchain/verify/product/:productId
 * @access  Public
 */
exports.verifyProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // Get product from database
  const product = await Product.findOne({
    $or: [
      { _id: productId },
      { productId: productId }
    ]
  }).populate('farmer', 'profile.name walletAddress');

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  try {
    // Get product from blockchain
    const blockchainProduct = await blockchainService.getProduct(product.productId);
    
    // Compare data
    const isVerified = blockchainProduct.productId.toString() === product.productId;
    const isOwnerMatch = blockchainProduct.currentOwner.toLowerCase() === product.supplyChain.currentOwnerWallet.toLowerCase();

    res.status(200).json({
      success: true,
      data: {
        verified: isVerified && isOwnerMatch,
        product: {
          id: product.productId,
          name: product.basicInfo.name,
          farmer: product.farmer.profile.name,
          database: {
            owner: product.supplyChain.currentOwnerWallet,
            status: product.supplyChain.status,
            registeredAt: product.createdAt
          },
          blockchain: blockchainProduct
        }
      }
    });
  } catch (error) {
    logger.error('Error verifying product on blockchain:', error);
    return next(new AppError('Failed to verify product on blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Get product history from blockchain
 * @route   GET /api/v1/blockchain/history/product/:productId
 * @access  Public
 */
exports.getProductHistory = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findOne({
    $or: [
      { _id: productId },
      { productId: productId }
    ]
  });

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  try {
    const history = await blockchainService.getProductHistory(product.productId);

    res.status(200).json({
      success: true,
      data: {
        productId: product.productId,
        history
      }
    });
  } catch (error) {
    logger.error('Error getting product history:', error);
    return next(new AppError('Failed to get product history from blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Get transaction details
 * @route   GET /api/v1/blockchain/transaction/:txHash
 * @access  Public
 */
exports.getTransaction = asyncHandler(async (req, res, next) => {
  const { txHash } = req.params;

  try {
    const transaction = await blockchainService.getTransaction(txHash);

    res.status(200).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    logger.error('Error getting transaction:', error);
    return next(new AppError('Failed to get transaction details', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Get payment details from blockchain
 * @route   GET /api/v1/blockchain/payment/:paymentId
 * @access  Private
 */
exports.getPayment = asyncHandler(async (req, res, next) => {
  const { paymentId } = req.params;

  try {
    const payment = await blockchainService.getPayment(paymentId);

    res.status(200).json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    logger.error('Error getting payment:', error);
    return next(new AppError('Failed to get payment details from blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Transfer product ownership on blockchain
 * @route   POST /api/v1/blockchain/transfer
 * @access  Private
 */
exports.transferOwnership = asyncHandler(async (req, res, next) => {
  const { productId, newOwner, location } = req.body;

  if (!productId || !newOwner) {
    return next(new AppError('Please provide product ID and new owner', 400, 'MISSING_FIELDS'));
  }

  // Get product
  const product = await Product.findOne({
    $or: [
      { _id: productId },
      { productId: productId }
    ]
  });

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  // Verify current owner
  if (product.supplyChain.currentOwnerWallet.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
    return next(new AppError('You are not the current owner of this product', 403, 'NOT_OWNER'));
  }

  try {
    // Transfer on blockchain
    const result = await blockchainService.transferOwnership(
      product.productId,
      newOwner,
      location || 'Unknown'
    );

    // Update in database
    product.supplyChain.currentOwnerWallet = newOwner.toLowerCase();
    product.supplyChain.lastUpdated = new Date();
    if (location) {
      product.supplyChain.location = location;
    }

    await product.save();

    logger.info(`Ownership transferred for product ${product.productId}: ${result.txHash}`);

    res.status(200).json({
      success: true,
      data: {
        product,
        transaction: {
          hash: result.txHash,
          newOwner
        }
      },
      message: 'Ownership transferred successfully'
    });
  } catch (error) {
    logger.error('Error transferring ownership:', error);
    return next(new AppError('Failed to transfer ownership on blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Update product status on blockchain
 * @route   POST /api/v1/blockchain/update-status
 * @access  Private
 */
exports.updateProductStatus = asyncHandler(async (req, res, next) => {
  const { productId, status, location, temperature, humidity } = req.body;

  if (!productId || !status) {
    return next(new AppError('Please provide product ID and status', 400, 'MISSING_FIELDS'));
  }

  // Get product
  const product = await Product.findOne({
    $or: [
      { _id: productId },
      { productId: productId }
    ]
  });

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  // Verify ownership
  if (product.supplyChain.currentOwnerWallet.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
    return next(new AppError('You are not the current owner of this product', 403, 'NOT_OWNER'));
  }

  try {
    // Status mapping
    const statusMap = {
      'harvested': 0,
      'in_transit': 1,
      'at_warehouse': 2,
      'sold': 3,
      'delivered': 4
    };

    // Update on blockchain
    const result = await blockchainService.updateProductStatus(
      product.productId,
      statusMap[status],
      location || ''
    );

    // Update in database
    product.supplyChain.status = status;
    product.supplyChain.lastUpdated = new Date();
    if (location) product.supplyChain.location = location;
    if (temperature) product.supplyChain.temperature = temperature;
    if (humidity) product.supplyChain.humidity = humidity;

    await product.save();

    logger.info(`Status updated for product ${product.productId}: ${result.txHash}`);

    res.status(200).json({
      success: true,
      data: {
        product,
        transaction: {
          hash: result.txHash,
          status
        }
      },
      message: 'Product status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating product status:', error);
    return next(new AppError('Failed to update product status on blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Verify message signature
 * @route   POST /api/v1/blockchain/verify-signature
 * @access  Public
 */
exports.verifySignature = asyncHandler(async (req, res, next) => {
  const { message, signature, address } = req.body;

  if (!message || !signature || !address) {
    return next(new AppError('Please provide message, signature, and address', 400, 'MISSING_FIELDS'));
  }

  try {
    const isValid = await blockchainService.verifyMessage(message, signature, address);

    res.status(200).json({
      success: true,
      data: {
        valid: isValid,
        address,
        message
      }
    });
  } catch (error) {
    logger.error('Error verifying signature:', error);
    return next(new AppError('Failed to verify signature', 500, 'VERIFICATION_ERROR'));
  }
});

/**
 * @desc    Get contract information
 * @route   GET /api/v1/blockchain/contracts
 * @access  Public
 */
exports.getContracts = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      supplyChain: {
        address: process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS,
        network: process.env.BLOCKCHAIN_NETWORK
      },
      payment: {
        address: process.env.PAYMENT_CONTRACT_ADDRESS,
        network: process.env.BLOCKCHAIN_NETWORK
      }
    }
  });
});

/**
 * @desc    Get gas estimate for transaction
 * @route   POST /api/v1/blockchain/estimate-gas
 * @access  Public
 */
exports.estimateGas = asyncHandler(async (req, res, next) => {
  const { operation } = req.body;

  if (!operation) {
    return next(new AppError('Please provide operation type', 400, 'MISSING_OPERATION'));
  }

  try {
    // Rough gas estimates (actual values will vary)
    const estimates = {
      registerProduct: '200000',
      transferOwnership: '100000',
      updateStatus: '80000',
      addQualityCheck: '90000',
      createPayment: '150000',
      releasePayment: '100000'
    };

    const gasPrice = await blockchainService.getGasPrice();
    const gasLimit = estimates[operation] || '100000';
    const estimatedCost = (BigInt(gasPrice) * BigInt(gasLimit)).toString();

    res.status(200).json({
      success: true,
      data: {
        operation,
        gasLimit,
        gasPrice: gasPrice.toString(),
        estimatedCost,
        currency: 'Wei'
      }
    });
  } catch (error) {
    logger.error('Error estimating gas:', error);
    return next(new AppError('Failed to estimate gas', 500, 'ESTIMATION_ERROR'));
  }
});
