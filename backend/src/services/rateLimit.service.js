const User = require('../models/UserRBAC.model');
const Role = require('../models/Role.model');
const RateLimitTracker = require('../models/RateLimitTracker.model');
const AuditLog = require('../models/AuditLog.model');

/**
 * Rate Limit Service
 * Handles rate limit checking, incrementing, resetting, and violation tracking
 */
class RateLimitService {
  /**
   * Check if user is within rate limit for an action
   * @param {object} data - Rate limit check data
   * @returns {object} - Rate limit status
   */
  async checkRateLimit(data) {
    const { userId, walletAddress, action, windowType = 'minute' } = data;

    // Get user and their role
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get role rate limits
    const role = await Role.findOne({ name: user.primaryRole });
    if (!role) {
      throw new Error('Role not found');
    }

    // Get limit for action
    const limit = this._getActionLimit(role, action, windowType);

    // Check rate limit
    const result = await RateLimitTracker.checkLimit(
      userId,
      walletAddress || user.walletAddress,
      action,
      limit,
      windowType
    );

    return {
      action,
      windowType,
      limit,
      current: limit - result.remaining,
      remaining: result.remaining,
      resetAt: result.resetAt,
      isAllowed: result.allowed,
      isBlocked: result.isBlocked
    };
  }

  /**
   * Increment rate limit counter for an action
   * @param {object} data - Rate limit increment data
   * @returns {object} - Updated rate limit status
   */
  async incrementRateLimit(data) {
    const { userId, walletAddress, action, windowType = 'minute', ipAddress } = data;

    // Get user and their role
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get role rate limits
    const role = await Role.findOne({ name: user.primaryRole });
    if (!role) {
      throw new Error('Role not found');
    }

    // Get limit for action
    const limit = this._getActionLimit(role, action, windowType);

    // Increment counter
    const result = await RateLimitTracker.increment(
      userId,
      walletAddress || user.walletAddress,
      action,
      limit,
      windowType,
      ipAddress
    );

    // If limit exceeded and auto-blocked, log the violation
    if (!result.allowed && result.isBlocked) {
      await AuditLog.logAction({
        user: userId,
        walletAddress: user.walletAddress,
        action: 'rate_limit:exceeded',
        actionCategory: 'security',
        ipAddress,
        success: false,
        metadata: {
          limitAction: action,
          windowType,
          limit,
          count: result.count,
          autoBlocked: true
        },
        securityFlags: {
          isSuspicious: true,
          isCritical: result.count > limit * 1.5 // More than 50% over limit
        }
      });
    }

    return {
      action,
      windowType,
      limit,
      current: result.count,
      remaining: Math.max(0, limit - result.count),
      resetAt: result.resetAt,
      isAllowed: result.allowed,
      isBlocked: result.isBlocked
    };
  }

  /**
   * Reset rate limits for a user
   * @param {object} data - Reset data
   * @returns {object} - Reset confirmation
   */
  async resetRateLimits(data) {
    const { userId, action = null, resetBy } = data;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const resetter = await User.findById(resetBy);
    if (!resetter) {
      throw new Error('Resetter not found');
    }

    // Check permissions
    if (!resetter.hasPermission('admin_functions:manage_rate_limits')) {
      throw new Error('Insufficient permissions to reset rate limits');
    }

    // Reset specific action or all actions
    const query = { userId };
    if (action) {
      query.action = action;
    }

    const result = await RateLimitTracker.deleteMany(query);

    // Log rate limit reset
    await AuditLog.logAction({
      user: resetBy,
      walletAddress: resetter.walletAddress,
      action: 'rate_limit:reset',
      actionCategory: 'admin_action',
      resource: 'User',
      resourceId: userId.toString(),
      success: true,
      metadata: {
        affectedUser: user.walletAddress,
        action: action || 'all',
        resetCount: result.deletedCount
      },
      securityFlags: {
        isCritical: true
      }
    });

    return {
      message: `Rate limits reset successfully`,
      action: action || 'all',
      resetCount: result.deletedCount
    };
  }

