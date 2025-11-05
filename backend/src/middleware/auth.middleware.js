const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/UserRBAC.model');
const AuditLog = require('../models/AuditLog.model');
const Role = require('../models/Role.model');

/**
 * Authenticate user via JWT token
 * Verifies token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization required.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please refresh your token.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Authentication failed.',
        code: 'INVALID_TOKEN'
      });
    }

    // Fetch user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (!user.status.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Check if user is suspended
    if (user.status.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Account is suspended: ${user.status.suspensionReason}`,
        code: 'ACCOUNT_SUSPENDED',
        suspensionReason: user.status.suspensionReason
      });
    }

    // Check if account is locked due to failed attempts
    if (user.security.accountLockedUntil && user.security.accountLockedUntil > new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Account is temporarily locked due to failed login attempts.',
        code: 'ACCOUNT_LOCKED',
        unlocksAt: user.security.accountLockedUntil
      });
    }

        // Attach user to request
    req.user = user;
    req.token = token; // Attach token for logout blacklisting
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Verify wallet signature for authentication
 * Used during login to prove wallet ownership
 */
const verifyWalletSignature = async (req, res, next) => {
  try {
    const { walletAddress, message, signature, nonce } = req.body;

    // Validate required fields
    if (!walletAddress || !message || !signature || !nonce) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: walletAddress, message, signature, nonce'
      });
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }

    // Verify message format and nonce
    const expectedMessage = `Sign this message to login to AgriChain.\nNonce: ${nonce}\nTimestamp: `;
    
    if (!message.startsWith(expectedMessage)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message format'
      });
    }

    // Extract timestamp from message
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (!timestampMatch) {
      return res.status(400).json({
        success: false,
        message: 'Message missing timestamp'
      });
    }

    const messageTimestamp = parseInt(timestampMatch[1]);
    const now = Date.now();

    // Check if message is not expired (5 minutes window)
    if (now - messageTimestamp > 5 * 60 * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Signature expired. Please try again.',
        code: 'SIGNATURE_EXPIRED'
      });
    }

    // Prevent replay attacks - check if nonce was used before
    // (In production, store used nonces in Redis with TTL)
    // For now, we'll just verify the signature

    // Verify signature
    let recoveredAddress;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature',
        code: 'INVALID_SIGNATURE'
      });
    }

    // Check if recovered address matches provided wallet address
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: 'Signature verification failed. Wallet address mismatch.',
        code: 'ADDRESS_MISMATCH'
      });
    }

    // Attach verified wallet to request
    req.verifiedWallet = walletAddress.toLowerCase();
    req.signatureTimestamp = messageTimestamp;

    next();
  } catch (error) {
    console.error('Wallet signature verification error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Signature verification failed due to server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Require user to have at least one of the specified roles
 * Usage: requireRole('ADMIN', 'SUPER_ADMIN')
 */
const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Check if user has any of the required roles
      const hasRequiredRole = req.user.hasAnyRole(roles);

      if (!hasRequiredRole) {
        // Log unauthorized access attempt
        await AuditLog.logAction({
          user: req.user._id,
          walletAddress: req.user.walletAddress,
          action: 'authorization:role_check_failed',
          actionCategory: 'authorization',
          method: req.method,
          endpoint: req.originalUrl,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          success: false,
          errorMessage: `User does not have required role. Required: ${roles.join(', ')}, User has: ${req.user.roles.join(', ')}`,
          metadata: {
            roleAtTime: req.user.primaryRole,
            requiredRoles: roles,
            userRoles: req.user.roles
          },
          securityFlags: {
            isSuspicious: true,
            suspicionReason: 'Unauthorized role access attempt'
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions. Required role not found.',
          code: 'INSUFFICIENT_ROLE',
          required: roles,
          current: req.user.primaryRole
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Authorization check failed due to server error.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Require user to have ALL specified roles
 */
const requireAllRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const hasAllRoles = req.user.hasAllRoles(roles);

      if (!hasAllRoles) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions. All required roles not found.',
          code: 'INSUFFICIENT_ROLES',
          required: roles,
          current: req.user.roles
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ success: false, message: 'Authorization check failed' });
    }
  };
};

/**
 * Require user to have specific permission(s)
 * Usage: requirePermission('product:create', 'product:edit')
 */
const requirePermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user's role and its permissions
      const role = await Role.findOne({ name: req.user.primaryRole });
      
      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'User role not found',
          code: 'ROLE_NOT_FOUND'
        });
      }

      // Check if user has any of the required permissions
      let hasPermission = false;

      for (const permission of permissions) {
        // Check role permissions
        if (role.hasPermission(permission)) {
          hasPermission = true;
          break;
        }

        // Check user's custom permissions
        if (req.user.hasPermission(permission)) {
          hasPermission = true;
          break;
        }
      }

      if (!hasPermission) {
        // Log unauthorized access attempt
        await AuditLog.logAction({
          user: req.user._id,
          walletAddress: req.user.walletAddress,
          action: 'authorization:permission_denied',
          actionCategory: 'authorization',
          method: req.method,
          endpoint: req.originalUrl,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          success: false,
          errorMessage: `Permission denied. Required: ${permissions.join(' or ')}`,
          metadata: {
            roleAtTime: req.user.primaryRole,
            requiredPermissions: permissions
          },
          securityFlags: {
            isSuspicious: true,
            suspicionReason: 'Unauthorized permission access attempt'
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions. Required permission not found.',
          code: 'INSUFFICIENT_PERMISSION',
          required: permissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Permission check failed due to server error.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Check if user owns the resource they're trying to access
 * Usage: checkOwnership('Product', 'productId')
 */
const checkOwnership = (resourceType, resourceIdParam = 'id', allowAdmin = true) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin and Super Admin can access any resource
      if (allowAdmin && req.user.hasAnyRole(['ADMIN', 'SUPER_ADMIN'])) {
        return next();
      }

      // Get resource ID from params
      const resourceId = req.params[resourceIdParam];

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID not provided'
        });
      }

      // Import model dynamically
      const Model = require(`../models/${resourceType}.model`);

      // Fetch resource
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceType} not found`
        });
      }

      // Check ownership (different resources have different owner fields)
      const ownerFields = {
        Product: 'farmer',
        Order: 'buyer', // or 'seller' depending on context
        User: '_id'
      };

      const ownerField = ownerFields[resourceType] || 'owner';
      const ownerId = resource[ownerField];

      // Handle different owner ID formats
      const isOwner = ownerId && (
        ownerId.toString() === req.user._id.toString() ||
        ownerId.toString() === req.user.walletAddress.toLowerCase()
      );

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to access this ${resourceType.toLowerCase()}`,
          code: 'NOT_OWNER'
        });
      }

      // Attach resource to request for use in route handler
      req.resource = resource;

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Ownership check failed due to server error.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Check if user has completed KYC verification
 */
const checkVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user's role requires verification
    const role = await Role.findOne({ name: req.user.primaryRole });

    if (!role || !role.requirements.requiresVerification) {
      return next(); // Verification not required for this role
    }

    // Check verification status
    if (!req.user.verification.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account verification required. Please complete verification process.',
        code: 'VERIFICATION_REQUIRED',
        verificationStatus: req.user.verification.kycStatus
      });
    }

    // Check KYC status if required
    if (role.requirements.requiresKYC && req.user.verification.kycStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required. Please complete KYC process.',
        code: 'KYC_REQUIRED',
        kycStatus: req.user.verification.kycStatus
      });
    }

    next();
  } catch (error) {
    console.error('Verification check error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Verification check failed due to server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Optional authentication - attach user if token present
 * Don't fail if token is missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user && user.status.isActive && !user.status.isSuspended) {
        req.user = user;
        req.userId = user._id;
        req.walletAddress = user.walletAddress;
      }
    } catch (error) {
      // Token invalid or expired - continue without auth
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue without auth on error
  }
};

module.exports = {
  authenticate,
  verifyWalletSignature,
  requireRole,
  requireAllRoles,
  requirePermission,
  checkOwnership,
  checkVerification,
  optionalAuth
};
