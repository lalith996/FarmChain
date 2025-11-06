const mongoose = require('mongoose');

/**
 * Review Model
 * Blockchain-verified product and seller reviews
 */
const reviewSchema = new mongoose.Schema({
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true,
    index: true
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true,
    index: true
  },
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  reviewerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Rating categories
  ratings: {
    overall: { 
      type: Number, 
      min: 1, 
      max: 5, 
      required: true 
    },
    quality: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    delivery: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    communication: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    valueForMoney: { 
      type: Number, 
      min: 1, 
      max: 5 
    }
  },
  
  // Review content
  title: { 
    type: String, 
    maxlength: 100,
    trim: true
  },
  comment: { 
    type: String, 
    maxlength: 1000,
    trim: true
  },
  
  // Media attachments
  media: [{
    type: { 
      type: String, 
      enum: ['image', 'video'] 
    },
    url: String,
    thumbnail: String
  }],
  
  // Blockchain verification
  blockchainHash: {
    type: String,
    index: true
  },
  isVerifiedPurchase: { 
    type: Boolean, 
    default: true 
  },
  
  // Community engagement
  helpfulVotes: { 
    type: Number, 
    default: 0 
  },
  unhelpfulVotes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    vote: { 
      type: Number, 
      enum: [-1, 1] 
    }
  }],
  
  // Seller response
  sellerResponse: {
    comment: {
      type: String,
      maxlength: 500
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Moderation
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'flagged', 'removed'],
    default: 'approved',
    index: true
  },
  flaggedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moderationNotes: String,
  
  // Metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, { 
  timestamps: true 
});

// Indexes for performance
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1, createdAt: -1 });
reviewSchema.index({ 'ratings.overall': -1 });

// Prevent duplicate reviews per order
reviewSchema.index({ orderId: 1, reviewerId: 1 }, { unique: true });

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  const total = this.helpfulVotes + this.unhelpfulVotes;
  if (total === 0) return 0;
  return Math.round((this.helpfulVotes / total) * 100);
});

// Virtual for average rating (if category ratings exist)
reviewSchema.virtual('averageCategoryRating').get(function() {
  const ratings = [];
  if (this.ratings.quality) ratings.push(this.ratings.quality);
  if (this.ratings.delivery) ratings.push(this.ratings.delivery);
  if (this.ratings.communication) ratings.push(this.ratings.communication);
  if (this.ratings.valueForMoney) ratings.push(this.ratings.valueForMoney);
  
  if (ratings.length === 0) return this.ratings.overall;
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
});

// Method to check if user has voted
reviewSchema.methods.hasUserVoted = function(userId) {
  return this.votedBy.some(vote => 
    vote.userId.toString() === userId.toString()
  );
};

// Method to get user's vote
reviewSchema.methods.getUserVote = function(userId) {
  const vote = this.votedBy.find(vote => 
    vote.userId.toString() === userId.toString()
  );
  return vote ? vote.vote : 0;
};

// Method to add/update vote
reviewSchema.methods.updateVote = function(userId, voteValue) {
  const existingVoteIndex = this.votedBy.findIndex(vote => 
    vote.userId.toString() === userId.toString()
  );
  
  if (existingVoteIndex > -1) {
    const oldVote = this.votedBy[existingVoteIndex].vote;
    
    // Remove old vote count
    if (oldVote === 1) this.helpfulVotes--;
    if (oldVote === -1) this.unhelpfulVotes--;
    
    // Update or remove vote
    if (voteValue === 0) {
      this.votedBy.splice(existingVoteIndex, 1);
    } else {
      this.votedBy[existingVoteIndex].vote = voteValue;
    }
  } else if (voteValue !== 0) {
    this.votedBy.push({ userId, vote: voteValue });
  }
  
  // Add new vote count
  if (voteValue === 1) this.helpfulVotes++;
  if (voteValue === -1) this.unhelpfulVotes++;
  
  return this;
};

// Static method to calculate seller's average rating
reviewSchema.statics.getSellerAverageRating = async function(sellerId) {
  const result = await this.aggregate([
    {
      $match: {
        sellerId: mongoose.Types.ObjectId(sellerId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$ratings.overall' },
        totalReviews: { $sum: 1 },
        averageQuality: { $avg: '$ratings.quality' },
        averageDelivery: { $avg: '$ratings.delivery' },
        averageCommunication: { $avg: '$ratings.communication' },
        averageValue: { $avg: '$ratings.valueForMoney' }
      }
    }
  ]);
  
  return result[0] || {
    averageRating: 0,
    totalReviews: 0,
    averageQuality: 0,
    averageDelivery: 0,
    averageCommunication: 0,
    averageValue: 0
  };
};

// Static method to calculate product's average rating
reviewSchema.statics.getProductAverageRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: {
        productId: mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$ratings.overall' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$ratings.overall'
        }
      }
    }
  ]);
  
  if (!result[0]) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
  
  // Calculate rating distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  result[0].ratingDistribution.forEach(rating => {
    distribution[Math.round(rating)]++;
  });
  
  return {
    averageRating: result[0].averageRating,
    totalReviews: result[0].totalReviews,
    distribution
  };
};

// Pre-save middleware to update product/seller ratings
reviewSchema.post('save', async function() {
  try {
    // Update product rating
    const Product = mongoose.model('Product');
    const productStats = await this.constructor.getProductAverageRating(this.productId);
    await Product.findByIdAndUpdate(this.productId, {
      'ratings.average': productStats.averageRating,
      'ratings.count': productStats.totalReviews
    });
    
    // Update seller rating
    const User = mongoose.model('User');
    const sellerStats = await this.constructor.getSellerAverageRating(this.sellerId);
    await User.findByIdAndUpdate(this.sellerId, {
      'stats.averageRating': sellerStats.averageRating,
      'stats.ratingCount': sellerStats.totalReviews
    });
  } catch (error) {
    console.error('Error updating ratings:', error);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
