const Role = require('../models/Role.model');
const User = require('../models/User.model');

/**
 * Validate role assignment is allowed
 * Checks permissions, hierarchy, and business rules
 */
const validateRoleAssignment = async (req, res, next) => {
  try {
    const { userId, role, reason } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Fetch target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Fetch role details
    const roleData = await Role.findOne({ name: role });
    if (!roleData) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
        code: 'ROLE_NOT_FOUND'
      });
    }

    // Check if requester has permission to grant this role
    const requesterRole = await Role.findOne({ name: req.user.primaryRole });
    
    if (!requesterRole) {
      return res.status(403).json({
        success: false,
        message: 'Your role not found',
        code: 'REQUESTER_ROLE_NOT_FOUND'
      });
    }

    // Role hierarchy check - can't grant higher or equal level role (unless SUPER_ADMIN)
    if (!req.user.hasRole('SUPER_ADMIN')) {
      if (roleData.level >= requesterRole.level) {
        return res.status(403).json({
          success: false,
          message: 'You cannot grant a role of equal or higher level than your own',
          code: 'HIERARCHY_VIOLATION',
          yourLevel: requesterRole.level,
          targetLevel: roleData.level
        });
      }
    }

    // Check for conflicting roles
    const conflictingRoles = checkRoleConflicts(targetUser.roles, role);
    if (conflictingRoles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Role conflicts with existing roles',
        code: 'ROLE_CONFLICT',
        conflicts: conflictingRoles
      });
    }

    // Check business requirements for the role
    if (roleData.requirements.requiresKYC && targetUser.verification.kycStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'User must complete KYC verification before receiving this role',
        code: 'KYC_REQUIRED',
        currentStatus: targetUser.verification.kycStatus
      });
    }

    if (roleData.requirements.requiresVerification && !targetUser.verification.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User must be verified before receiving this role',
        code: 'VERIFICATION_REQUIRED'
      });
    }

    // Reason required for critical roles
    const criticalRoles = ['SUPER_ADMIN', 'ADMIN'];
    if (criticalRoles.includes(role) && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required when granting critical roles',
        code: 'REASON_REQUIRED'
      });
    }

    // Attach validated data to request
    req.validatedRole = {
      targetUser,
      roleData,
      requesterRole
    };

    next();
  } catch (error) {
    console.error('Role assignment validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Role validation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate role revocation is allowed
 */
const validateRoleRevocation = async (req, res, next) => {
  try {
    const { userId, role, reason } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required'
      });
    }

    // Fetch target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    // Check if user has the role
    if (!targetUser.hasRole(role)) {
      return res.status(400).json({
        success: false,
        message: 'User does not have this role',
        code: 'ROLE_NOT_FOUND'
      });
    }

    // Fetch role details
    const roleData = await Role.findOne({ name: role });

    // Check if requester has permission
    const requesterRole = await Role.findOne({ name: req.user.primaryRole });

    if (!req.user.hasRole('SUPER_ADMIN')) {
      if (roleData.level >= requesterRole.level) {
        return res.status(403).json({
          success: false,
          message: 'You cannot revoke a role of equal or higher level than your own',
          code: 'HIERARCHY_VIOLATION'
        });
      }
    }

    // Can't revoke SUPER_ADMIN unless requester is also SUPER_ADMIN
    if (role === 'SUPER_ADMIN' && !req.user.hasRole('SUPER_ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can revoke super admin role',
        code: 'INSUFFICIENT_PERMISSION'
      });
    }

    // Can't revoke your own SUPER_ADMIN role
    if (role === 'SUPER_ADMIN' && userId === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot revoke your own super admin role',
        code: 'SELF_REVOCATION_DENIED'
      });
    }

    // Reason required for critical roles
    const criticalRoles = ['SUPER_ADMIN', 'ADMIN'];
    if (criticalRoles.includes(role) && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required when revoking critical roles',
        code: 'REASON_REQUIRED'
      });
    }

    req.validatedRole = {
      targetUser,
      roleData,
      requesterRole
    };

    next();
  } catch (error) {
    console.error('Role revocation validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Role revocation validation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Check for role conflicts
 */
function checkRoleConflicts(existingRoles, newRole) {
  const conflicts = [];

  // SUPER_ADMIN cannot have other roles
  if (newRole === 'SUPER_ADMIN' && existingRoles.length > 0) {
    conflicts.push('SUPER_ADMIN cannot have other roles');
  }

  if (existingRoles.includes('SUPER_ADMIN') && newRole !== 'SUPER_ADMIN') {
    conflicts.push('SUPER_ADMIN cannot have other roles');
  }

  // FARMER and DISTRIBUTOR are mutually exclusive
  if (newRole === 'FARMER' && existingRoles.includes('DISTRIBUTOR')) {
    conflicts.push('Cannot be both FARMER and DISTRIBUTOR');
  }

  if (newRole === 'DISTRIBUTOR' && existingRoles.includes('FARMER')) {
    conflicts.push('Cannot be both FARMER and DISTRIBUTOR');
  }

  return conflicts;
}

/**
 * Validate permission usage is within scope
 */
const validatePermissionUsage = async (req, res, next) => {
  try {
    const { permission } = req.body;

    if (!permission) {
      return res.status(400).json({
        success: false,
        message: 'Permission is required'
      });
    }

    // Validate permission format
    if (!permission.match(/^[a-z_]+:[a-z_]+$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid permission format. Must be category:action',
        code: 'INVALID_FORMAT'
      });
    }

    // Check if permission exists
    const Permission = require('../models/Permission.model');
    const permissionExists = await Permission.exists(permission);

    if (!permissionExists) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found in system',
        code: 'PERMISSION_NOT_FOUND'
      });
    }

    next();
  } catch (error) {
    console.error('Permission validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Permission validation failed'
    });
  }
};

