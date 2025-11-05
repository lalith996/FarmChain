const { ethers } = require('ethers');
const User = require('../models/UserRBAC.model');
const Role = require('../models/Role.model');
const Permission = require('../models/Permission.model');
const AuditLog = require('../models/AuditLog.model');

/**
 * Role-Based Access Control Service
 * Handles role granting, revocation, permission checks, and blockchain synchronization
 */
class RBACService {
  /**
   * Grant a role to a user
   * @param {object} data - Role grant data
   * @returns {object} - Updated user
   */
  async grantRole(data) {
    const { userId, role, grantedBy, reason, syncBlockchain = false } = data;

    // Fetch user and granter
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const granter = await User.findById(grantedBy);
    if (!granter) {
      throw new Error('Granter not found');
    }

    // Get role details
    const roleData = await Role.findOne({ name: role });
    if (!roleData) {
      throw new Error(`Role ${role} not found in system`);
    }

    // Check if user already has the role
    if (user.hasRole(role)) {
      throw new Error(`User already has role ${role}`);
    }

    // Check if granter has permission to grant this role
    const granterRole = await Role.findOne({ name: granter.primaryRole });
    if (!granterRole) {
      throw new Error('Granter role not found');
    }

    // Enforce hierarchy - can only grant roles of lower level (unless SUPER_ADMIN)
    if (granter.primaryRole !== 'SUPER_ADMIN' && roleData.level >= granterRole.level) {
      throw new Error(
        `Insufficient permissions. Your role level (${granterRole.level}) cannot grant role level ${roleData.level}`
      );
    }

    // Check for role conflicts
    const conflicts = this._checkRoleConflicts(user.roles, role);
    if (conflicts.length > 0) {
      throw new Error(`Role conflicts detected: ${conflicts.join(', ')}`);
    }

    // Check KYC requirements
    if (roleData.requirements.requiresKYC && user.verification.kycStatus !== 'approved') {
      throw new Error(`Role ${role} requires KYC approval. Current status: ${user.verification.kycStatus}`);
    }

    // Check verification requirements
    if (roleData.requirements.requiresVerification && !user.verification.isVerified) {
      throw new Error(`Role ${role} requires account verification`);
    }

    // Check business license for distributor/retailer
    if (
      (role === 'DISTRIBUTOR' || role === 'RETAILER') &&
      !user.verification.businessLicense?.isVerified
    ) {
      throw new Error(`Role ${role} requires verified business license`);
    }

    // Grant role
    await user.grantRole(role, grantedBy, reason);

    // Sync with blockchain if requested
    if (syncBlockchain) {
      try {
        await this.syncBlockchainRole({
          userId: user._id,
          role,
          action: 'grant'
        });
      } catch (error) {
        console.error('Blockchain sync failed:', error);
        // Don't fail the entire operation if blockchain sync fails
        // TODO: Queue for retry
      }
    }

    // Log role grant
    await AuditLog.logAction({
      user: grantedBy,
      walletAddress: granter.walletAddress,
      action: 'rbac:grant_role',
      actionCategory: 'role_management',
      resource: 'User',
      resourceId: userId.toString(),
      success: true,
      metadata: {
        roleGranted: role,
        reason,
        roleLevel: roleData.level,
        syncedBlockchain: syncBlockchain,
        affectedUser: user.walletAddress
      },
      securityFlags: {
        isCritical: ['SUPER_ADMIN', 'ADMIN'].includes(role)
      }
    });

    // Send notification to user
    // TODO: Implement notification service
    console.log(`Role ${role} granted to user ${user.walletAddress}`);

    return {
      user: user.toPublicJSON(),
      roleGranted: role,
      message: `Role ${role} granted successfully`
    };
  }

