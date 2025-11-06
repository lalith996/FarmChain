const mongoose = require('mongoose');

/**
 * Wishlist Model
 * Allows users to save products for later purchase
 */
const wishlistSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  name: { 
    type: String, 
    default: 'My Wishlist',
    maxlength: 100
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    addedAt: { 
      type: Date, 
      default: Date.now 
    },
    notes: {
      type: String,
      maxlength: 500
    },
    priceWhenAdded: Number,
    notifyOnPriceDrop: { 
      type: Boolean, 
      default: false 
    },
    notifyOnStock: { 
      type: Boolean, 
      default: false 
    }
  }],
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  }
}, { 
  timestamps: true 
});

// Ensure user has only one default wishlist
wishlistSchema.index({ userId: 1, isDefault: 1 }, { 
  unique: true, 
  partialFilterExpression: { isDefault: true } 
});

// Compound index for efficient queries
wishlistSchema.index({ userId: 1, createdAt: -1 });

// Generate share token before save
wishlistSchema.pre('save', function(next) {
  if (this.isPublic && !this.shareToken) {
    this.shareToken = require('crypto').randomBytes(16).toString('hex');
  }
  next();
});

// Virtual for item count
wishlistSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.items.some(item => 
    item.productId.toString() === productId.toString()
  );
};

// Method to add product
wishlistSchema.methods.addProduct = function(productId, price, notes) {
  if (!this.hasProduct(productId)) {
    this.items.push({
      productId,
      priceWhenAdded: price,
      notes
    });
  }
  return this;
};

// Method to remove product
wishlistSchema.methods.removeProduct = function(productId) {
  this.items = this.items.filter(item => 
    item.productId.toString() !== productId.toString()
  );
  return this;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
