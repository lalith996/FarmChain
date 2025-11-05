const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerWallet: {
    type: String,
    required: true,
    lowercase: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerWallet: {
    type: String,
    required: true,
    lowercase: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSnapshot: {
    productId: String,
    name: String,
    category: String,
    images: [String],
    grade: String
  },
  orderDetails: {
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  delivery: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    expectedDate: Date,
    actualDate: Date,
    trackingNumber: String,
    carrier: String
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'payment_initiated',
      'payment_completed',
      'processing',
      'shipped',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'refunded',
      'disputed'
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    location: String
  }],
  payment: {
    paymentId: String,
    method: {
      type: String,
      enum: ['crypto', 'escrow', 'cod', 'online'],
      default: 'escrow'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionHash: String,
    paidAt: Date,
    refundedAt: Date
  },
  blockchain: {
    contractAddress: String,
    orderTxHash: String,
    paymentTxHash: String,
    transferTxHash: String
  },
  qualityVerification: {
    required: {
      type: Boolean,
      default: false
    },
    completed: {
      type: Boolean,
      default: false
    },
    result: {
      type: String,
      enum: ['passed', 'failed', 'pending'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationDate: Date,
    reportHash: String,
    notes: String
  },
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    reason: String,
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    raisedAt: Date,
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed'],
      default: 'open'
    },
    resolution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  ratings: {
    buyerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      date: Date
    },
    sellerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      date: Date
    }
  },
  notes: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ product: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for calculating days since order
orderSchema.virtual('daysSinceOrder').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '', location = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy,
    notes,
    location
  });
  return this.save();
};

// Method to mark payment as completed
orderSchema.methods.completePayment = function(transactionHash) {
  this.payment.status = 'completed';
  this.payment.transactionHash = transactionHash;
  this.payment.paidAt = new Date();
  this.status = 'payment_completed';
  return this.save();
};

// Method to raise a dispute
orderSchema.methods.raiseDispute = function(reason, raisedBy) {
  this.dispute.isDisputed = true;
  this.dispute.reason = reason;
  this.dispute.raisedBy = raisedBy;
  this.dispute.raisedAt = new Date();
  this.dispute.status = 'open';
  this.status = 'disputed';
  return this.save();
};

// Method to calculate platform fee
orderSchema.methods.calculatePlatformFee = function(feePercentage = 2) {
  return (this.orderDetails.totalAmount * feePercentage) / 100;
};

// Pre-save middleware to add initial status to history
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      notes: 'Order created'
    });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
