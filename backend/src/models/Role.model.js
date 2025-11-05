const mongoose = require('mongoose');

/**
 * Role Schema
 * Defines system roles with their permissions and constraints
 */
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    enum: ['SUPER_ADMIN', 'ADMIN', 'FARMER', 'DISTRIBUTOR', 'RETAILER', 'CONSUMER'],
    index: true
  },

  displayName: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Permissions assigned to this role
  permissions: {
    type: [String],
    default: []
  },

  // Permissions explicitly excluded from this role
  excludedPermissions: {
    type: [String],
    default: []
  },

  // Role hierarchy level (higher = more privilege)
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    index: true
  },

  // Rate limits for this role
  rateLimits: {
    apiCallsPerMinute: {
      type: Number,
      default: 60
    },
    blockchainTxPerHour: {
      type: Number,
      default: 10
    },
    productCreationPerDay: {
      type: Number,
      default: 0
    },
    orderCreationPerDay: {
      type: Number,
      default: 20
    },
    customLimits: {
      type: Map,
      of: Number,
      default: {}
    }
  },

  // Role requirements
  requirements: {
    requiresVerification: {
      type: Boolean,
      default: false
    },
    requiresKYC: {
      type: Boolean,
      default: false
    },
    minimumAge: {
      type: Number,
      default: 18
    },
    allowedCountries: {
      type: [String],
      default: []
    },
    requiredDocuments: {
      type: [String],
      default: []
    }
  },

  // Business rules
  businessRules: {
    canOwnProducts: {
      type: Boolean,
      default: false
    },
    canTransferProducts: {
      type: Boolean,
      default: false
    },
    canApproveKYC: {
      type: Boolean,
      default: false
    },
    canAccessAnalytics: {
      type: Boolean,
      default: false
    },
    maxTransactionAmount: {
      type: Number,
      default: 0 // 0 = unlimited
    }
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  isSystemRole: {
    type: Boolean,
    default: true
  },

  color: {
    type: String,
    default: '#000000'
  },

  icon: {
    type: String,
    default: 'user'
  }
}, {
  timestamps: true
});

// Indexes
roleSchema.index({ level: -1 });
roleSchema.index({ name: 1, isActive: 1 });

// Methods

/**
 * Check if role has permission
 */
roleSchema.methods.hasPermission = function(permission) {
  // Check excluded permissions first
  if (this.excludedPermissions.includes(permission)) {
    return false;
  }

  // Check for wildcard
  if (this.permissions.includes('*')) {
    return true;
  }

  // Check exact permission
  if (this.permissions.includes(permission)) {
    return true;
  }

  // Check category wildcard (e.g., 'product:*')
  const category = permission.split(':')[0];
  if (this.permissions.includes(`${category}:*`)) {
    return true;
  }

  return false;
};

/**
 * Get all effective permissions (resolve wildcards)
 */
roleSchema.methods.getEffectivePermissions = async function() {
  const Permission = mongoose.model('Permission');
  
  // If has wildcard, return all permissions
  if (this.permissions.includes('*')) {
    const allPermissions = await Permission.find({ isActive: true }, 'name');
    return allPermissions.map(p => p.name);
  }

  const effectivePermissions = new Set();

  for (const perm of this.permissions) {
    if (perm.endsWith(':*')) {
      // Category wildcard
      const category = perm.split(':')[0];
      const categoryPerms = await Permission.find({ 
        category, 
        isActive: true 
      }, 'name');
      categoryPerms.forEach(p => effectivePermissions.add(p.name));
    } else {
      // Exact permission
      effectivePermissions.add(perm);
    }
  }

  // Remove excluded permissions
  this.excludedPermissions.forEach(perm => {
    effectivePermissions.delete(perm);
  });

  return Array.from(effectivePermissions);
};

/**
 * Add permission to role
 */
roleSchema.methods.addPermission = async function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
    await this.save();
  }
};

/**
 * Remove permission from role
 */
roleSchema.methods.removePermission = async function(permission) {
  const index = this.permissions.indexOf(permission);
  if (index > -1) {
    this.permissions.splice(index, 1);
    await this.save();
  }
};

/**
 * Get rate limit for specific action
 */
