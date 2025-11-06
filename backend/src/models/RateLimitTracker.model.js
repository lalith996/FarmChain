const mongoose = require('mongoose');

/**
 * RateLimitTracker Schema
 * Tracks rate limits for users to prevent abuse
 */
const rateLimitTrackerSchema = new mongoose.Schema({
  // User identification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },

  // Action being rate limited
  action: {
    type: String,
    required: true,
    enum: [
      'api_call',
      'blockchain_tx',
      'product_creation',
      'order_creation',
      'login_attempt',
      'kyc_submission',
      'password_reset',
      'email_send',
      'notification_send'
    ],
    index: true
  },

  // Rate limit window
  windowType: {
    type: String,
    enum: ['minute', 'hour', 'day', 'week', 'month'],
    required: true
  },

  windowStart: {
    type: Date,
    required: true,
    index: true
  },

  windowEnd: {
    type: Date,
    required: true,
    index: true
  },

  // Tracking
  count: {
    type: Number,
    default: 0,
    required: true
  },

  limit: {
    type: Number,
    required: true
  },

  // Block status
  isBlocked: {
    type: Boolean,
    default: false,
    index: true
  },

  blockReason: String,

  blockedAt: Date,

  blockedUntil: Date,

  // Violation tracking
  violations: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    attemptedCount: Number,
    ipAddress: String
  }],

  // Metadata
  metadata: {
    ipAddresses: [String],
    userAgent: String,
    lastAttemptAt: Date,
    totalViolations: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
rateLimitTrackerSchema.index({ userId: 1, action: 1, windowStart: 1 });
rateLimitTrackerSchema.index({ walletAddress: 1, action: 1, windowStart: 1 });
rateLimitTrackerSchema.index({ isBlocked: 1, blockedUntil: 1 });

// TTL index - auto-delete expired records
rateLimitTrackerSchema.index(
  { windowEnd: 1 },
  { expireAfterSeconds: 86400 } // Delete 24 hours after window ends
);

// Static methods

/**
 * Check if user is within rate limit
 */
rateLimitTrackerSchema.statics.checkLimit = async function(userId, walletAddress, action, limit, windowType = 'minute') {
  const now = new Date();
  const windowStart = this.getWindowStart(now, windowType);
  const windowEnd = this.getWindowEnd(windowStart, windowType);

  // Find or create tracker
  let tracker = await this.findOne({
    userId,
    action,
    windowStart: { $lte: now },
    windowEnd: { $gte: now }
  });

  if (!tracker) {
    // Create new tracker for this window
    tracker = new this({
      userId,
      walletAddress,
      action,
      windowType,
      windowStart,
      windowEnd,
      count: 0,
      limit
    });
  }

  // Check if blocked
  if (tracker.isBlocked && tracker.blockedUntil && tracker.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: tracker.blockedUntil,
      isBlocked: true,
      reason: tracker.blockReason
    };
  }

  // Unblock if block period has expired
  if (tracker.isBlocked && tracker.blockedUntil && tracker.blockedUntil <= now) {
    tracker.isBlocked = false;
    tracker.blockedUntil = null;
    tracker.blockReason = null;
    await tracker.save();
  }

  // Check limit
  const allowed = tracker.count < tracker.limit;
  const remaining = Math.max(0, tracker.limit - tracker.count);

  return {
    allowed,
    remaining,
    resetAt: tracker.windowEnd,
    isBlocked: false,
    current: tracker.count,
    limit: tracker.limit
  };
};

/**
 * Increment rate limit counter
 * FIX #26: Use atomic operations to prevent race conditions
 */
rateLimitTrackerSchema.statics.increment = async function(userId, walletAddress, action, limit, windowType = 'minute', ipAddress = null) {
  const now = new Date();
  const windowStart = this.getWindowStart(now, windowType);
  const windowEnd = this.getWindowEnd(windowStart, windowType);

  // FIX #26: Use atomic findOneAndUpdate with conditional blocking
  // This prevents race conditions by doing everything in a single atomic operation
  const updateOps = {
    $inc: { count: 1 },
    $set: {
      walletAddress,
      limit,
      'metadata.lastAttemptAt': now
    },
    $setOnInsert: {
      windowType,
      windowStart,
      windowEnd,
      isBlocked: false
    }
  };

  // Add IP address if provided
  if (ipAddress) {
    updateOps.$addToSet = { 'metadata.ipAddresses': ipAddress };
  }

  // Atomically increment and retrieve the updated document
  const tracker = await this.findOneAndUpdate(
    {
      userId,
      action,
      windowStart: { $lte: now },
      windowEnd: { $gte: now }
    },
    updateOps,
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  );

  // FIX #26: Check if limit exceeded AFTER atomic increment
  // Use a separate atomic update to set block status if needed
  if (tracker.count > tracker.limit && !tracker.isBlocked) {
    // Atomic update to block - only if not already blocked (prevents duplicate blocks)
    await this.findOneAndUpdate(
      {
        _id: tracker._id,
        isBlocked: false, // Only block if not already blocked
        count: { $gt: limit } // Double-check count is still over limit
      },
      {
        $set: {
          isBlocked: true,
          blockReason: 'Rate limit exceeded',
          blockedAt: now,
          blockedUntil: new Date(Date.now() + this._getBlockDuration(windowType))
        },
        $push: {
          violations: {
            timestamp: now,
            attemptedCount: tracker.count,
            ipAddress: ipAddress || tracker.metadata.ipAddresses[tracker.metadata.ipAddresses.length - 1]
          }
        },
        $inc: { 'metadata.totalViolations': 1 }
      }
    );
  }

  // Fetch the final state
  return await this.findById(tracker._id);
};

