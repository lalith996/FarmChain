const mongoose = require('mongoose');

/**
 * Delivery Update Model
 * Tracks delivery status updates for orders
 */
const deliveryUpdateSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: [
      'order_placed',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'failed'
    ],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number] // [longitude, latitude]
  },
  locationName: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    carrier: String,
    trackingNumber: String,
    vehicleNumber: String,
    driverName: String,
    driverPhone: String
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for geospatial queries
deliveryUpdateSchema.index({ location: '2dsphere' });

// Index for order timeline
deliveryUpdateSchema.index({ orderId: 1, createdAt: 1 });

module.exports = mongoose.model('DeliveryUpdate', deliveryUpdateSchema);
