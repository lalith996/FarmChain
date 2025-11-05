const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: true,
    index: true
  },
  blockchainTxHash: {
    type: String,
    index: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  farmerWallet: {
    type: String,
    required: true
  },
  basicInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['grains', 'vegetables', 'fruits', 'dairy', 'pulses', 'spices', 'other'],
      index: true
    },
    subCategory: String,
    variety: String,
    description: String,
    images: [String],
    certifications: [String]
  },
  farmDetails: {
    farmName: String,
    farmLocation: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    sowingDate: Date,
    harvestDate: Date,
    farmingMethod: {
      type: String,
      enum: ['organic', 'conventional', 'hydroponic', 'greenhouse']
    },
    pesticidesUsed: [{
      name: String,
      quantity: String,
      date: Date
    }],
    fertilizersUsed: [{
      name: String,
      quantity: String,
      date: Date
    }]
  },
  quantity: {
    available: {
      type: Number,
      required: true,
      min: 0
    },
    sold: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'quintal', 'ton', 'liter', 'dozen', 'piece']
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    priceHistory: [{
      price: Number,
      date: Date,
      reason: String
    }]
  },
  quality: {
    grade: {
      type: String,
      enum: ['A', 'B', 'C'],
      default: 'A'
    },
    moistureContent: Number,
    defects: Number,
    aiQualityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    qualityReports: [{
      reportType: String,
      reportHash: String,
      date: Date,
      inspector: String
    }]
  },
  supplyChain: {
    currentOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    currentOwnerWallet: String,
    status: {
      type: String,
      enum: ['harvested', 'in_transit', 'at_warehouse', 'sold', 'delivered'],
      default: 'harvested',
      index: true
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    temperature: Number,
    humidity: Number,
    lastUpdated: Date
  },
  batchInfo: {
    batchNumber: String,
    totalBatches: Number,
    batchSize: Number
  },
  blockchain: {
    contractAddress: String,
    tokenId: String,
    registrationTxHash: String,
    registrationBlock: Number,
    lastUpdateTxHash: String,
    lastUpdateBlock: Number
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    orders: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ 'basicInfo.category': 1, 'supplyChain.status': 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'farmDetails.farmLocation.coordinates': '2dsphere' });

// Methods
productSchema.methods.updateQuantity = async function(soldQuantity) {
  this.quantity.available -= soldQuantity;
  this.quantity.sold += soldQuantity;
  await this.save();
};

productSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  await this.save();
};

module.exports = mongoose.model('Product', productSchema);
