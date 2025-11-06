const express = require('express');
const router = express.Router();

// Import middleware
const {
  authenticate,
  requireRole,
  requirePermission,
  optionalAuth
} = require('../middleware/auth.middleware');

const {
  auditLog,
  auditCriticalAction
} = require('../middleware/audit.middleware');

const {
  validateRoleAssignment,
  validateRoleRevocation,
  validatePagination
} = require('../middleware/validation.middleware');

const {
  rateLimitByRole,
  customActionLimit
} = require('../middleware/rateLimit.middleware');

// Import controllers
const authController = require('../controllers/auth.controller');
const rbacAdminController = require('../controllers/rbacAdmin.controller');
const verificationController = require('../controllers/verification.controller');

/**
 * ========================================
 * PUBLIC AUTHENTICATION ROUTES
 * ========================================
 */

// Generate nonce for wallet signature
router.post('/auth/nonce',
  rateLimitByRole('login_attempt', 'minute'),
  auditLog,
  authController.getNonce
);

// Register new user
router.post('/auth/register',
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  authController.register
);

// Login with wallet signature
router.post('/auth/login',
  customActionLimit('login_attempt', 5, 15), // 5 attempts per 15 minutes
  auditLog,
  authController.login
);

// Refresh access token
router.post('/auth/refresh',
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  authController.refreshToken
);

// Legacy verify endpoint (backward compatibility)
router.post('/auth/verify',
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  authController.verifyWallet
);

/**
 * ========================================
 * AUTHENTICATED USER ROUTES
 * ========================================
 */

// Get current user
router.get('/auth/me',
  authenticate,
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  authController.getMe
);

// Logout
router.post('/auth/logout',
  authenticate,
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  authController.logout
);

// Change password - TODO: Implement changePassword in auth.controller
// router.post('/auth/change-password',
//   authenticate,
//   customActionLimit('password_reset', 3, 60), // 3 attempts per hour
//   auditCriticalAction,
//   authController.changePassword
// );

/**
 * ========================================
 * VERIFICATION ROUTES
 * ========================================
 */

// Initiate KYC
router.post('/verification/kyc',
  authenticate,
  rateLimitByRole('kyc_submission', 'day'),
  auditLog,
  verificationController.initiateKYC
);

// Resubmit KYC
router.post('/verification/kyc/resubmit',
  authenticate,
  rateLimitByRole('kyc_submission', 'day'),
  auditLog,
  verificationController.resubmitKYC
);

// Get verification status
router.get('/verification/status',
  authenticate,
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  verificationController.getVerificationStatus
);

// Verify business license
router.post('/verification/business-license',
  authenticate,
  requireRole('DISTRIBUTOR', 'RETAILER'),
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  verificationController.verifyBusinessLicense
);

/**
 * ========================================
 * ADMIN RBAC ROUTES
 * ========================================
 */

// Get role hierarchy
router.get('/admin/rbac/roles/hierarchy',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('user_management:view_roles'),
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  rbacAdminController.getRoleHierarchy
);

// Get user RBAC details
router.get('/admin/rbac/users/:userId',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('user_management:view_users'),
  validatePagination,
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  rbacAdminController.getUserRBAC
);

// Grant role to user
router.post('/admin/rbac/users/:userId/grant-role',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('user_management:assign_roles'),
  validateRoleAssignment,
  rateLimitByRole('api_call', 'minute'),
  auditCriticalAction,
  rbacAdminController.grantRole
);

// Revoke role from user
router.post('/admin/rbac/users/:userId/revoke-role',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('user_management:assign_roles'),
  validateRoleRevocation,
  rateLimitByRole('api_call', 'minute'),
  auditCriticalAction,
  rbacAdminController.revokeRole
);

// Suspend user
router.post('/admin/rbac/users/:userId/suspend',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('user_management:suspend_users'),
  rateLimitByRole('api_call', 'minute'),
  auditCriticalAction,
  rbacAdminController.suspendUser
);

// Reactivate user
router.post('/admin/rbac/users/:userId/reactivate',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('user_management:suspend_users'),
  rateLimitByRole('api_call', 'minute'),
  auditCriticalAction,
  rbacAdminController.reactivateUser
);

// Update verification level
router.post('/admin/rbac/users/:userId/verification-level',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('user_management:update_verification_level'),
  rateLimitByRole('api_call', 'minute'),
  auditCriticalAction,
  rbacAdminController.updateVerificationLevel
);

/**
 * ========================================
 * KYC ADMIN ROUTES
 * ========================================
 */

// Get pending KYC submissions
router.get('/admin/rbac/kyc/pending',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('user_management:approve_kyc'),
  validatePagination,
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  rbacAdminController.getPendingKYC
);

// Approve KYC
router.post('/admin/rbac/kyc/:userId/approve',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('user_management:approve_kyc'),
  rateLimitByRole('api_call', 'minute'),
  auditCriticalAction,
  rbacAdminController.approveKYC
);

// Reject KYC
router.post('/admin/rbac/kyc/:userId/reject',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('user_management:approve_kyc'),
  rateLimitByRole('api_call', 'minute'),
  auditCriticalAction,
  rbacAdminController.rejectKYC
);

/**
 * ========================================
 * RATE LIMIT ADMIN ROUTES
 * ========================================
 */

// Reset user rate limits
router.post('/admin/rbac/users/:userId/reset-rate-limits',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('admin_functions:manage_rate_limits'),
  rateLimitByRole('api_call', 'minute'),
  auditCriticalAction,
  rbacAdminController.resetRateLimits
);

// Block user for specific action
router.post('/admin/rbac/users/:userId/block',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('admin_functions:block_users'),
  rateLimitByRole('api_call', 'minute'),
  auditCriticalAction,
  rbacAdminController.blockUser
);

// Unblock user
router.post('/admin/rbac/users/:userId/unblock',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('admin_functions:block_users'),
  rateLimitByRole('api_call', 'minute'),
  auditCriticalAction,
  rbacAdminController.unblockUser
);

/**
 * ========================================
 * AUDIT LOG ROUTES
 * ========================================
 */

// Get audit logs
router.get('/admin/rbac/audit-logs',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('admin_functions:view_audit_logs'),
  validatePagination,
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  rbacAdminController.getAuditLogs
);

// Get suspicious activities
router.get('/admin/rbac/suspicious-activities',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requirePermission('admin_functions:view_audit_logs'),
  validatePagination,
  rateLimitByRole('api_call', 'minute'),
  auditLog,
  rbacAdminController.getSuspiciousActivities
);

module.exports = router;
