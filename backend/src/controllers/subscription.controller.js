const Subscription = require('../models/Subscription.model');
const Product = require('../models/Product.model');

/**
 * Create subscription
 */
exports.createSubscription = async (req, res) => {
  try {
    const { productId, quantity, frequency, deliveryAddress, startDate } = req.body;
    const customerId = req.user._id;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Calculate first delivery date
    const firstDelivery = startDate ? new Date(startDate) : new Date();
    if (firstDelivery < new Date()) {
      firstDelivery.setDate(firstDelivery.getDate() + 1); // Tomorrow
    }

    const subscription = await Subscription.create({
      customerId,
      productId,
      quantity,
      frequency,
      nextDeliveryDate: firstDelivery,
      deliveryAddress,
      discount: 10 // 10% subscription discount
    });

    await subscription.populate('productId', 'name price images');

    res.status(201).json({
      success: true,
      data: subscription,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    logger.error('Error creating subscription:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
};

/**
 * Get user's subscriptions
 */
exports.getUserSubscriptions = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { status } = req.query;

    const query = { customerId };
    if (status) query.status = status;

    const subscriptions = await Subscription.find(query)
      .populate('productId', 'name price images currentPrice')
      .sort({ nextDeliveryDate: 1 });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    logger.error('Error fetching subscriptions:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscriptions'
    });
  }
};

/**
 * Get subscription by ID
 */
exports.getSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user._id;

    const subscription = await Subscription.findOne({ _id: id, customerId })
      .populate('productId', 'name price images')
      .populate('deliveryHistory.orderId', 'orderNumber status');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    logger.error('Error fetching subscription:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription'
    });
  }
};

/**
 * Update subscription
 */
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, frequency, deliveryAddress } = req.body;
    const customerId = req.user._id;

    const subscription = await Subscription.findOne({ _id: id, customerId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    if (quantity) subscription.quantity = quantity;
    if (frequency) subscription.frequency = frequency;
    if (deliveryAddress) subscription.deliveryAddress = deliveryAddress;

    await subscription.save();

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    logger.error('Error updating subscription:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription'
    });
  }
};

/**
 * Pause subscription
 */
exports.pauseSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { pauseUntil } = req.body;
    const customerId = req.user._id;

    const subscription = await Subscription.findOne({ _id: id, customerId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    subscription.status = 'paused';
    subscription.pausedUntil = pauseUntil ? new Date(pauseUntil) : null;
    await subscription.save();

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription paused successfully'
    });
  } catch (error) {
    logger.error('Error pausing subscription:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to pause subscription'
    });
  }
};

/**
 * Resume subscription
 */
exports.resumeSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user._id;

    const subscription = await Subscription.findOne({ _id: id, customerId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    subscription.status = 'active';
    subscription.pausedUntil = null;
    await subscription.save();

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription resumed successfully'
    });
  } catch (error) {
    logger.error('Error resuming subscription:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to resume subscription'
    });
  }
};

/**
 * Cancel subscription
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user._id;

    const subscription = await Subscription.findOne({ _id: id, customerId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    logger.error('Error cancelling subscription:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
};

/**
 * Get due subscriptions (for cron job)
 */
exports.getDueSubscriptions = async (req, res) => {
  try {
    const dueSubscriptions = await Subscription.find({
      status: 'active',
      nextDeliveryDate: { $lte: new Date() }
    }).populate('productId customerId');

    res.json({
      success: true,
      data: dueSubscriptions,
      count: dueSubscriptions.length
    });
  } catch (error) {
    logger.error('Error fetching due subscriptions:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch due subscriptions'
    });
  }
};