/**
 * Validate user input
 */
const validateUserInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors
      });
    }

    // Replace request body with validated value
    req.body = value;
    next();
  };
};

/**
 * Validate wallet address format
 */
const validateWalletAddress = (req, res, next) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({
      success: false,
      message: 'Wallet address is required'
    });
  }

  // Ethereum address validation
  const ethers = require('ethers');
  if (!ethers.isAddress(walletAddress)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid wallet address format',
      code: 'INVALID_WALLET_ADDRESS'
    });
  }

  // Normalize to lowercase
  req.body.walletAddress = walletAddress.toLowerCase();
  next();
};

/**
 * Validate KYC documents
 */
const validateKYCDocuments = async (req, res, next) => {
  try {
    const { documents } = req.body;

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        message: 'Documents array is required'
      });
    }

    if (documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one document is required'
      });
    }

    // Validate each document
    const validTypes = ['id_proof', 'address_proof', 'business_license', 'farm_certificate', 'tax_certificate'];
    
    for (const doc of documents) {
      if (!doc.type || !validTypes.includes(doc.type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid document type. Must be one of: ${validTypes.join(', ')}`
        });
      }

      if (!doc.ipfsHash) {
        return res.status(400).json({
          success: false,
          message: 'Document IPFS hash is required'
        });
      }

      // Validate IPFS hash format (starts with Qm or ba)
      if (!doc.ipfsHash.match(/^(Qm|ba)[a-zA-Z0-9]{44,}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid IPFS hash format'
        });
      }
    }

    next();
  } catch (error) {
    console.error('KYC validation error:', error);
    res.status(500).json({
      success: false,
      message: 'KYC validation failed'
    });
  }
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid page number'
    });
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Invalid limit. Must be between 1 and 100'
    });
  }

  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum
  };

  next();
};

/**
 * Validate date range
 */
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date format'
      });
    }
    req.query.startDate = start;
  }

  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end date format'
      });
    }
    req.query.endDate = end;
  }

  if (startDate && endDate && req.query.startDate > req.query.endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date must be before end date'
    });
  }

  next();
};

module.exports = {
  validateRoleAssignment,
  validateRoleRevocation,
  validatePermissionUsage,
  validateUserInput,
  validateWalletAddress,
  validateKYCDocuments,
  validatePagination,
  validateDateRange
};
