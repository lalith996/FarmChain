const BulkPricing = require('../models/BulkPricing.model');
const Product = require('../models/Product.model');

/**
 * Create or update bulk pricing for a product
 */
exports.setBulkPricing = async (req, res) => {
  try {
    const { productId, tiers, minimumOrderQuantity, validFrom, validUntil } = req.body;
    const sellerId = req.user._id;

    // Verify product exists and belongs to seller
    const product = await Product.findOne({ _id: productId, farmer: sellerId });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or you are not authorized'
      });
    }

    // Validate tiers
    if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one pricing tier is required'
      });
    }

    // Check if bulk pricing already exists
    let bulkPricing = await BulkPricing.findOne({ productId });

    if (bulkPricing) {
      // Update existing
      bulkPricing.tiers = tiers;
      if (minimumOrderQuantity) bulkPricing.minimumOrderQuantity = minimumOrderQuantity;
      if (validFrom) bulkPricing.validFrom = validFrom;
      if (validUntil) bulkPricing.validUntil = validUntil;
      await bulkPricing.save();
    } else {
      // Create new
      bulkPricing = await BulkPricing.create({
        productId,
        sellerId,
        tiers,
        minimumOrderQuantity: minimumOrderQuantity || 1,
        validFrom,
        validUntil
      });
    }

    res.status(201).json({
      success: true,
      data: bulkPricing,
      message: 'Bulk pricing set successfully'
    });
  } catch (error) {
    console.error('Error setting bulk pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set bulk pricing'
    });
  }
};

/**
 * Get bulk pricing for a product
 */
exports.getBulkPricing = async (req, res) => {
  try {
    const { productId } = req.params;

    const bulkPricing = await BulkPricing.findOne({ 
      productId, 
      isActive: true 
    }).populate('productId', 'name currentPrice');

    if (!bulkPricing) {
      return res.status(404).json({
        success: false,
        error: 'No bulk pricing found for this product'
      });
    }

    res.json({
      success: true,
      data: bulkPricing
    });
  } catch (error) {
    console.error('Error fetching bulk pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bulk pricing'
    });
  }
};

/**
 * Calculate price for quantity
 */
exports.calculatePrice = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required'
      });
    }

    const bulkPricing = await BulkPricing.findOne({ 
      productId, 
      isActive: true 
    });

    if (!bulkPricing) {
      // No bulk pricing, use regular price
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      return res.json({
        success: true,
        data: {
          pricePerUnit: product.currentPrice,
          totalPrice: product.currentPrice * quantity,
          discount: 0,
          hasBulkPricing: false
        }
      });
    }

    const priceInfo = bulkPricing.getPriceForQuantity(quantity);

    if (!priceInfo) {
      return res.status(400).json({
        success: false,
        error: `Minimum order quantity is ${bulkPricing.minimumOrderQuantity}`
      });
    }

    res.json({
      success: true,
      data: {
        ...priceInfo,
        hasBulkPricing: true,
        minimumOrderQuantity: bulkPricing.minimumOrderQuantity
      }
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate price'
    });
  }
};

/**
 * Get all bulk pricing for seller
 */
exports.getSellerBulkPricing = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const bulkPricings = await BulkPricing.find({ sellerId })
      .populate('productId', 'name currentPrice images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await BulkPricing.countDocuments({ sellerId });

    res.json({
      success: true,
      data: {
        bulkPricings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching seller bulk pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bulk pricing'
    });
  }
};

/**
 * Delete bulk pricing
 */
exports.deleteBulkPricing = async (req, res) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user._id;

    const bulkPricing = await BulkPricing.findOne({ productId, sellerId });

    if (!bulkPricing) {
      return res.status(404).json({
        success: false,
        error: 'Bulk pricing not found'
      });
    }

    await bulkPricing.deleteOne();

    res.json({
      success: true,
      message: 'Bulk pricing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bulk pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete bulk pricing'
    });
  }
};

/**
 * Toggle bulk pricing active status
 */
exports.toggleBulkPricing = async (req, res) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user._id;

    const bulkPricing = await BulkPricing.findOne({ productId, sellerId });

    if (!bulkPricing) {
      return res.status(404).json({
        success: false,
        error: 'Bulk pricing not found'
      });
    }

    bulkPricing.isActive = !bulkPricing.isActive;
    await bulkPricing.save();

    res.json({
      success: true,
      data: bulkPricing,
      message: `Bulk pricing ${bulkPricing.isActive ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    console.error('Error toggling bulk pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle bulk pricing'
    });
  }
};
