const qrService = require('../services/qr.service');
const Product = require('../models/Product.model');

/**
 * Generate QR code for a product
 */
exports.generateProductQR = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate('farmer', 'profile.name verification.isVerified');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const qrData = qrService.generateProductQRData(product);
    const qrCode = await qrService.generateQRCodeURL(qrData);

    res.json({
      success: true,
      data: {
        qrCode,
        qrData,
        product: {
          id: product._id,
          name: product.name,
          farmer: product.farmer?.profile?.name,
          verified: product.farmer?.verification?.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code'
    });
  }
};

/**
 * Verify product from QR code
 */
exports.verifyProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate('farmer', 'profile verification stats');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get blockchain verification status
    const blockchainVerified = !!product.blockchain?.registrationTxHash;

    res.json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.currentPrice,
          unit: product.unit,
          qualityGrade: product.qualityGrade,
          images: product.images
        },
        farmer: {
          name: product.farmer?.profile?.name,
          verified: product.farmer?.verification?.isVerified,
          rating: product.farmer?.stats?.averageRating,
          location: product.farmer?.profile?.location?.city
        },
        blockchain: {
          verified: blockchainVerified,
          txHash: product.blockchain?.registrationTxHash,
          registeredAt: product.blockchain?.registeredAt
        },
        certifications: product.certifications || [],
        isOrganic: product.isOrganic || false
      }
    });
  } catch (error) {
    console.error('Error verifying product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify product'
    });
  }
};

/**
 * Verify QR code data
 */
exports.verifyQRData = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        error: 'QR data is required'
      });
    }

    const verification = qrService.verifyQRData(qrData);

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        error: verification.error
      });
    }

    // If valid, fetch the product/batch details
    if (verification.data.type === 'product') {
      const product = await Product.findById(verification.data.productId)
        .populate('farmer', 'profile.name verification.isVerified');

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      return res.json({
        success: true,
        data: {
          valid: true,
          type: 'product',
          product: {
            id: product._id,
            name: product.name,
            farmer: product.farmer?.profile?.name,
            verified: product.farmer?.verification?.isVerified,
            blockchainVerified: !!product.blockchain?.registrationTxHash
          }
        }
      });
    }

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Error verifying QR data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify QR data'
    });
  }
};

/**
 * Get product history/timeline
 */
exports.getProductHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate('farmer', 'profile');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Build timeline
    const timeline = [];

    // Registration
    if (product.blockchain?.registeredAt) {
      timeline.push({
        event: 'Blockchain Registration',
        timestamp: product.blockchain.registeredAt,
        details: 'Product registered on blockchain',
        txHash: product.blockchain.registrationTxHash
      });
    }

    // Creation
    timeline.push({
      event: 'Product Listed',
      timestamp: product.createdAt,
      details: `Listed by ${product.farmer?.profile?.name}`,
      location: product.farmer?.profile?.location?.city
    });

    // Sort by timestamp
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name
        },
        timeline
      }
    });
  } catch (error) {
    console.error('Error fetching product history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product history'
    });
  }
};