  /**
   * Revoke a role from a user
   * @param {object} data - Role revoke data
   * @returns {object} - Updated user
   */
  async revokeRole(data) {
    const { userId, role, revokedBy, reason, syncBlockchain = false } = data;

    // Fetch user and revoker
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const revoker = await User.findById(revokedBy);
    if (!revoker) {
      throw new Error('Revoker not found');
    }

    // Check if user has the role
    if (!user.hasRole(role)) {
      throw new Error(`User does not have role ${role}`);
    }

    // Prevent self-revocation of SUPER_ADMIN
    if (userId.toString() === revokedBy.toString() && role === 'SUPER_ADMIN') {
      throw new Error('Cannot revoke your own SUPER_ADMIN role');
    }

    // Get role details
    const roleData = await Role.findOne({ name: role });
    const revokerRole = await Role.findOne({ name: revoker.primaryRole });

    // Enforce hierarchy
    if (revoker.primaryRole !== 'SUPER_ADMIN' && roleData.level >= revokerRole.level) {
      throw new Error(
        `Insufficient permissions. Your role level (${revokerRole.level}) cannot revoke role level ${roleData.level}`
      );
    }

    // Require reason for critical roles
    if (['SUPER_ADMIN', 'ADMIN'].includes(role) && !reason) {
      throw new Error('Reason is required for revoking critical roles');
    }

    // Revoke role
    await user.revokeRole(role, revokedBy, reason);

    // Sync with blockchain if requested
    if (syncBlockchain) {
      try {
        await this.syncBlockchainRole({
          userId: user._id,
          role,
          action: 'revoke'
        });
      } catch (error) {
        console.error('Blockchain sync failed:', error);
      }
    }

    // Log role revocation
    await AuditLog.logAction({
      user: revokedBy,
      walletAddress: revoker.walletAddress,
      action: 'rbac:revoke_role',
      actionCategory: 'role_management',
      resource: 'User',
      resourceId: userId.toString(),
      success: true,
      metadata: {
        roleRevoked: role,
        reason,
        roleLevel: roleData.level,
        syncedBlockchain: syncBlockchain,
        affectedUser: user.walletAddress
      },
      securityFlags: {
        isCritical: ['SUPER_ADMIN', 'ADMIN'].includes(role)
      }
    });

    // TODO: Invalidate user's active tokens
    console.log(`Role ${role} revoked from user ${user.walletAddress}`);

    return {
      user: user.toPublicJSON(),
      roleRevoked: role,
      message: `Role ${role} revoked successfully`
    };
  }

  /**
   * Check if user has a specific permission
   * @param {object} data - Permission check data
   * @returns {boolean} - Permission result
   */
  async checkPermission(data) {
    const { userId, permission } = data;

    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    if (!user.status.isActive || user.status.isSuspended) {
      return false;
    }

    return user.hasPermission(permission);
  }

  /**
   * Get all effective permissions for a user
   * @param {string} userId - User ID
   * @returns {array} - Array of permissions
   */
  async getUserPermissions(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all role permissions
    const roles = await Role.find({ name: { $in: user.roles } });
    
    let allPermissions = new Set();

    // Collect permissions from all roles
    for (const role of roles) {
      const effectivePerms = role.getEffectivePermissions();
      effectivePerms.forEach(perm => allPermissions.add(perm));
    }

    // Add custom user permissions
    user.permissions.forEach(perm => allPermissions.add(perm));

    // Remove excluded permissions
    // (Handled by Role.getEffectivePermissions)

    return {
      userId: user._id,
      walletAddress: user.walletAddress,
      roles: user.roles,
      permissions: Array.from(allPermissions).sort()
    };
  }

