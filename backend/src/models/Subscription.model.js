const mongoose = require('mongoose');

/**
 * Subscription Model
 * Recurring orders for regular customers
 */
const subscriptionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    required: true
  },
  nextDeliveryDate: {
    type: Date,
    required: true,
    index: true
  },
  deliveryAddress: {
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active',
    index: true
  },
  discount: {
    type: Number,
    default: 10, // 10% discount for subscriptions
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  pausedUntil: Date,
  deliveryHistory: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    deliveryDate: Date,
    status: String,
    amount: Number
  }],
  paymentMethod: {
    type: String,
    walletAddress: String
  }
}, {
  timestamps: true
});

// Calculate next delivery date
subscriptionSchema.methods.calculateNextDelivery = function() {
  const current = this.nextDeliveryDate || new Date();
  const next = new Date(current);

  switch (this.frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }

  return next;
};

// Check if subscription is due
subscriptionSchema.methods.isDue = function() {
  return this.status === 'active' && new Date() >= this.nextDeliveryDate;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
