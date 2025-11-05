const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const blockchainService = require('../config/blockchain');
const logger = require('../utils/logger');

/**
 * @desc    Register a new product
 * @route   POST /api/v1/products/register
 * @access  Private (Farmer only)
 */
exports.registerProduct = asyncHandler(async (req, res, next) => {
  const {
    basicInfo,
    farmDetails,
    quantity,
    pricing,
    quality,
    batchInfo
  } = req.body;

  // Validate required fields
  if (!basicInfo?.name || !quantity?.available || !quantity?.unit || !pricing?.basePrice) {
    return next(new AppError('Please provide all required fields', 400, 'MISSING_FIELDS'));
  }

  // Register product on blockchain
  try {
    const blockchainData = await blockchainService.registerProduct({
      name: basicInfo.name,
      category: basicInfo.category,
      quantity: quantity.available,
      unit: quantity.unit,
      pricePerUnit: pricing.basePrice,
      harvestDate: farmDetails?.harvestDate || new Date(),
      grade: quality?.grade === 'A' ? 0 : quality?.grade === 'B' ? 1 : 2,
      ipfsHash: basicInfo.images?.[0] || 'QmDefault'
    });

    // Create product in database
    const product = await Product.create({
      productId: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      blockchainTxHash: blockchainData.txHash,
      farmer: req.user._id,
      farmerWallet: req.user.walletAddress,
      basicInfo: {
        ...basicInfo,
        certifications: basicInfo.certifications || []
      },
      farmDetails: {
        ...farmDetails,
        farmLocation: {
          address: farmDetails?.farmLocation?.address || '',
          coordinates: farmDetails?.farmLocation?.coordinates || {}
        }
      },
      quantity: {
        available: quantity.available,
        sold: 0,
        unit: quantity.unit
      },
      pricing: {
        basePrice: pricing.basePrice,
        currentPrice: pricing.currentPrice || pricing.basePrice,
        currency: pricing.currency || 'INR',
        priceHistory: [{
          price: pricing.basePrice,
          date: new Date(),
          reason: 'Initial price'
        }]
      },
      quality: {
        grade: quality?.grade || 'A',
        moistureContent: quality?.moistureContent,
        defects: quality?.defects || 0,
        aiQualityScore: quality?.aiQualityScore
      },
      supplyChain: {
        currentOwner: req.user._id,
        currentOwnerWallet: req.user.walletAddress,
        status: 'harvested',
        lastUpdated: new Date()
      },
      batchInfo,
      blockchain: {
        contractAddress: process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS,
        registrationTxHash: blockchainData.txHash,
        registrationBlock: blockchainData.blockNumber
      }
    });

    logger.info(`Product registered: ${product.productId} by ${req.user.walletAddress}`);

    res.status(201).json({
      success: true,
      data: {
        product,
        blockchain: blockchainData
      },
      message: 'Product registered successfully'
    });
  } catch (error) {
    logger.error('Error registering product:', error);
    return next(new AppError('Failed to register product on blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Get all products with pagination and filters
 * @route   GET /api/v1/products
 * @access  Public
 */
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = { isActive: true };

  if (req.query.category) {
    filter['basicInfo.category'] = req.query.category;
  }

  if (req.query.status) {
    filter['supplyChain.status'] = req.query.status;
  }

  if (req.query.farmer) {
    filter.farmerWallet = req.query.farmer.toLowerCase();
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter['pricing.currentPrice'] = {};
    if (req.query.minPrice) filter['pricing.currentPrice'].$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter['pricing.currentPrice'].$lte = parseFloat(req.query.maxPrice);
  }

  // Execute query with pagination
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('farmer', 'profile.name walletAddress rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * @desc    Get product by ID
 * @route   GET /api/v1/products/:productId
 * @access  Public
 */
exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({
    $or: [
      { _id: req.params.productId },
      { productId: req.params.productId }
    ]
  })
    .populate('farmer', 'profile.name profile.location walletAddress rating verification.isVerified')
    .populate('supplyChain.currentOwner', 'profile.name walletAddress');

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  // Increment views
  await product.incrementViews();

  // Get blockchain verification
  let blockchainVerification = null;
  try {
    const blockchainProduct = await blockchainService.getProduct(product.productId);
    blockchainVerification = {
      verified: true,
      onChain: blockchainProduct
    };
  } catch (error) {
    logger.warn(`Could not verify product on blockchain: ${error.message}`);
  }

  res.status(200).json({
    success: true,
    data: {
      product,
      blockchain: blockchainVerification
    }
  });
});

/**
 * @desc    Update product
 * @route   PUT /api/v1/products/:productId
 * @access  Private (Farmer/Admin)
 */
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({
    $or: [
      { _id: req.params.productId },
      { productId: req.params.productId }
    ]
  });

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  // Check ownership
  if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this product', 403, 'FORBIDDEN'));
  }

  // Update allowed fields
  const allowedUpdates = ['basicInfo', 'farmDetails', 'pricing', 'quantity'];
  allowedUpdates.forEach(field => {
    if (req.body[field]) {
      product[field] = { ...product[field].toObject(), ...req.body[field] };
    }
  });

  // If price is updated, add to history
  if (req.body.pricing?.currentPrice && req.body.pricing.currentPrice !== product.pricing.currentPrice) {
    product.pricing.priceHistory.push({
      price: req.body.pricing.currentPrice,
      date: new Date(),
      reason: req.body.pricing.priceChangeReason || 'Price updated'
    });
  }

  await product.save();

  res.status(200).json({
    success: true,
    data: { product },
    message: 'Product updated successfully'
  });
});

/**
 * @desc    Delete/deactivate product
 * @route   DELETE /api/v1/products/:productId
 * @access  Private (Farmer/Admin)
 */
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({
    $or: [
      { _id: req.params.productId },
      { productId: req.params.productId }
    ]
  });

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  // Check ownership
  if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this product', 403, 'FORBIDDEN'));
  }

  // Soft delete
  product.isActive = false;
  await product.save();

  logger.info(`Product deactivated: ${product.productId}`);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

