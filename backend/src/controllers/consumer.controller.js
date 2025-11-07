const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Consumer Controller
 * Handles all consumer-specific operations
 */

// Get consumer dashboard
exports.getDashboard = async (req, res) => {
  try {
    const consumerId = req.user._id;

    // Get order stats
    const totalOrders = await Order.countDocuments({
      buyer: consumerId
    });

    const activeOrders = await Order.countDocuments({
      buyer: consumerId,
      status: { $in: ['pending', 'processing', 'shipped'] }
    });

    // Get total spent
    const completedOrders = await Order.find({
      buyer: consumerId,
      status: 'delivered'
    });
    const totalSpent = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get recent orders
    const recentOrders = await Order.find({
      buyer: consumerId
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('product', 'name images price');

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          activeOrders,
          totalSpent
        },
        recentOrders
      }
    });
  } catch (error) {
    logger.error('Error getting consumer dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get consumer orders
exports.getOrders = async (req, res) => {
  try {
    const consumerId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { buyer: consumerId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('product', 'name images price')
      .populate('seller', 'profile.name');

    const count = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    logger.error('Error getting consumer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get products (marketplace for consumer)
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;

    const query = { status: 'active' };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('farmer', 'profile.name');

    const count = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    logger.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get cart (placeholder - typically stored in frontend or separate cart collection)
exports.getCart = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        cart: {
          items: [],
          total: 0
        }
      }
    });
  } catch (error) {
    logger.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

// Get checkout data
exports.getCheckout = async (req, res) => {
  try {
    const consumer = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        shippingAddress: consumer.profile?.location || {},
        paymentMethods: []
      }
    });
  } catch (error) {
    logger.error('Error getting checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch checkout',
      error: error.message
    });
  }
};

// Get wishlist
exports.getWishlist = async (req, res) => {
  try {
    const consumerId = req.user._id;

    // Assuming wishlist is stored in Wishlist model
    const Wishlist = require('../models/Wishlist');
    const wishlist = await Wishlist.findOne({ user: consumerId })
      .populate('products');

    res.json({
      success: true,
      data: {
        wishlist: wishlist ? wishlist.products : []
      }
    });
  } catch (error) {
    logger.error('Error getting wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

// Get reviews
exports.getReviews = async (req, res) => {
  try {
    const consumerId = req.user._id;

    // Assuming reviews are stored in Review model
    const Review = require('../models/Review');
    const reviews = await Review.find({ user: consumerId })
      .populate('product', 'name images');

    res.json({
      success: true,
      data: {
        reviews
      }
    });
  } catch (error) {
    logger.error('Error getting reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Get delivery information
exports.getDelivery = async (req, res) => {
  try {
    const consumerId = req.user._id;

    const activeDeliveries = await Order.find({
      buyer: consumerId,
      status: { $in: ['processing', 'shipped'] }
    })
      .populate('product', 'name images')
      .populate('seller', 'profile.name');

    res.json({
      success: true,
      data: {
        activeDeliveries
      }
    });
  } catch (error) {
    logger.error('Error getting delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery',
      error: error.message
    });
  }
};

// Get payments
exports.getPayments = async (req, res) => {
  try {
    const consumerId = req.user._id;

    const payments = await Order.find({
      buyer: consumerId,
      paymentStatus: 'completed'
    })
      .select('totalAmount paymentMethod createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        payments
      }
    });
  } catch (error) {
    logger.error('Error getting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get loyalty data (placeholder)
exports.getLoyalty = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        points: 0,
        tier: 'bronze',
        rewards: []
      }
    });
  } catch (error) {
    logger.error('Error getting loyalty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty',
      error: error.message
    });
  }
};

// Get support data (placeholder)
exports.getSupport = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        tickets: []
      }
    });
  } catch (error) {
    logger.error('Error getting support:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support',
      error: error.message
    });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const consumer = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        profile: consumer.profile || {}
      }
    });
  } catch (error) {
    logger.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Get settings
exports.getSettings = async (req, res) => {
  try {
    const consumer = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        settings: consumer.settings || {}
      }
    });
  } catch (error) {
    logger.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};