  /**
   * Sync role with blockchain AccessControl contract
   * @param {object} data - Sync data
   * @returns {object} - Transaction result
   */
  async syncBlockchainRole(data) {
    const { userId, role, action } = data;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if blockchain is configured
    if (!process.env.BLOCKCHAIN_RPC_URL || !process.env.ACCESS_CONTROL_CONTRACT_ADDRESS) {
      throw new Error('Blockchain not configured');
    }

    try {
      // Connect to blockchain
      const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
      const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY, provider);

      // Load contract
      const accessControlABI = require('../../../contracts/artifacts/contracts/AccessControl.sol/AgriChainAccessControl.json').abi;
      const contract = new ethers.Contract(
        process.env.ACCESS_CONTROL_CONTRACT_ADDRESS,
        accessControlABI,
        wallet
      );

      // Map role to contract role constant
      const roleBytes32 = ethers.keccak256(ethers.toUtf8Bytes(`${role}_ROLE`));

      let tx;
      if (action === 'grant') {
        // Grant role on blockchain
        tx = await contract.grantRoleWithVerification(roleBytes32, user.walletAddress);
      } else if (action === 'revoke') {
        // Revoke role on blockchain
        tx = await contract.revokeRoleWithReason(roleBytes32, user.walletAddress, 'Revoked by admin');
      } else {
        throw new Error('Invalid action. Must be grant or revoke');
      }

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Update user blockchain info
      user.blockchain.hasBlockchainRole = action === 'grant';
      user.blockchain.lastSyncedAt = new Date();
      user.blockchain.blockchainTxHash = receipt.hash;
      await user.save();

      // Log blockchain sync
      await AuditLog.logAction({
        user: userId,
        walletAddress: user.walletAddress,
        action: `rbac:blockchain_sync_${action}`,
        actionCategory: 'blockchain',
        resource: 'AccessControl',
        success: true,
        metadata: {
          role,
          action,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        }
      });

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        message: `Role ${action} synced to blockchain`
      };
    } catch (error) {
      // Log failure
      await AuditLog.logAction({
        user: userId,
        walletAddress: user.walletAddress,
        action: `rbac:blockchain_sync_${action}_failed`,
        actionCategory: 'blockchain',
        resource: 'AccessControl',
        success: false,
        errorMessage: error.message,
        metadata: {
          role,
          action
        },
        securityFlags: {
          isSuspicious: true
        }
      });

      throw new Error(`Blockchain sync failed: ${error.message}`);
    }
  }

  /**
   * Get role hierarchy
   * @returns {array} - Role hierarchy
   */
  async getRoleHierarchy() {
    const roles = await Role.find({}).sort({ level: -1 });
    
    return roles.map(role => ({
      name: role.name,
      level: role.level,
      displayName: role.displayName,
      description: role.description,
      permissionCount: role.permissions.length,
      requirements: role.requirements
    }));
  }

  /**
   * Validate role change
   * @param {object} data - Validation data
   * @returns {object} - Validation result
   */
  async validateRoleChange(data) {
    const { userId, newRole, changedBy } = data;

    const errors = [];
    const warnings = [];

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      errors.push('User not found');
      return { valid: false, errors, warnings };
    }

    // Fetch role
    const roleData = await Role.findOne({ name: newRole });
    if (!roleData) {
      errors.push('Role not found');
      return { valid: false, errors, warnings };
    }

    // Check if already has role
    if (user.hasRole(newRole)) {
      warnings.push(`User already has role ${newRole}`);
    }

    // Check role conflicts
    const conflicts = this._checkRoleConflicts(user.roles, newRole);
    if (conflicts.length > 0) {
      errors.push(...conflicts);
    }

    // Check KYC requirements
    if (roleData.requirements.requiresKYC && user.verification.kycStatus !== 'approved') {
      errors.push(`Role requires KYC approval. Current status: ${user.verification.kycStatus}`);
    }

    // Check verification requirements
    if (roleData.requirements.requiresVerification && !user.verification.isVerified) {
      errors.push('Role requires account verification');
    }

    // Check business license
    if (
      (newRole === 'DISTRIBUTOR' || newRole === 'RETAILER') &&
      !user.verification.businessLicense?.isVerified
    ) {
      errors.push('Role requires verified business license');
    }

    // Check changer permissions if provided
    if (changedBy) {
      const changer = await User.findById(changedBy);
      if (changer) {
        const changerRole = await Role.findOne({ name: changer.primaryRole });
        if (changerRole && changerRole.level <= roleData.level && changer.primaryRole !== 'SUPER_ADMIN') {
          errors.push(`Changer's role level (${changerRole.level}) is insufficient to grant role level ${roleData.level}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if user can access a specific resource
   * @param {object} data - Access check data
   * @returns {boolean} - Access result
   */
  async canUserAccessResource(data) {
    const { userId, resourceType, resourceId, action } = data;

    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    // Check if user is active
    if (!user.status.isActive || user.status.isSuspended) {
      return false;
    }

    // Build permission string
    const permission = `${resourceType}:${action}`;

    // Check permission
    if (!user.hasPermission(permission)) {
      return false;
    }

    // Additional ownership checks for specific resources
    if (resourceId) {
      // Load resource model dynamically
      try {
        const ResourceModel = require(`../models/${resourceType}.model`);
        const resource = await ResourceModel.findById(resourceId);
        
        if (!resource) {
          return false;
        }

        // Check ownership based on resource type
        const ownerField = this._getOwnerField(resourceType);
        if (ownerField && resource[ownerField]) {
          const resourceOwnerId = resource[ownerField].toString();
          const isOwner = resourceOwnerId === userId.toString();
          
          // Allow admin override
          if (!isOwner && !user.hasRole('ADMIN') && !user.hasRole('SUPER_ADMIN')) {
            return false;
          }
        }
      } catch (error) {
        console.error('Resource ownership check failed:', error);
        // If we can't check ownership, fall back to permission check
      }
    }

    return true;
  }

  /**
   * Check for role conflicts
   * @private
   */
  _checkRoleConflicts(existingRoles, newRole) {
    const conflicts = [];

    // FARMER and DISTRIBUTOR conflict
    if (newRole === 'FARMER' && existingRoles.includes('DISTRIBUTOR')) {
      conflicts.push('Cannot be both FARMER and DISTRIBUTOR');
    }
    if (newRole === 'DISTRIBUTOR' && existingRoles.includes('FARMER')) {
      conflicts.push('Cannot be both DISTRIBUTOR and FARMER');
    }

    // SUPER_ADMIN is exclusive
    if (newRole === 'SUPER_ADMIN' && existingRoles.length > 0) {
      conflicts.push('SUPER_ADMIN role is exclusive and cannot be combined with other roles');
    }
    if (existingRoles.includes('SUPER_ADMIN') && newRole !== 'SUPER_ADMIN') {
      conflicts.push('Cannot add other roles to SUPER_ADMIN');
    }

    return conflicts;
  }

  /**
   * Get owner field name for resource type
   * @private
   */
  _getOwnerField(resourceType) {
    const ownerFields = {
      Product: 'farmer',
      Order: 'buyer',
      User: '_id',
      Payment: 'buyer'
    };
    return ownerFields[resourceType] || 'owner';
  }
}

module.exports = new RBACService();
