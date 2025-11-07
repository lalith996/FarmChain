const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Farmer Controller
 * Handles all farmer-specific operations
 */

// Get farmer dashboard
exports.getDashboard = async (req, res) => {
  try {
    const farmerId = req.user._id;

    // Get farmer's products
    const totalProducts = await Product.countDocuments({ farmer: farmerId });
    const activeListings = await Product.countDocuments({
      farmer: farmerId,
      status: 'active'
    });

    // Get orders
    const totalOrders = await Order.countDocuments({
      'product.farmer': farmerId
    });
    const pendingOrders = await Order.countDocuments({
      'product.farmer': farmerId,
      status: 'pending'
    });

    // Calculate total earnings
    const completedOrders = await Order.find({
      'product.farmer': farmerId,
      status: 'completed'
    });
    const totalEarnings = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get recent orders
    const recentOrders = await Order.find({ 'product.farmer': farmerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('product', 'name images')
      .populate('buyer', 'profile.name');

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeListings,
          totalOrders,
          pendingOrders,
          totalEarnings
        },
        recentOrders
      }
    });
  } catch (error) {
    logger.error('Error getting farmer dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get farmer's products/inventory
exports.getInventory = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const { page = 1, limit = 20, status, category } = req.query;

    const query = { farmer: farmerId };
    if (status) query.status = status;
    if (category) query.category = category;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

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
    logger.error('Error getting farmer inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

// Get farmer's orders
exports.getOrders = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { 'product.farmer': farmerId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('product', 'name images price')
      .populate('buyer', 'profile.name profile.email')
      .exec();

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
    logger.error('Error getting farmer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get farmer analytics
exports.getAnalytics = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Sales analytics
    const orders = await Order.find({
      'product.farmer': farmerId,
      createdAt: { $gte: startDate }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Product performance
    const productStats = await Order.aggregate([
      {
        $match: {
          'product.farmer': farmerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$product._id',
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          productName: { $first: '$product.name' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        period,
        totalRevenue,
        totalOrders,
        avgOrderValue,
        topProducts: productStats,
        salesTrend: [] // Can be enhanced with daily/weekly breakdown
      }
    });
  } catch (error) {
    logger.error('Error getting farmer analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Get farmer earnings
exports.getEarnings = async (req, res) => {
  try {
    const farmerId = req.user._id;

    const completedOrders = await Order.find({
      'product.farmer': farmerId,
      status: 'completed'
    }).sort({ createdAt: -1 });

    const totalEarnings = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingEarnings = await Order.find({
      'product.farmer': farmerId,
      status: { $in: ['processing', 'shipped'] }
    }).then(orders => orders.reduce((sum, order) => sum + order.totalAmount, 0));

    res.json({
      success: true,
      data: {
        totalEarnings,
        pendingEarnings,
        transactions: completedOrders.map(order => ({
          orderId: order._id,
          amount: order.totalAmount,
          date: order.createdAt,
          status: order.status
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting farmer earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
      error: error.message
    });
  }
};

// Get farmer listings
exports.getListings = async (req, res) => {
  try {
    const farmerId = req.user._id;

    const listings = await Product.find({ farmer: farmerId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { listings }
    });
  } catch (error) {
    logger.error('Error getting farmer listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message
    });
  }
};

// Get ML insights (placeholder)
exports.getMLInsights = async (req, res) => {
  try {
    const farmerId = req.user._id;

    // This would integrate with ML service
    const insights = {
      priceRecommendations: [],
      demandForecast: [],
      cropHealth: [],
      weatherPredictions: []
    };

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    logger.error('Error getting ML insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ML insights',
      error: error.message
    });
  }
};

// Get farmer certifications
exports.getCertifications = async (req, res) => {
  try {
    const farmer = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        certifications: farmer.certifications || []
      }
    });
  } catch (error) {
    logger.error('Error getting certifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certifications',
      error: error.message
    });
  }
};

// Get crops data (placeholder)
exports.getCrops = async (req, res) => {
  try {
    // This would be fetched from a crops management system
    res.json({
      success: true,
      data: {
        crops: []
      }
    });
  } catch (error) {
    logger.error('Error getting crops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crops',
      error: error.message
    });
  }
};

// Get fields data (placeholder)
exports.getFields = async (req, res) => {
  try {
    // This would be fetched from a fields management system
    res.json({
      success: true,
      data: {
        fields: []
      }
    });
  } catch (error) {
    logger.error('Error getting fields:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fields',
      error: error.message
    });
  }
};

// Get weather data (placeholder)
exports.getWeather = async (req, res) => {
  try {
    // This would integrate with weather API
    res.json({
      success: true,
      data: {
        current: {},
        forecast: []
      }
    });
  } catch (error) {
    logger.error('Error getting weather:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather',
      error: error.message
    });
  }
};

// Get equipment data (placeholder)
exports.getEquipment = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        equipment: []
      }
    });
  } catch (error) {
    logger.error('Error getting equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Get harvest data (placeholder)
exports.getHarvest = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        harvests: []
      }
    });
  } catch (error) {
    logger.error('Error getting harvest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch harvest',
      error: error.message
    });
  }
};

// Get marketplace data
exports.getMarket = async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    logger.error('Error getting market:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market',
      error: error.message
    });
  }
};

// Get finance data
exports.getFinance = async (req, res) => {
  try {
    const farmerId = req.user._id;

    const earnings = await Order.find({
      'product.farmer': farmerId,
      status: 'completed'
    }).then(orders => orders.reduce((sum, order) => sum + order.totalAmount, 0));

    res.json({
      success: true,
      data: {
        totalEarnings: earnings,
        transactions: [],
        expenses: []
      }
    });
  } catch (error) {
    logger.error('Error getting finance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch finance',
      error: error.message
    });
  }
};
