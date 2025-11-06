const Comparison = require('../models/Comparison.model');
const Product = require('../models/Product.model');

/**
 * Create or update comparison
 */
exports.saveComparison = async (req, res) => {
  try {
    const { productIds, isPublic } = req.body;
    const userId = req.user?._id;

    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 products are required for comparison'
      });
    }

    if (productIds.length > 4) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 4 products can be compared'
      });
    }

    // Verify all products exist
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        error: 'One or more products not found'
      });
    }

    const comparison = await Comparison.create({
      userId,
      products: productIds,
      isPublic: isPublic || false
    });

    res.status(201).json({
      success: true,
      data: comparison,
      message: 'Comparison saved successfully'
    });
  } catch (error) {
    console.error('Error saving comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save comparison'
    });
  }
};

/**
 * Get comparison by ID or token
 */
exports.getComparison = async (req, res) => {
  try {
    const { id } = req.params;
    
    let comparison;
    
    // Check if it's a share token (hex string)
    if (id.length === 32 && /^[a-f0-9]+$/.test(id)) {
      comparison = await Comparison.findOne({ shareToken: id, isPublic: true });
    } else {
      comparison = await Comparison.findById(id);
    }

    if (!comparison) {
      return res.status(404).json({
        success: false,
        error: 'Comparison not found'
      });
    }

    // Populate products with full details
    await comparison.populate({
      path: 'products',
      populate: {
        path: 'farmer',
        select: 'profile.name verification.isVerified stats.averageRating'
      }
    });

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error fetching comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comparison'
    });
  }
};

/**
 * Compare products (without saving)
 */
exports.compareProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 products are required for comparison'
      });
    }

    if (productIds.length > 4) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 4 products can be compared'
      });
    }

    const products = await Product.find({ _id: { $in: productIds } })
      .populate('farmer', 'profile.name verification.isVerified stats.averageRating');

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        error: 'One or more products not found'
      });
    }

    // Generate comparison matrix
    const matrix = {
      products,
      attributes: {
        price: products.map(p => p.pricing?.currentPrice || p.currentPrice || 0),
        quality: products.map(p => p.quality?.grade || p.qualityGrade || 'N/A'),
        availability: products.map(p => p.quantity?.available || p.quantityAvailable || 0),
        rating: products.map(p => p.ratings?.average || 0),
        certifications: products.map(p => p.certifications || []),
        organic: products.map(p => p.isOrganic || false),
        farmerVerified: products.map(p => p.farmer?.verification?.isVerified || false),
        farmerRating: products.map(p => p.farmer?.stats?.averageRating || 0)
      }
    };

    res.json({
      success: true,
      data: matrix
    });
  } catch (error) {
    console.error('Error comparing products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare products'
    });
  }
};

/**
 * Delete comparison
 */
exports.deleteComparison = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comparison = await Comparison.findOne({ _id: id, userId });

    if (!comparison) {
      return res.status(404).json({
        success: false,
        error: 'Comparison not found'
      });
    }

    await comparison.deleteOne();

    res.json({
      success: true,
      message: 'Comparison deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comparison'
    });
  }
};
