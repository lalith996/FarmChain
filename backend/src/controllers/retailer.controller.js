const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Retailer Controller
 * Handles all retailer-specific operations
 */

// Get retailer dashboard
exports.getDashboard = async (req, res) => {
  try {
    const retailerId = req.user._id;

    // Get sales stats
    const totalSales = await Order.countDocuments({
      seller: retailerId
    });

    const todaySales = await Order.countDocuments({
      seller: retailerId,
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    // Get revenue
    const completedOrders = await Order.find({
      seller: retailerId,
      status: 'completed'
    });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get inventory count
    const inventoryCount = await Product.countDocuments({
      seller: retailerId,
      status: 'active'
    });

    // Get customer count (unique buyers)
    const uniqueCustomers = await Order.distinct('buyer', {
      seller: retailerId
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalSales,
          todaySales,
          totalRevenue,
          inventoryCount,
          customerCount: uniqueCustomers.length
        }
      }
    });
  } catch (error) {
    logger.error('Error getting retailer dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get retailer inventory
exports.getInventory = async (req, res) => {
  try {
    const retailerId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { seller: retailerId };
    if (status) query.status = status;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
    logger.error('Error getting retailer inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

// Get retailer orders (sales)
exports.getOrders = async (req, res) => {
  try {
    const retailerId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { seller: retailerId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('product', 'name images price')
      .populate('buyer', 'profile.name profile.email');

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
    logger.error('Error getting retailer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get purchase orders (from suppliers)
exports.getPurchaseOrders = async (req, res) => {
  try {
    const retailerId = req.user._id;

    const purchaseOrders = await Order.find({
      buyer: retailerId,
      orderType: 'purchase'
    })
      .sort({ createdAt: -1 })
      .populate('product', 'name images price')
      .populate('seller', 'profile.name');

    res.json({
      success: true,
      data: {
        purchaseOrders
      }
    });
  } catch (error) {
    logger.error('Error getting purchase orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase orders',
      error: error.message
    });
  }
};

// Get retailer analytics
exports.getAnalytics = async (req, res) => {
  try {
    const retailerId = req.user._id;
    const { period = '30d' } = req.query;

    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    const orders = await Order.find({
      seller: retailerId,
      createdAt: { $gte: startDate }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    res.json({
      success: true,
      data: {
        period,
        totalRevenue,
        totalOrders,
        salesTrend: []
      }
    });
  } catch (error) {
    logger.error('Error getting retailer analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Get customers
exports.getCustomers = async (req, res) => {
  try {
    const retailerId = req.user._id;

    const customerIds = await Order.distinct('buyer', {
      seller: retailerId
    });

    const customers = await User.find({
      _id: { $in: customerIds }
    }).select('profile walletAddress createdAt');

    res.json({
      success: true,
      data: {
        customers
      }
    });
  } catch (error) {
    logger.error('Error getting customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
};

// Get sales data
exports.getSales = async (req, res) => {
  try {
    const retailerId = req.user._id;

    const sales = await Order.find({
      seller: retailerId,
      status: 'completed'
    })
      .sort({ createdAt: -1 })
      .populate('product', 'name price')
      .populate('buyer', 'profile.name');

    res.json({
      success: true,
      data: {
        sales
      }
    });
  } catch (error) {
    logger.error('Error getting sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales',
      error: error.message
    });
  }
};

// Get store information
exports.getStore = async (req, res) => {
  try {
    const retailer = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        store: retailer.profile || {}
      }
    });
  } catch (error) {
    logger.error('Error getting store:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store',
      error: error.message
    });
  }
};

// Get POS data (placeholder)
exports.getPOS = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        pos: {}
      }
    });
  } catch (error) {
    logger.error('Error getting POS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch POS',
      error: error.message
    });
  }
};

// Get sourcing data (placeholder)
exports.getSourcing = async (req, res) => {
  try {
    const products = await Product.find({
      status: 'active'
    }).limit(50);

    res.json({
      success: true,
      data: {
        suppliers: [],
        availableProducts: products
      }
    });
  } catch (error) {
    logger.error('Error getting sourcing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sourcing',
      error: error.message
    });
  }
};

// Get payments
exports.getPayments = async (req, res) => {
  try {
    const retailerId = req.user._id;

    const payments = await Order.find({
      seller: retailerId,
      paymentStatus: 'completed'
    })
      .sort({ createdAt: -1 })
      .select('totalAmount paymentMethod createdAt');

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

// Get pricing data (placeholder)
exports.getPricing = async (req, res) => {
  try {
    const retailerId = req.user._id;

    const products = await Product.find({
      seller: retailerId
    }).select('name price costPrice');

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    logger.error('Error getting pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing',
      error: error.message
    });
  }
};

// Get promotions (placeholder)
exports.getPromotions = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        promotions: []
      }
    });
  } catch (error) {
    logger.error('Error getting promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promotions',
      error: error.message
    });
  }
};

// Get marketing data (placeholder)
exports.getMarketing = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        campaigns: []
      }
    });
  } catch (error) {
    logger.error('Error getting marketing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketing',
      error: error.message
    });
  }
};

// Get staff data (placeholder)
exports.getStaff = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        staff: []
      }
    });
  } catch (error) {
    logger.error('Error getting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff',
      error: error.message
    });
  }
};

// Get settings
exports.getSettings = async (req, res) => {
  try {
    const retailer = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        settings: retailer.settings || {}
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