roleSchema.methods.getRateLimit = function(action) {
  const limitMap = {
    'api_call': this.rateLimits.apiCallsPerMinute,
    'blockchain_tx': this.rateLimits.blockchainTxPerHour,
    'product_creation': this.rateLimits.productCreationPerDay,
    'order_creation': this.rateLimits.orderCreationPerDay
  };

  return limitMap[action] || 0;
};

// Static methods

/**
 * Get role by name
 */
roleSchema.statics.getByName = async function(name) {
  return await this.findOne({ name, isActive: true });
};

/**
 * Get roles by level
 */
roleSchema.statics.getByLevel = async function(minLevel, maxLevel) {
  return await this.find({
    level: { $gte: minLevel, $lte: maxLevel },
    isActive: true
  }).sort({ level: -1 });
};

/**
 * Get role hierarchy
 */
roleSchema.statics.getHierarchy = async function() {
  const roles = await this.find({ isActive: true }).sort({ level: -1 });
  return roles.map(role => ({
    name: role.name,
    displayName: role.displayName,
    level: role.level
  }));
};

/**
 * Initialize default roles
 */
roleSchema.statics.initializeDefaults = async function() {
  const defaultRoles = [
    {
      name: 'SUPER_ADMIN',
      displayName: 'Super Administrator',
      description: 'System owner with full access to all features including destructive operations',
      permissions: ['*'],
      excludedPermissions: [],
      level: 10,
      rateLimits: {
        apiCallsPerMinute: 1000,
        blockchainTxPerHour: 100,
        productCreationPerDay: 0,
        orderCreationPerDay: 0
      },
      requirements: {
        requiresVerification: true,
        requiresKYC: true
      },
      businessRules: {
        canOwnProducts: true,
        canTransferProducts: true,
        canApproveKYC: true,
        canAccessAnalytics: true,
        maxTransactionAmount: 0
      },
      color: '#DC2626',
      icon: 'shield-check'
    },
    {
      name: 'ADMIN',
      displayName: 'Administrator',
      description: 'Platform administrator with moderation and management powers',
      permissions: [
        'auth:*',
        'user:view_all_profiles',
        'user:view_activity_logs',
        'user:verify_kyc',
        'user:suspend_user',
        'product:view_all',
        'product:approve',
        'product:reject',
        'product:delete_any',
        'order:view_all',
        'order:cancel_any',
        'payment:view_all',
        'payment:approve_refund',
        'analytics:view_platform_stats',
        'analytics:export_reports',
        'admin:access_dashboard',
        'admin:moderate_content',
        'admin:resolve_disputes',
        'admin:view_audit_logs'
      ],
      excludedPermissions: [
        'user:delete_any_account',
        'admin:backup_database',
        'admin:manage_blockchain_contracts'
      ],
      level: 8,
      rateLimits: {
        apiCallsPerMinute: 500,
        blockchainTxPerHour: 50,
        productCreationPerDay: 0,
        orderCreationPerDay: 0
      },
      requirements: {
        requiresVerification: true,
        requiresKYC: true
      },
      businessRules: {
        canOwnProducts: false,
        canTransferProducts: true,
        canApproveKYC: true,
        canAccessAnalytics: true,
        maxTransactionAmount: 0
      },
      color: '#7C3AED',
      icon: 'user-shield'
    },
    {
      name: 'FARMER',
      displayName: 'Farmer',
      description: 'Agricultural producer who registers and sells products',
      permissions: [
        'auth:*',
        'user:view_own_profile',
        'user:edit_own_profile',
        'product:create',
        'product:view_own',
        'product:view_public',
        'product:edit_own',
        'product:delete_own',
        'product:update_status',
        'product:add_to_blockchain',
        'product:view_blockchain_data',
        'order:view_as_seller',
        'order:update_status',
        'payment:view_own',
        'payment:create_escrow',
        'inventory:view_own',
        'inventory:update_own',
        'inventory:add_batch',
        'analytics:view_own_stats',
        'notification:*',
        'ai:predict_yield',
        'ai:assess_quality',
        'ai:predict_price',
        'ai:detect_disease',
        'ai:get_recommendations'
      ],
      excludedPermissions: [],
      level: 5,
      rateLimits: {
        apiCallsPerMinute: 100,
        blockchainTxPerHour: 20,
        productCreationPerDay: 50,
        orderCreationPerDay: 100
      },
      requirements: {
        requiresVerification: true,
        requiresKYC: true
      },
      businessRules: {
        canOwnProducts: true,
        canTransferProducts: true,
        canApproveKYC: false,
        canAccessAnalytics: true,
        maxTransactionAmount: 0
      },
      color: '#16A34A',
      icon: 'tractor'
    },
    {
      name: 'DISTRIBUTOR',
      displayName: 'Distributor',
      description: 'Bulk buyer and seller in the supply chain',
      permissions: [
        'auth:*',
        'user:view_own_profile',
        'user:edit_own_profile',
        'product:view_all',
        'product:view_public',
        'order:create',
        'order:view_own',
        'order:view_as_buyer',
        'order:view_as_seller',
        'order:cancel_own',
        'order:update_status',
        'payment:view_own',
        'payment:create_escrow',
        'payment:release_escrow',
        'inventory:view_own',
        'inventory:update_own',
        'inventory:transfer',
        'analytics:view_own_stats',
        'notification:*',
        'ai:predict_price',
        'ai:get_recommendations'
      ],
      excludedPermissions: [],
      level: 5,
      rateLimits: {
        apiCallsPerMinute: 150,
        blockchainTxPerHour: 30,
        productCreationPerDay: 0,
        orderCreationPerDay: 100
      },
      requirements: {
        requiresVerification: true,
        requiresKYC: true
      },
      businessRules: {
        canOwnProducts: true,
        canTransferProducts: true,
        canApproveKYC: false,
        canAccessAnalytics: true,
        maxTransactionAmount: 0
      },
      color: '#2563EB',
      icon: 'truck'
    },
    {
      name: 'RETAILER',
      displayName: 'Retailer',
      description: 'Retail business that sells to end consumers',
      permissions: [
        'auth:*',
        'user:view_own_profile',
        'user:edit_own_profile',
        'product:view_all',
        'product:view_public',
        'order:create',
        'order:view_own',
        'order:view_as_buyer',
        'order:cancel_own',
        'payment:view_own',
        'payment:create_escrow',
        'inventory:view_own',
        'analytics:view_own_stats',
        'notification:*'
      ],
      excludedPermissions: [],
      level: 4,
      rateLimits: {
        apiCallsPerMinute: 100,
        blockchainTxPerHour: 15,
        productCreationPerDay: 0,
        orderCreationPerDay: 50
      },
      requirements: {
        requiresVerification: true,
        requiresKYC: false
      },
      businessRules: {
        canOwnProducts: false,
        canTransferProducts: false,
        canApproveKYC: false,
        canAccessAnalytics: true,
        maxTransactionAmount: 0
      },
      color: '#F59E0B',
      icon: 'store'
    },
    {
      name: 'CONSUMER',
      displayName: 'Consumer',
      description: 'End consumer who purchases products',
      permissions: [
        'auth:*',
        'user:view_own_profile',
        'user:edit_own_profile',
        'product:view_public',
        'order:create',
        'order:view_own',
        'order:cancel_own',
        'order:track',
        'order:rate_review',
        'payment:view_own',
        'payment:create_escrow',
        'payment:request_refund',
        'payment:download_invoice',
        'notification:*'
      ],
      excludedPermissions: [],
      level: 2,
      rateLimits: {
        apiCallsPerMinute: 60,
        blockchainTxPerHour: 10,
        productCreationPerDay: 0,
        orderCreationPerDay: 20
      },
      requirements: {
        requiresVerification: false,
        requiresKYC: false
      },
      businessRules: {
        canOwnProducts: false,
        canTransferProducts: false,
        canApproveKYC: false,
        canAccessAnalytics: false,
        maxTransactionAmount: 10000
      },
      color: '#6B7280',
      icon: 'user'
    }
  ];

  for (const roleData of defaultRoles) {
    await this.findOneAndUpdate(
      { name: roleData.name },
      roleData,
      { upsert: true, new: true }
    );
  }

  console.log('Default roles initialized successfully');
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
