const mongoose = require('mongoose');

/**
 * Bulk Pricing Model
 * Volume-based pricing tiers for products
 */
const bulkPricingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true,
    index: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tiers: [{
    minQuantity: {
      type: Number,
      required: true,
      min: 1
    },
    maxQuantity: Number, // null for unlimited
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0
    },
    discount: Number // percentage discount from base price
  }],
  minimumOrderQuantity: {
    type: Number,
    default: 1,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: Date,
  validUntil: Date
}, {
  timestamps: true
});

// Sort tiers by minQuantity
bulkPricingSchema.pre('save', function(next) {
  this.tiers.sort((a, b) => a.minQuantity - b.minQuantity);
  next();
});

// Method to get price for quantity
bulkPricingSchema.methods.getPriceForQuantity = function(quantity) {
  if (quantity < this.minimumOrderQuantity) {
    return null; // Below minimum order quantity
  }

  // Find applicable tier
  let applicableTier = null;
  for (const tier of this.tiers) {
    if (quantity >= tier.minQuantity) {
      if (!tier.maxQuantity || quantity <= tier.maxQuantity) {
        applicableTier = tier;
        break;
      }
    }
  }

  if (!applicableTier && this.tiers.length > 0) {
    // Use highest tier if quantity exceeds all tiers
    applicableTier = this.tiers[this.tiers.length - 1];
  }

  return applicableTier ? {
    pricePerUnit: applicableTier.pricePerUnit,
    discount: applicableTier.discount || 0,
    totalPrice: applicableTier.pricePerUnit * quantity,
    tier: applicableTier
  } : null;
};

module.exports = mongoose.model('BulkPricing', bulkPricingSchema);