/**
 * Helper to get block duration in milliseconds
 * @private
 */
rateLimitTrackerSchema.statics._getBlockDuration = function(windowType) {
  const durationMs = {
    'minute': 60 * 1000,
    'hour': 60 * 60 * 1000,
    'day': 24 * 60 * 60 * 1000,
    'week': 7 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000
  };
  return durationMs[windowType] || durationMs.hour;
};

/**
 * Reset rate limit for user
 */
rateLimitTrackerSchema.statics.reset = async function(userId, action = null) {
  const query = { userId };
  if (action) {
    query.action = action;
  }

  await this.deleteMany(query);
};

/**
 * Get user's current rate limit status
 */
rateLimitTrackerSchema.statics.getStatus = async function(userId) {
  const now = new Date();
  
  const trackers = await this.find({
    userId,
    windowStart: { $lte: now },
    windowEnd: { $gte: now }
  });

  return trackers.map(tracker => ({
    action: tracker.action,
    current: tracker.count,
    limit: tracker.limit,
    remaining: Math.max(0, tracker.limit - tracker.count),
    resetAt: tracker.windowEnd,
    isBlocked: tracker.isBlocked && tracker.blockedUntil > now,
    blockedUntil: tracker.blockedUntil
  }));
};

/**
 * Get window start time
 */
rateLimitTrackerSchema.statics.getWindowStart = function(now, windowType) {
  const date = new Date(now);

  switch (windowType) {
    case 'minute':
      date.setSeconds(0, 0);
      break;
    case 'hour':
      date.setMinutes(0, 0, 0);
      break;
    case 'day':
      date.setHours(0, 0, 0, 0);
      break;
    case 'week':
      date.setDate(date.getDate() - date.getDay());
      date.setHours(0, 0, 0, 0);
      break;
    case 'month':
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      break;
  }

  return date;
};

/**
 * Get window end time
 */
rateLimitTrackerSchema.statics.getWindowEnd = function(windowStart, windowType) {
  const date = new Date(windowStart);

  switch (windowType) {
    case 'minute':
      date.setMinutes(date.getMinutes() + 1);
      break;
    case 'hour':
      date.setHours(date.getHours() + 1);
      break;
    case 'day':
      date.setDate(date.getDate() + 1);
      break;
    case 'week':
      date.setDate(date.getDate() + 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() + 1);
      break;
  }

  return date;
};

// Instance methods

/**
 * Block user for rate limit violation
 */
rateLimitTrackerSchema.methods.block = async function(reason, duration = 'hour') {
  const durationMs = {
    'minute': 60 * 1000,
    'hour': 60 * 60 * 1000,
    'day': 24 * 60 * 60 * 1000
  };

  this.isBlocked = true;
  this.blockReason = reason;
  this.blockedAt = new Date();
  this.blockedUntil = new Date(Date.now() + (durationMs[duration] || durationMs.hour));
  
  this.violations.push({
    timestamp: new Date(),
    attemptedCount: this.count,
    ipAddress: this.metadata.ipAddresses[this.metadata.ipAddresses.length - 1]
  });

  this.metadata.totalViolations++;

  await this.save();
};

/**
 * Unblock user
 */
rateLimitTrackerSchema.methods.unblock = async function() {
  this.isBlocked = false;
  this.blockReason = null;
  this.blockedUntil = null;
  await this.save();
};

/**
 * Check if currently blocked
 */
rateLimitTrackerSchema.methods.isCurrentlyBlocked = function() {
  return this.isBlocked && this.blockedUntil && this.blockedUntil > new Date();
};

const RateLimitTracker = mongoose.model('RateLimitTracker', rateLimitTrackerSchema);

module.exports = RateLimitTracker;
