const DeliveryUpdate = require('../models/DeliveryUpdate.model');
const Order = require('../models/Order.model');

/**
 * Add delivery update
 */
exports.addUpdate = async (req, res) => {
  try {
    const { orderId, status, message, location, locationName, estimatedDelivery, metadata } = req.body;
    const updatedBy = req.user._id;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Create delivery update
    const update = await DeliveryUpdate.create({
      orderId,
      status,
      message,
      location,
      locationName,
      estimatedDelivery,
      updatedBy,
      metadata: metadata || {}
    });

    // Update order status
    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      update.actualDelivery = new Date();
      await update.save();
    }
    await order.save();

    // TODO: Send notification to customer
    // await notificationService.sendDeliveryUpdate(order, update);

    res.status(201).json({
      success: true,
      data: update,
      message: 'Delivery update added successfully'
    });
  } catch (error) {
    console.error('Error adding delivery update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add delivery update'
    });
  }
};

/**
 * Get delivery updates for an order
 */
exports.getOrderUpdates = async (req, res) => {
  try {
    const { orderId } = req.params;

    const updates = await DeliveryUpdate.find({ orderId })
      .populate('updatedBy', 'profile.name')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: updates
    });
  } catch (error) {
    console.error('Error fetching delivery updates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch delivery updates'
    });
  }
};

/**
 * Get latest update for an order
 */
exports.getLatestUpdate = async (req, res) => {
  try {
    const { orderId } = req.params;

    const update = await DeliveryUpdate.findOne({ orderId })
      .sort({ createdAt: -1 })
      .populate('updatedBy', 'profile.name');

    if (!update) {
      return res.status(404).json({
        success: false,
        error: 'No updates found for this order'
      });
    }

    res.json({
      success: true,
      data: update
    });
  } catch (error) {
    console.error('Error fetching latest update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest update'
    });
  }
};

/**
 * Get delivery timeline (formatted for display)
 */
exports.getTimeline = async (req, res) => {
  try {
    const { orderId } = req.params;

    const updates = await DeliveryUpdate.find({ orderId })
      .sort({ createdAt: 1 })
      .select('status message locationName createdAt estimatedDelivery actualDelivery');

    const timeline = updates.map(update => ({
      status: update.status,
      message: update.message,
      location: update.locationName,
      timestamp: update.createdAt,
      estimatedDelivery: update.estimatedDelivery,
      actualDelivery: update.actualDelivery,
      isCompleted: true
    }));

    // Add future steps if not delivered
    const latestStatus = updates[updates.length - 1]?.status;
    if (latestStatus !== 'delivered' && latestStatus !== 'cancelled') {
      const futureSteps = getFutureSteps(latestStatus);
      timeline.push(...futureSteps.map(step => ({
        status: step.status,
        message: step.message,
        location: null,
        timestamp: null,
        estimatedDelivery: null,
        actualDelivery: null,
        isCompleted: false
      })));
    }

    res.json({
      success: true,
      data: {
        timeline,
        currentStatus: latestStatus,
        totalSteps: timeline.length,
        completedSteps: updates.length
      }
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timeline'
    });
  }
};

// Helper function to get future steps
function getFutureSteps(currentStatus) {
  const allSteps = [
    { status: 'order_placed', message: 'Order placed' },
    { status: 'confirmed', message: 'Order confirmed' },
    { status: 'preparing', message: 'Preparing your order' },
    { status: 'ready_for_pickup', message: 'Ready for pickup' },
    { status: 'picked_up', message: 'Picked up by carrier' },
    { status: 'in_transit', message: 'In transit' },
    { status: 'out_for_delivery', message: 'Out for delivery' },
    { status: 'delivered', message: 'Delivered' }
  ];

  const currentIndex = allSteps.findIndex(step => step.status === currentStatus);
  return allSteps.slice(currentIndex + 1);
}
