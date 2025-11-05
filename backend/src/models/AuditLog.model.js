const mongoose = require('mongoose');

/**
 * AuditLog Schema
 * Tracks all significant user actions for security and compliance
 */
const auditLogSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  walletAddress: {
    type: String,
    lowercase: true,
    index: true
  },

  // Action Details
  action: {
    type: String,
    required: [true, 'Action is required'],
    index: true
  },

  actionCategory: {
    type: String,
    enum: [
      'authentication',
      'authorization',
      'user_management',
      'product_management',
      'order_management',
      'payment',
      'admin_action',
      'blockchain',
      'system'
    ],
    required: true,
    index: true
  },

  // Resource Information
  resource: {
    type: String,
    enum: ['User', 'Product', 'Order', 'Payment', 'Role', 'Permission', 'System'],
    index: true
  },

  resourceId: {
    type: String,
    index: true
  },

  // HTTP Request Information
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    index: true
  },

  endpoint: {
    type: String,
    index: true
  },

  statusCode: {
    type: Number,
    index: true
  },

  // Request/Response Data (sanitized)
  requestBody: {
    type: mongoose.Schema.Types.Mixed,
    select: false // Don't include by default for privacy
  },

  responseBody: {
    type: mongoose.Schema.Types.Mixed,
    select: false
  },

  // Network Information
  ipAddress: {
    type: String,
    index: true
  },

  userAgent: {
    type: String
  },

  // Timing
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },

  duration: {
    type: Number, // milliseconds
    index: true
  },

  // Status
  success: {
    type: Boolean,
    default: true,
    index: true
  },

  errorMessage: {
    type: String
  },

  errorStack: {
    type: String,
    select: false
  },

  // Additional Metadata
  metadata: {
    roleAtTime: String,
    permissionsAtTime: [String],
    blockchainTxHash: {
      type: String,
      index: true
    },
    affectedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    oldValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed,
    customData: mongoose.Schema.Types.Mixed
  },

  // Security Flags
  securityFlags: {
    isSuspicious: {
      type: Boolean,
      default: false,
      index: true
    },
    suspicionReason: String,
    isCritical: {
      type: Boolean,
      default: false,
      index: true
    },
    requiresReview: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String
  }
}, {
  timestamps: false, // We use custom timestamp field
  capped: { size: 1073741824, max: 10000000 } // 1GB cap, max 10M documents
});

// Indexes for efficient querying
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ walletAddress: 1, timestamp: -1 });
auditLogSchema.index({ 'metadata.blockchainTxHash': 1 });
auditLogSchema.index({ actionCategory: 1, timestamp: -1 });
auditLogSchema.index({ success: 1, timestamp: -1 });
auditLogSchema.index({ 'securityFlags.isSuspicious': 1, timestamp: -1 });
auditLogSchema.index({ 'securityFlags.isCritical': 1, timestamp: -1 });

// TTL index - auto-delete logs older than 90 days (except critical)
auditLogSchema.index(
  { timestamp: 1 },
  { 
    expireAfterSeconds: 7776000, // 90 days
    partialFilterExpression: { 'securityFlags.isCritical': false }
  }
);

// Static methods

/**
 * Log an action
 */
auditLogSchema.statics.logAction = async function(data) {
  try {
    // Sanitize sensitive data
    const sanitizedData = this.sanitizeData(data);

    // Determine if action is critical
    const criticalActions = [
      'user:delete',
      'role:grant',
      'role:revoke',
      'user:suspend',
      'admin:backup_database',
      'payment:refund',
      'blockchain:contract_deploy'
    ];

    const isCritical = criticalActions.some(action => 
      sanitizedData.action.includes(action)
    );

    const log = new this({
      ...sanitizedData,
      timestamp: new Date(),
      securityFlags: {
        isCritical,
        ...sanitizedData.securityFlags
      }
    });

    await log.save();
    return log;
  } catch (error) {
    // Log to console if database logging fails
    console.error('Failed to create audit log:', error);
    return null;
  }
};

/**
 * Sanitize sensitive data
 */
auditLogSchema.statics.sanitizeData = function(data) {
  const sensitiveFields = [
    'password',
    'passwordHash',
    'twoFactorSecret',
    'privateKey',
    'sessionToken',
    'refreshToken',
    'accessToken',
    'apiKey',
    'secret'
  ];

  const sanitized = { ...data };

  // Sanitize request body
  if (sanitized.requestBody) {
    sanitized.requestBody = this.sanitizeObject(
      sanitized.requestBody,
      sensitiveFields
    );
  }

  // Sanitize response body
  if (sanitized.responseBody) {
    sanitized.responseBody = this.sanitizeObject(
      sanitized.responseBody,
      sensitiveFields
    );
  }

  return sanitized;
};

/**
 * Recursively sanitize an object
 */
auditLogSchema.statics.sanitizeObject = function(obj, sensitiveFields) {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = this.sanitizeObject(value, sensitiveFields);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Get logs for user
 */
auditLogSchema.statics.getUserLogs = async function(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    startDate,
    endDate,
    action,
    success
  } = options;

  const query = { user: userId };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  if (action) {
    query.action = new RegExp(action, 'i');
  }

  if (success !== undefined) {
    query.success = success;
  }

  return await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .select('-requestBody -responseBody -errorStack');
};

/**
 * Get suspicious activities
 */
auditLogSchema.statics.getSuspiciousActivities = async function(options = {}) {
  const {
    limit = 100,
    skip = 0,
    startDate,
    endDate
  } = options;

  const query = {
    'securityFlags.isSuspicious': true,
    'securityFlags.requiresReview': true
  };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  return await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'walletAddress profile.name primaryRole');
};

/**
 * Get critical actions
 */
auditLogSchema.statics.getCriticalActions = async function(options = {}) {
  const {
    limit = 100,
    skip = 0,
    startDate,
    endDate
  } = options;

  const query = { 'securityFlags.isCritical': true };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  return await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'walletAddress profile.name primaryRole')
    .populate('securityFlags.reviewedBy', 'profile.name');
};

/**
 * Get action statistics
 */
auditLogSchema.statics.getActionStats = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = new Date(startDate);
    if (endDate) matchStage.timestamp.$lte = new Date(endDate);
  }

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$actionCategory',
        total: { $sum: 1 },
        successful: {
          $sum: { $cond: ['$success', 1, 0] }
        },
        failed: {
          $sum: { $cond: ['$success', 0, 1] }
        },
        suspicious: {
          $sum: { $cond: ['$securityFlags.isSuspicious', 1, 0] }
        },
        avgDuration: { $avg: '$duration' }
      }
    },
    { $sort: { total: -1 } }
  ]);
};

/**
 * Mark log as suspicious
 */
auditLogSchema.methods.markSuspicious = async function(reason) {
  this.securityFlags.isSuspicious = true;
  this.securityFlags.suspicionReason = reason;
  this.securityFlags.requiresReview = true;
  await this.save();
};

/**
 * Review and resolve suspicious log
 */
auditLogSchema.methods.review = async function(reviewerId, notes) {
  this.securityFlags.requiresReview = false;
  this.securityFlags.reviewedBy = reviewerId;
  this.securityFlags.reviewedAt = new Date();
  this.securityFlags.reviewNotes = notes;
  await this.save();
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
