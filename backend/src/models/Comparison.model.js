const mongoose = require('mongoose');

/**
 * Product Comparison Model
 * Stores user's product comparisons for sharing
 */
const comparisonSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }],
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, {
  timestamps: true
});

// Auto-generate share token for public comparisons
comparisonSchema.pre('save', function(next) {
  if (this.isPublic && !this.shareToken) {
    this.shareToken = require('crypto').randomBytes(16).toString('hex');
  }
  next();
});

// TTL index to auto-delete expired comparisons
comparisonSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Comparison', comparisonSchema);