/**
 * @desc    Get product supply chain history
 * @route   GET /api/v1/products/:productId/history
 * @access  Public
 */
exports.getProductHistory = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({
    $or: [
      { _id: req.params.productId },
      { productId: req.params.productId }
    ]
  });

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  // Get blockchain history
  try {
    const blockchainHistory = await blockchainService.getProductHistory(product.productId);
    
    res.status(200).json({
      success: true,
      data: {
        productId: product.productId,
        currentStatus: product.supplyChain.status,
        history: blockchainHistory,
        qualityChecks: product.quality.qualityReports
      }
    });
  } catch (error) {
    logger.error('Error fetching blockchain history:', error);
    return next(new AppError('Could not fetch product history', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Verify product on blockchain
 * @route   GET /api/v1/products/:productId/verify
 * @access  Public
 */
exports.verifyProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({
    $or: [
      { _id: req.params.productId },
      { productId: req.params.productId }
    ]
  });

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  try {
    const blockchainProduct = await blockchainService.getProduct(product.productId);
    const isVerified = blockchainProduct.productId.toString() === product.productId;

    res.status(200).json({
      success: true,
      data: {
        verified: isVerified,
        product: {
          database: {
            productId: product.productId,
            farmer: product.farmerWallet,
            createdAt: product.createdAt
          },
          blockchain: blockchainProduct
        }
      }
    });
  } catch (error) {
    logger.error('Error verifying product:', error);
    return next(new AppError('Could not verify product on blockchain', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Add quality check to product
 * @route   POST /api/v1/products/:productId/quality-check
 * @access  Private (Farmer/Admin)
 */
exports.addQualityCheck = asyncHandler(async (req, res, next) => {
  const { grade, reportHash, notes, moistureContent, defects } = req.body;

  const product = await Product.findOne({
    $or: [
      { _id: req.params.productId },
      { productId: req.params.productId }
    ]
  });

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  // Check authorization
  if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403, 'FORBIDDEN'));
  }

  // Add to blockchain
  try {
    const gradeValue = grade === 'A' ? 0 : grade === 'B' ? 1 : 2;
    await blockchainService.addQualityCheck(
      product.productId,
      gradeValue,
      reportHash || 'QmQualityReport',
      notes || 'Quality check performed'
    );

    // Update product
    product.quality.grade = grade;
    if (moistureContent) product.quality.moistureContent = moistureContent;
    if (defects !== undefined) product.quality.defects = defects;

    product.quality.qualityReports.push({
      reportType: 'manual',
      reportHash: reportHash || '',
      date: new Date(),
      inspector: req.user.walletAddress
    });

    await product.save();

    logger.info(`Quality check added for product: ${product.productId}`);

    res.status(200).json({
      success: true,
      data: { product },
      message: 'Quality check added successfully'
    });
  } catch (error) {
    logger.error('Error adding quality check:', error);
    return next(new AppError('Failed to add quality check', 500, 'BLOCKCHAIN_ERROR'));
  }
});

/**
 * @desc    Get farmer's products
 * @route   GET /api/v1/products/farmer/:farmerId
 * @access  Private
 */
exports.getFarmerProducts = asyncHandler(async (req, res, next) => {
  const farmer = await User.findById(req.params.farmerId);

  if (!farmer) {
    return next(new AppError('Farmer not found', 404, 'FARMER_NOT_FOUND'));
  }

  const products = await Product.find({
    farmer: farmer._id,
    isActive: true
  })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: {
      farmer: {
        id: farmer._id,
        name: farmer.profile.name,
        walletAddress: farmer.walletAddress,
        rating: farmer.rating
      },
      products,
      count: products.length
    }
  });
});

/**
 * @desc    Search products
 * @route   GET /api/v1/products/search
 * @access  Public
 */
exports.searchProducts = asyncHandler(async (req, res, next) => {
  const { q, category, minPrice, maxPrice, grade } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build search query
  const searchFilter = { isActive: true };

  if (q) {
    searchFilter.$or = [
      { 'basicInfo.name': { $regex: q, $options: 'i' } },
      { 'basicInfo.description': { $regex: q, $options: 'i' } },
      { 'basicInfo.category': { $regex: q, $options: 'i' } }
    ];
  }

  if (category) {
    searchFilter['basicInfo.category'] = category;
  }

  if (minPrice || maxPrice) {
    searchFilter['pricing.currentPrice'] = {};
    if (minPrice) searchFilter['pricing.currentPrice'].$gte = parseFloat(minPrice);
    if (maxPrice) searchFilter['pricing.currentPrice'].$lte = parseFloat(maxPrice);
  }

  if (grade) {
    searchFilter['quality.grade'] = grade;
  }

  const [products, total] = await Promise.all([
    Product.find(searchFilter)
      .populate('farmer', 'profile.name walletAddress rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(searchFilter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      searchQuery: q
    }
  });
});
