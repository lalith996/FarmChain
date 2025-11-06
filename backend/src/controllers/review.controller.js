const Review = require('../models/Review.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');

/**
 * Create a new review
 */
exports.createReview = async (req, res) => {
  try {
    const { orderId, productId, ratings, title, comment, media } = req.body;
    const reviewerId = req.user._id;

    // Validate order exists and belongs to user
    const order = await Order.findOne({ 
      _id: orderId, 
      customer: reviewerId,
      status: 'completed'
    }).populate('seller');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found or not eligible for review' 
      });
    }

    // Check if product is in the order
    const orderItem = order.items.find(item => 
      item.product.toString() === productId
    );

    if (!orderItem) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product not found in this order' 
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ 
      orderId, 
      reviewerId 
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        error: 'You have already reviewed this order' 
      });
    }

    // Validate ratings
    if (!ratings || !ratings.overall || ratings.overall < 1 || ratings.overall > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Overall rating is required and must be between 1 and 5' 
      });
    }

    // Create review
    const review = await Review.create({
      orderId,
      productId,
      sellerId: order.seller._id,
      reviewerId,
      ratings,
      title: title || '',
      comment: comment || '',
      media: media || [],
      isVerifiedPurchase: true,
      status: 'approved' // Auto-approve for now, can add moderation later
    });

    await review.populate([
      { path: 'reviewerId', select: 'profile.name profile.avatar' },
      { path: 'productId', select: 'name images' }
    ]);

    res.status(201).json({ 
      success: true, 
      data: review,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create review' 
    });
  }
};

/**
 * Get reviews for a product
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    const query = { 
      productId, 
      status: 'approved' 
    };

    // Sorting options
    let sortOption = { createdAt: -1 }; // Default: most recent
    if (sort === 'helpful') {
      sortOption = { helpfulVotes: -1, createdAt: -1 };
    } else if (sort === 'rating_high') {
      sortOption = { 'ratings.overall': -1, createdAt: -1 };
    } else if (sort === 'rating_low') {
      sortOption = { 'ratings.overall': 1, createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .populate('reviewerId', 'profile.name profile.avatar')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    // Get rating statistics
    const stats = await Review.getProductAverageRating(productId);

    res.json({ 
      success: true, 
      data: {
        reviews,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch reviews' 
    });
  }
};

/**
 * Get reviews by a seller
 */
exports.getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = { 
      sellerId, 
      status: 'approved' 
    };

    const reviews = await Review.find(query)
      .populate('reviewerId', 'profile.name profile.avatar')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    // Get seller rating statistics
    const stats = await Review.getSellerAverageRating(sellerId);

    res.json({ 
      success: true, 
      data: {
        reviews,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching seller reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch reviews' 
    });
  }
};

/**
 * Get user's reviews
 */
exports.getUserReviews = async (req, res) => {
  try {
    const reviewerId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ reviewerId })
      .populate('productId', 'name images')
      .populate('sellerId', 'profile.name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ reviewerId });

    res.json({ 
      success: true, 
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch reviews' 
    });
  }
};

/**
 * Update a review
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { ratings, title, comment, media } = req.body;
    const reviewerId = req.user._id;

    const review = await Review.findOne({ 
      _id: id, 
      reviewerId 
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        error: 'Review not found' 
      });
    }

    // Update fields
    if (ratings) review.ratings = { ...review.ratings, ...ratings };
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (media) review.media = media;
    
    review.isEdited = true;
    review.editedAt = new Date();

    await review.save();

    res.json({ 
      success: true, 
      data: review,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update review' 
    });
  }
};

/**
 * Delete a review
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user._id;

    const review = await Review.findOne({ 
      _id: id, 
      reviewerId 
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        error: 'Review not found' 
      });
    }

    await review.deleteOne();

    res.json({ 
      success: true, 
      message: 'Review deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete review' 
    });
  }
};

/**
 * Vote on a review (helpful/unhelpful)
 */
exports.voteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body; // 1 for helpful, -1 for unhelpful, 0 to remove vote
    const userId = req.user._id;

    if (![1, -1, 0].includes(vote)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vote must be 1 (helpful), -1 (unhelpful), or 0 (remove)' 
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        error: 'Review not found' 
      });
    }

    // Can't vote on own review
    if (review.reviewerId.toString() === userId.toString()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot vote on your own review' 
      });
    }

    review.updateVote(userId, vote);
    await review.save();

    res.json({ 
      success: true, 
      data: {
        helpfulVotes: review.helpfulVotes,
        unhelpfulVotes: review.unhelpfulVotes,
        userVote: vote
      },
      message: vote === 0 ? 'Vote removed' : 'Vote recorded'
    });
  } catch (error) {
    console.error('Error voting on review:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to vote on review' 
    });
  }
};

/**
 * Add seller response to review
 */
exports.addSellerResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const sellerId = req.user._id;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Response comment is required' 
      });
    }

    const review = await Review.findOne({ 
      _id: id, 
      sellerId 
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        error: 'Review not found or you are not authorized' 
      });
    }

    review.sellerResponse = {
      comment: comment.trim(),
      respondedAt: new Date(),
      respondedBy: sellerId
    };

    await review.save();

    res.json({ 
      success: true, 
      data: review,
      message: 'Response added successfully'
    });
  } catch (error) {
    console.error('Error adding seller response:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add response' 
    });
  }
};

/**
 * Flag a review
 */
exports.flagReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Reason for flagging is required' 
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        error: 'Review not found' 
      });
    }

    // Check if already flagged by this user
    const alreadyFlagged = review.flaggedBy.some(flag => 
      flag.userId.toString() === userId.toString()
    );

    if (alreadyFlagged) {
      return res.status(400).json({ 
        success: false, 
        error: 'You have already flagged this review' 
      });
    }

    review.flaggedBy.push({
      userId,
      reason: reason.trim(),
      flaggedAt: new Date()
    });

    // Auto-flag if multiple users report
    if (review.flaggedBy.length >= 3 && review.status === 'approved') {
      review.status = 'flagged';
    }

    await review.save();

    res.json({ 
      success: true, 
      message: 'Review flagged for moderation'
    });
  } catch (error) {
    console.error('Error flagging review:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to flag review' 
    });
  }
};

/**
 * Check if user can review an order
 */
exports.canReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ 
      _id: orderId, 
      customer: userId,
      status: 'completed'
    });

    if (!order) {
      return res.json({ 
        success: true, 
        data: { canReview: false, reason: 'Order not found or not completed' }
      });
    }

    const existingReview = await Review.findOne({ 
      orderId, 
      reviewerId: userId 
    });

    if (existingReview) {
      return res.json({ 
        success: true, 
        data: { canReview: false, reason: 'Already reviewed', reviewId: existingReview._id }
      });
    }

    res.json({ 
      success: true, 
      data: { canReview: true, order }
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check review eligibility' 
    });
  }
};
