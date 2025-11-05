const { asyncHandler, AppError } = require('../middleware/errorHandler');
const rbacService = require('../services/rbac.service');
const verificationService = require('../services/verification.service');
const rateLimitService = require('../services/rateLimit.service');
const User = require('../models/UserRBAC.model');
const AuditLog = require('../models/AuditLog.model');

/**
 * RBAC Admin Controller
 * Handles role management, user administration, and RBAC-specific operations
 */

/**
 * Grant role to user
 * POST /api/admin/rbac/users/:userId/grant-role
 */
exports.grantRole = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { role, reason, syncBlockchain } = req.body;
  const grantedBy = req.user._id;

  if (!role) {
    return next(new AppError('Role is required', 400, 'MISSING_ROLE'));
  }

  const result = await rbacService.grantRole({
    userId,
    role,
    grantedBy,
    reason,
    syncBlockchain: syncBlockchain || false
  });

  res.json({
    success: true,
    data: result,
    message: `Role ${role} granted successfully`
  });
});

/**
 * Revoke role from user
 * POST /api/admin/rbac/users/:userId/revoke-role
 */
exports.revokeRole = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { role, reason, syncBlockchain } = req.body;
  const revokedBy = req.user._id;

  if (!role) {
    return next(new AppError('Role is required', 400, 'MISSING_ROLE'));
  }

  const result = await rbacService.revokeRole({
    userId,
    role,
    revokedBy,
    reason,
    syncBlockchain: syncBlockchain || false
  });

  res.json({
    success: true,
    data: result,
    message: `Role ${role} revoked successfully`
  });
});

/**
 * Suspend user account
 * POST /api/admin/rbac/users/:userId/suspend
 */
exports.suspendUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { reason, duration } = req.body;
  const suspendedBy = req.user._id;

  if (!reason) {
    return next(new AppError('Suspension reason is required', 400, 'MISSING_REASON'));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  await user.suspend(reason, suspendedBy, duration);

  res.json({
    success: true,
    data: {
      user: user.toPublicJSON()
    },
    message: 'User suspended successfully'
  });
});

/**
 * Reactivate suspended user
 * POST /api/admin/rbac/users/:userId/reactivate
 */
exports.reactivateUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  await user.reactivate();

  res.json({
    success: true,
    data: {
      user: user.toPublicJSON()
    },
    message: 'User reactivated successfully'
  });
});

/**
 * Get user RBAC details
 * GET /api/admin/rbac/users/:userId
 */
exports.getUserRBAC = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('-security.passwordHash -security.trustedDevices');

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Get user permissions
  const permissions = await rbacService.getUserPermissions(userId);

  // Get rate limit status
  const rateLimits = await rateLimitService.getRateLimitStatus(userId);

  res.json({
    success: true,
    data: {
      user: user.toPublicJSON(),
      permissions: permissions.permissions,
      rateLimits: rateLimits.limits,
      violations: rateLimits.violations
    }
  });
});

/**
 * Get audit logs
 * GET /api/admin/rbac/audit-logs
 */
exports.getAuditLogs = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 50,
    userId,
    action,
    actionCategory,
    startDate,
    endDate,
    isCritical,
    isSuspicious
  } = req.query;

  const query = {};

  if (userId) query.user = userId;
  if (action) query.action = action;
  if (actionCategory) query.actionCategory = actionCategory;
  if (isCritical !== undefined) query['securityFlags.isCritical'] = isCritical === 'true';
  if (isSuspicious !== undefined) query['securityFlags.isSuspicious'] = isSuspicious === 'true';

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  const logs = await AuditLog.find(query)
    .populate('user', 'walletAddress profile.name')
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await AuditLog.countDocuments(query);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * Get suspicious activities
 * GET /api/admin/rbac/suspicious-activities
 */
exports.getSuspiciousActivities = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 50 } = req.query;

  const activities = await AuditLog.getSuspiciousActivities({
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: activities
  });
});

/**
 * Approve KYC
 * POST /api/admin/rbac/kyc/:userId/approve
 */
exports.approveKYC = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { comments, verificationLevel } = req.body;
  const approvedBy = req.user._id;

  const result = await verificationService.approveKYC({
    userId,
    approvedBy,
    comments,
    verificationLevel: verificationLevel || 2
  });

  res.json({
    success: true,
    data: result,
    message: 'KYC approved successfully'
  });
});

/**
 * Reject KYC
 * POST /api/admin/rbac/kyc/:userId/reject
 */
exports.rejectKYC = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { reason, documentIssues } = req.body;
  const rejectedBy = req.user._id;

  if (!reason) {
    return next(new AppError('Rejection reason is required', 400, 'MISSING_REASON'));
  }

  const result = await verificationService.rejectKYC({
    userId,
    rejectedBy,
    reason,
    documentIssues
  });

  res.json({
    success: true,
    data: result,
    message: 'KYC rejected'
  });
});

/**
 * Get pending KYC submissions
 * GET /api/admin/rbac/kyc/pending
 */
exports.getPendingKYC = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, role } = req.query;

  const result = await verificationService.getPendingKYCSubmissions({
    page: parseInt(page),
    limit: parseInt(limit),
    role
  });

  res.json({
    success: true,
    data: result
  });
});

/**
 * Reset user rate limits
 * POST /api/admin/rbac/users/:userId/reset-rate-limits
 */
exports.resetRateLimits = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { action } = req.body;
  const resetBy = req.user._id;

  const result = await rateLimitService.resetRateLimits({
    userId,
    action,
    resetBy
  });

  res.json({
    success: true,
    data: result,
    message: 'Rate limits reset successfully'
  });
});

/**
 * Block user for specific action
 * POST /api/admin/rbac/users/:userId/block
 */
exports.blockUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { action, reason, duration } = req.body;
  const blockedBy = req.user._id;

  if (!action || !reason) {
    return next(new AppError('Action and reason are required', 400, 'MISSING_FIELDS'));
  }

  const result = await rateLimitService.blockUser({
    userId,
    action,
    reason,
    duration,
    blockedBy
  });

  res.json({
    success: true,
    data: result,
    message: 'User blocked successfully'
  });
});

/**
 * Unblock user
 * POST /api/admin/rbac/users/:userId/unblock
 */
exports.unblockUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { action } = req.body;
  const unblockedBy = req.user._id;

  if (!action) {
    return next(new AppError('Action is required', 400, 'MISSING_ACTION'));
  }

  const result = await rateLimitService.unblockUser({
    userId,
    action,
    unblockedBy
  });

  res.json({
    success: true,
    data: result,
    message: 'User unblocked successfully'
  });
});

/**
 * Get role hierarchy
 * GET /api/admin/rbac/roles/hierarchy
 */
exports.getRoleHierarchy = asyncHandler(async (req, res, next) => {
  const hierarchy = await rbacService.getRoleHierarchy();

  res.json({
    success: true,
    data: {
      hierarchy
    }
  });
});

/**
 * Update verification level
 * POST /api/admin/rbac/users/:userId/verification-level
 */
exports.updateVerificationLevel = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { level, reason } = req.body;
  const updatedBy = req.user._id;

  if (level === undefined) {
    return next(new AppError('Verification level is required', 400, 'MISSING_LEVEL'));
  }

  const result = await verificationService.updateVerificationLevel({
    userId,
    level,
    updatedBy,
    reason
  });

  res.json({
    success: true,
    data: result,
    message: 'Verification level updated successfully'
  });
});