  /**
   * Get rate limit status for all actions
   * @param {string} userId - User ID
   * @returns {object} - Comprehensive rate limit status
   */
  async getRateLimitStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const role = await Role.findOne({ name: user.primaryRole });
    if (!role) {
      throw new Error('Role not found');
    }

    // Get all rate limit trackers for user
    const trackers = await RateLimitTracker.find({ userId });

    // Build status object
    const status = {
      userId: user._id,
      walletAddress: user.walletAddress,
      role: user.primaryRole,
      limits: {
        api_calls: await this._getActionStatus(trackers, 'api_call', role, 'minute'),
        blockchain_tx: await this._getActionStatus(trackers, 'blockchain_tx', role, 'hour'),
        product_creation: await this._getActionStatus(trackers, 'product_creation', role, 'day'),
        order_creation: await this._getActionStatus(trackers, 'order_creation', role, 'day'),
        login_attempts: await this._getActionStatus(trackers, 'login_attempt', role, 'minute'),
        kyc_submission: await this._getActionStatus(trackers, 'kyc_submission', role, 'day'),
        password_reset: await this._getActionStatus(trackers, 'password_reset', role, 'hour')
      },
      isAnyBlocked: trackers.some(t => t.isCurrentlyBlocked()),
      violations: trackers
        .filter(t => t.violations && t.violations.length > 0)
        .map(t => ({
          action: t.action,
          violationCount: t.violations.length,
          lastViolation: t.violations[t.violations.length - 1]
        }))
    };

