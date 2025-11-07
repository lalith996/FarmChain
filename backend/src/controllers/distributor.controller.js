const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Distributor Controller
 * Handles all distributor-specific operations
 */

// Get distributor dashboard
exports.getDashboard = async (req, res) => {
  try {
    const distributorId = req.user._id;

    // Get active shipments
    const activeShipments = await Order.countDocuments({
      distributor: distributorId,
      status: { $in: ['processing', 'shipped'] }
    });

    // Get total deliveries
    const totalDeliveries = await Order.countDocuments({
      distributor: distributorId,
      status: 'delivered'
    });

    // Get vehicles/fleet count (placeholder)
    const fleetCount = 0;

    // Get warehouse inventory count (placeholder)
    const inventoryCount = 0;

    res.json({
      success: true,
      data: {
        stats: {
          activeShipments,
          totalDeliveries,
          fleetCount,
          inventoryCount
        }
      }
    });
  } catch (error) {
    logger.error('Error getting distributor dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get distributor orders
exports.getOrders = async (req, res) => {
  try {
    const distributorId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { distributor: distributorId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('product', 'name images')
      .populate('buyer', 'profile.name');

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
    logger.error('Error getting distributor orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const distributorId = req.user._id;

    const deliveries = await Order.countDocuments({
      distributor: distributorId,
      status: 'delivered'
    });

    res.json({
      success: true,
      data: {
        totalDeliveries: deliveries,
        onTimeDeliveries: 0,
        lateDeliveries: 0,
        averageDeliveryTime: 0
      }
    });
  } catch (error) {
    logger.error('Error getting distributor analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Get warehouse data (placeholder)
exports.getWarehouse = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        warehouses: [],
        inventory: []
      }
    });
  } catch (error) {
    logger.error('Error getting warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch warehouse',
      error: error.message
    });
  }
};

// Get logistics data (placeholder)
exports.getLogistics = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        routes: [],
        shipments: []
      }
    });
  } catch (error) {
    logger.error('Error getting logistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logistics',
      error: error.message
    });
  }
};

// Get fleet data (placeholder)
exports.getFleet = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        vehicles: []
      }
    });
  } catch (error) {
    logger.error('Error getting fleet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fleet',
      error: error.message
    });
  }
};

// Get routes data (placeholder)
exports.getRoutes = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        routes: []
      }
    });
  } catch (error) {
    logger.error('Error getting routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch routes',
      error: error.message
    });
  }
};

// Get tracking data
exports.getTracking = async (req, res) => {
  try {
    const distributorId = req.user._id;

    const shipments = await Order.find({
      distributor: distributorId,
      status: { $in: ['processing', 'shipped'] }
    })
      .populate('product', 'name')
      .populate('buyer', 'profile.name');

    res.json({
      success: true,
      data: {
        activeShipments: shipments
      }
    });
  } catch (error) {
    logger.error('Error getting tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking',
      error: error.message
    });
  }
};

// Get retailers (placeholder)
exports.getRetailers = async (req, res) => {
  try {
    const retailers = await User.find({
      role: 'RETAILER'
    }).select('profile walletAddress');

    res.json({
      success: true,
      data: {
        retailers
      }
    });
  } catch (error) {
    logger.error('Error getting retailers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch retailers',
      error: error.message
    });
  }
};

// Get suppliers (placeholder)
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await User.find({
      role: 'FARMER'
    }).select('profile walletAddress');

    res.json({
      success: true,
      data: {
        suppliers
      }
    });
  } catch (error) {
    logger.error('Error getting suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: error.message
    });
  }
};

// Get sourcing data
exports.getSourcing = async (req, res) => {
  try {
    const products = await Product.find({
      status: 'active'
    }).limit(50);

    res.json({
      success: true,
      data: {
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

// Get quality data (placeholder)
exports.getQuality = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        inspections: [],
        reports: []
      }
    });
  } catch (error) {
    logger.error('Error getting quality:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quality',
      error: error.message
    });
  }
};

// Get finance data
exports.getFinance = async (req, res) => {
  try {
    const distributorId = req.user._id;

    const completedOrders = await Order.find({
      distributor: distributorId,
      status: 'delivered'
    });

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        expenses: [],
        profit: totalRevenue
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

// Get inventory
exports.getInventory = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        inventory: []
      }
    });
  } catch (error) {
    logger.error('Error getting inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

// Get settings
exports.getSettings = async (req, res) => {
  try {
    const distributor = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        settings: distributor.settings || {}
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