    return status;
  }

  /**
   * Block user for specific action
   * @param {object} data - Block data
   * @returns {object} - Block confirmation
   */
  async blockUser(data) {
    const { userId, action, reason, duration, blockedBy } = data;

    if (!reason) {
      throw new Error('Block reason is required');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const blocker = await User.findById(blockedBy);
    if (!blocker) {
      throw new Error('Blocker not found');
    }

    // Check permissions
    if (!blocker.hasPermission('admin_functions:block_users')) {
      throw new Error('Insufficient permissions to block users');
    }

    // Get or create rate limit tracker
    const role = await Role.findOne({ name: user.primaryRole });
    const limit = this._getActionLimit(role, action, 'minute');

    const tracker = await RateLimitTracker.findOne({
      userId,
      action,
      windowType: 'minute'
    });

    if (tracker) {
      await tracker.block(reason, duration);
    } else {
      // Create new tracker with block
      const windowStart = RateLimitTracker.getWindowStart('minute');
      const windowEnd = RateLimitTracker.getWindowEnd('minute', windowStart);

      const newTracker = new RateLimitTracker({
        userId,
        walletAddress: user.walletAddress,
        action,
        windowType: 'minute',
        windowStart,
        windowEnd,
        count: 0,
        limit,
        isBlocked: true,
        blockReason: reason,
        blockedAt: new Date(),
        blockedUntil: duration ? new Date(Date.now() + duration) : null
      });

      await newTracker.save();
    }

    // Log block action
    await AuditLog.logAction({
      user: blockedBy,
      walletAddress: blocker.walletAddress,
      action: 'rate_limit:user_blocked',
      actionCategory: 'admin_action',
      resource: 'User',
      resourceId: userId.toString(),
      success: true,
      metadata: {
        affectedUser: user.walletAddress,
        action,
        reason,
        duration,
        blockedUntil: duration ? new Date(Date.now() + duration) : 'indefinite'
      },
      securityFlags: {
        isCritical: true
      }
    });

    return {
      message: `User blocked for action: ${action}`,
      action,
      reason,
      blockedUntil: duration ? new Date(Date.now() + duration) : 'indefinite'
    };
  }

  /**
   * Unblock user for specific action
   * @param {object} data - Unblock data
   * @returns {object} - Unblock confirmation
   */
  async unblockUser(data) {
    const { userId, action, unblockedBy } = data;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const unblocker = await User.findById(unblockedBy);
    if (!unblocker) {
      throw new Error('Unblocker not found');
    }

    // Check permissions
    if (!unblocker.hasPermission('admin_functions:block_users')) {
      throw new Error('Insufficient permissions to unblock users');
    }

    // Find and unblock tracker
    const tracker = await RateLimitTracker.findOne({
      userId,
      action
    });

    if (!tracker) {
      throw new Error('Rate limit tracker not found');
    }

    if (!tracker.isCurrentlyBlocked()) {
      throw new Error('User is not currently blocked for this action');
    }

    await tracker.unblock();

    // Log unblock action
    await AuditLog.logAction({
      user: unblockedBy,
      walletAddress: unblocker.walletAddress,
      action: 'rate_limit:user_unblocked',
      actionCategory: 'admin_action',
      resource: 'User',
      resourceId: userId.toString(),
      success: true,
      metadata: {
        affectedUser: user.walletAddress,
        action
      },
      securityFlags: {
        isCritical: true
      }
    });

    return {
      message: `User unblocked for action: ${action}`,
      action
    };
  }

  /**
   * Get violation history for user
   * @param {string} userId - User ID
   * @param {object} options - Query options
   * @returns {object} - Violation history
   */
  async getViolationHistory(userId, options = {}) {
    const { action = null, page = 1, limit = 20 } = options;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const query = { userId };
    if (action) {
      query.action = action;
    }

    // Find trackers with violations
    const trackers = await RateLimitTracker.find({
      ...query,
      'violations.0': { $exists: true }
    })
      .sort({ 'violations.timestamp': -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await RateLimitTracker.countDocuments({
      ...query,
      'violations.0': { $exists: true }
    });

    // Flatten violations
    const violations = [];
    for (const tracker of trackers) {
      for (const violation of tracker.violations || []) {
        violations.push({
          action: tracker.action,
          windowType: tracker.windowType,
          limit: tracker.limit,
          count: tracker.count,
          timestamp: violation.timestamp,
          ipAddress: violation.ipAddress
        });
      }
    }

    // Sort by timestamp descending
    violations.sort((a, b) => b.timestamp - a.timestamp);

    return {
      userId: user._id,
      walletAddress: user.walletAddress,
      violations: violations.slice(0, limit),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get action limit from role
   * @private
   */
  _getActionLimit(role, action, windowType) {
    const actionToRateLimitKey = {
      api_call: 'apiCallsPerMinute',
      blockchain_tx: 'blockchainTxPerHour',
      product_creation: 'productCreationPerDay',
      order_creation: 'orderCreationPerDay'
    };

    const key = actionToRateLimitKey[action];
    if (key && role.rateLimits[key]) {
      return role.rateLimits[key];
    }

    // Default limits for actions not in role config
    const defaultLimits = {
      api_call: { minute: 60 },
      blockchain_tx: { hour: 10 },
      product_creation: { day: 50 },
      order_creation: { day: 20 },
      login_attempt: { minute: 5 },
      kyc_submission: { day: 3 },
      password_reset: { hour: 3 }
    };

    return defaultLimits[action]?.[windowType] || 100;
  }

  /**
   * Get status for a specific action
   * @private
   */
  async _getActionStatus(trackers, action, role, windowType) {
    const tracker = trackers.find(t => t.action === action && t.windowType === windowType);
    const limit = this._getActionLimit(role, action, windowType);

    if (!tracker) {
      return {
        limit,
        current: 0,
        remaining: limit,
        resetAt: RateLimitTracker.getWindowEnd(windowType, new Date()),
        isBlocked: false
      };
    }

    return {
      limit,
      current: tracker.count,
      remaining: Math.max(0, limit - tracker.count),
      resetAt: tracker.windowEnd,
      isBlocked: tracker.isCurrentlyBlocked()
    };
  }
}

module.exports = new RateLimitService();
