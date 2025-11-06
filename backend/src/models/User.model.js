const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema with comprehensive RBAC support
 * FIX #12: Consolidated from User.model.js and User.model.js
 * Handles roles, permissions, verification, rate limiting, and security
 */
const userSchema = new mongoose.Schema({
  // Primary Authentication
  walletAddress: {
    type: String,
    required: [true, 'Wallet address is required'],
    unique: true,
    lowercase: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum wallet address format'
    }
  },

  // RBAC - Roles and Permissions
  roles: {
    type: [String],
    enum: ['SUPER_ADMIN', 'ADMIN', 'FARMER', 'DISTRIBUTOR', 'RETAILER', 'CONSUMER'],
    default: ['CONSUMER'],
    required: true,
    validate: {
      validator: function(roles) {
        // Validate role combinations
        const hasAdmin = roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
        const hasBusinessRole = roles.includes('FARMER') || roles.includes('DISTRIBUTOR');
        
        // SUPER_ADMIN and ADMIN should not have other roles
        if (roles.includes('SUPER_ADMIN') && roles.length > 1) {
          return false;
        }
        
        // Can't be both FARMER and DISTRIBUTOR
        if (roles.includes('FARMER') && roles.includes('DISTRIBUTOR')) {
          return false;
        }
        
        return true;
      },
      message: 'Invalid role combination'
    }
  },

  primaryRole: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', 'FARMER', 'DISTRIBUTOR', 'RETAILER', 'CONSUMER'],
    required: true,
    default: 'CONSUMER',
    index: true
  },

  // Custom permissions (in addition to role permissions)
  permissions: {
    type: [String],
    default: []
  },

  // Role History for Audit Trail
  roleHistory: [{
    role: {
      type: String,
      required: true
    },
    action: {
      type: String,
      enum: ['granted', 'revoked'],
      required: true
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],

  // Verification and KYC
  verification: {
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    kycStatus: {
      type: String,
      enum: ['not_started', 'pending', 'approved', 'rejected', 'expired'],
      default: 'not_started',
      index: true
    },
    kycDocuments: [{
      type: {
        type: String,
        enum: ['id_proof', 'address_proof', 'business_license', 'farm_certificate', 'tax_certificate'],
        required: true
      },
      ipfsHash: String,
      fileName: String,
      uploadDate: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }],
    businessLicense: {
      number: String,
      issueDate: Date,
      expiryDate: Date,
      issuingAuthority: String,
      documentHash: String
    },
    verificationLevel: {
      type: Number,
      min: 0,
      max: 3,
      default: 0
    },
    kycSubmittedAt: Date,
    kycApprovedAt: Date,
    kycRejectedAt: Date,
    rejectionReason: String
  },

  // User Profile
  profile: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    },
    avatar: String,
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    businessName: String,
    businessType: {
      type: String,
      enum: ['farm', 'cooperative', 'distributor', 'warehouse', 'retail', 'online', 'other']
    },
    taxId: String,
    website: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      facebook: String
    },
    location: {
      address: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          index: '2dsphere'
        }
      },
      city: String,
      state: String,
      country: String,
      pincode: String,
      timezone: String
    }
  },

  // Security
  security: {
    lastLogin: Date,
    lastLoginIP: String,
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    accountLockedUntil: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String, // Store encrypted
    twoFactorBackupCodes: [String],
    trustedDevices: [{
      deviceId: String,
      deviceName: String,
      addedAt: Date,
      lastUsed: Date
    }],
    sessionToken: String,
    sessionExpiry: Date,
    passwordHash: String, // Optional password for additional security
    passwordLastChanged: Date
  },

  // User Preferences
  preferences: {
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      },
      orderUpdates: {
        type: Boolean,
        default: true
      },
      paymentAlerts: {
        type: Boolean,
        default: true
      },
      marketingEmails: {
        type: Boolean,
        default: false
      }
    },
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ['public', 'verified_users', 'private'],
        default: 'public'
      },
      showLocation: {
        type: Boolean,
        default: true
      },
      showContactInfo: {
        type: Boolean,
        default: false
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Rate Limiting
  rateLimits: {
    apiCallsToday: {
      type: Number,
      default: 0
    },
    blockchainTxToday: {
      type: Number,
      default: 0
    },
    productsCreatedToday: {
      type: Number,
      default: 0
    },
    ordersCreatedToday: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },

  // Account Status
  status: {
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true
    },
    suspensionReason: String,
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    suspendedAt: Date,
    suspensionExpiresAt: Date
  },

  // Blockchain Integration
  blockchain: {
    hasBlockchainRole: {
      type: Boolean,
      default: false
    },
    blockchainRoleGrantedAt: Date,
    blockchainTxHash: String,
    lastBlockchainSync: Date
  },

  // Business Metrics (for farmers/distributors)
  businessInfo: {
    registrationNumber: String,
    farmSize: {
      value: Number,
      unit: {
        type: String,
        enum: ['acres', 'hectares', 'sqft', 'sqm']
      }
    },
    licenseNumber: String,
    farmingType: {
      type: String,
      enum: ['organic', 'conventional', 'mixed']
    },
    specializations: [String],
    establishedYear: Number,
    employeeCount: Number,
    annualRevenue: Number
  },

  // Statistics
  stats: {
    productsListed: {
      type: Number,
      default: 0
    },
    productsSold: {
      type: Number,
      default: 0
    },
    ordersPlaced: {
      type: Number,
      default: 0
    },
    ordersReceived: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    responseTime: Number, // Average response time in hours
    completionRate: Number // Percentage of completed orders
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    // FIX #25: Hide sensitive security fields from JSON output
    transform: function(doc, ret) {
      // Remove sensitive security fields
      if (ret.security) {
        delete ret.security.twoFactorSecret;
        delete ret.security.twoFactorBackupCodes;
        delete ret.security.sessionToken;
        delete ret.security.passwordHash;
        delete ret.security.trustedDevices;
      }
      
      // Remove internal rate limiting data
      delete ret.rateLimits;
      
      // Remove sensitive verification documents
      if (ret.verification && ret.verification.kycDocuments) {
        ret.verification.kycDocuments = ret.verification.kycDocuments.map(doc => ({
          type: doc.type,
          status: doc.status,
          uploadDate: doc.uploadDate
        }));
      }
      
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ roles: 1, 'status.isActive': 1 });
userSchema.index({ primaryRole: 1 });
userSchema.index({ 'verification.isVerified': 1 });
userSchema.index({ 'verification.kycStatus': 1 });
userSchema.index({ 'security.lastLogin': -1 });
userSchema.index({ 'status.isActive': 1, 'status.isSuspended': 1 });
userSchema.index({ 'profile.location.coordinates': '2dsphere' });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.profile.name;
});

// Methods

/**
 * Check if user has a specific role
 */
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

/**
 * Check if user has any of the specified roles
 */
userSchema.methods.hasAnyRole = function(roles) {
  return roles.some(role => this.roles.includes(role));
};

/**
 * Check if user has all specified roles
 */
userSchema.methods.hasAllRoles = function(roles) {
  return roles.every(role => this.roles.includes(role));
};

/**
 * Check if user has a specific permission
 */
userSchema.methods.hasPermission = function(permission) {
  // Check custom permissions
  if (this.permissions.includes(permission)) {
    return true;
  }

  // Check wildcard permissions
  if (this.permissions.includes('*')) {
    return true;
  }

  // Check category wildcards (e.g., 'product:*')
  const category = permission.split(':')[0];
  if (this.permissions.includes(`${category}:*`)) {
    return true;
  }

  return false;
};

/**
 * Check if user can perform an action
 */
userSchema.methods.canPerformAction = function(action) {
  // Check if account is active
  if (!this.status.isActive || this.status.isSuspended) {
    return false;
  }

  // Check if account is locked
  if (this.security.accountLockedUntil && this.security.accountLockedUntil > new Date()) {
    return false;
  }

  return true;
};

/**
 * Check rate limit for an action
 */
userSchema.methods.checkRateLimit = function(action, limit) {
  // Reset counters if it's a new day
  const now = new Date();
  const lastReset = this.rateLimits.lastResetDate;
  
  if (!lastReset || now - lastReset > 24 * 60 * 60 * 1000) {
    return false; // Need reset, limit not exceeded
  }

  const actionMap = {
    'api_call': 'apiCallsToday',
    'blockchain_tx': 'blockchainTxToday',
    'product_creation': 'productsCreatedToday',
    'order_creation': 'ordersCreatedToday'
  };

  const field = actionMap[action];
  if (!field) return false;

  return this.rateLimits[field] >= limit;
};

/**
 * Increment rate limit counter
 */
userSchema.methods.incrementRateLimit = async function(action) {
  const actionMap = {
    'api_call': 'apiCallsToday',
    'blockchain_tx': 'blockchainTxToday',
    'product_creation': 'productsCreatedToday',
    'order_creation': 'ordersCreatedToday'
  };

  const field = actionMap[action];
  if (!field) return;

  this.rateLimits[field]++;
  await this.save();
};

/**
 * Reset daily rate limits
 */
userSchema.methods.resetDailyLimits = async function() {
  this.rateLimits.apiCallsToday = 0;
  this.rateLimits.blockchainTxToday = 0;
  this.rateLimits.productsCreatedToday = 0;
  this.rateLimits.ordersCreatedToday = 0;
  this.rateLimits.lastResetDate = new Date();
  await this.save();
};

/**
 * Grant role to user
 */
userSchema.methods.grantRole = async function(role, grantedBy, reason) {
  if (!this.roles.includes(role)) {
    this.roles.push(role);
    
    // If it's a higher privilege role, update primary role
    const roleHierarchy = {
      'SUPER_ADMIN': 10,
      'ADMIN': 8,
      'FARMER': 5,
      'DISTRIBUTOR': 5,
      'RETAILER': 4,
      'CONSUMER': 2
    };

    if (roleHierarchy[role] > roleHierarchy[this.primaryRole]) {
      this.primaryRole = role;
    }

    this.roleHistory.push({
      role,
      action: 'granted',
      grantedBy,
      timestamp: new Date(),
      reason
    });

    await this.save();
  }
};

/**
 * Revoke role from user
 */
userSchema.methods.revokeRole = async function(role, revokedBy, reason) {
  const index = this.roles.indexOf(role);
  if (index > -1) {
    this.roles.splice(index, 1);

    // Update primary role if needed
    if (this.primaryRole === role) {
      this.primaryRole = this.roles[0] || 'CONSUMER';
    }

    this.roleHistory.push({
      role,
      action: 'revoked',
      grantedBy: revokedBy,
      timestamp: new Date(),
      reason
    });

    await this.save();
  }
};

/**
 * Suspend user account
 */
userSchema.methods.suspend = async function(reason, suspendedBy, duration) {
  this.status.isSuspended = true;
  this.status.suspensionReason = reason;
  this.status.suspendedBy = suspendedBy;
  this.status.suspendedAt = new Date();
  
  if (duration) {
    this.status.suspensionExpiresAt = new Date(Date.now() + duration);
  }

  await this.save();
};

/**
 * Reactivate user account
 */
userSchema.methods.reactivate = async function() {
  this.status.isSuspended = false;
  this.status.suspensionReason = null;
  this.status.suspensionExpiresAt = null;
  await this.save();
};

/**
 * Hash password (for additional security layer)
 */
userSchema.methods.setPassword = async function(password) {
  this.security.passwordHash = await bcrypt.hash(password, 10);
  this.security.passwordLastChanged = new Date();
  await this.save();
};

/**
 * Verify password
 */
userSchema.methods.verifyPassword = async function(password) {
  if (!this.security.passwordHash) return false;
  return await bcrypt.compare(password, this.security.passwordHash);
};

/**
 * Sanitize user object for public view
 */
userSchema.methods.toPublicJSON = function() {
  return {
    walletAddress: this.walletAddress,
    primaryRole: this.primaryRole,
    profile: {
      name: this.profile.name,
      avatar: this.profile.avatar,
      bio: this.profile.bio,
      businessName: this.profile.businessName,
      location: this.preferences.privacySettings.showLocation ? {
        city: this.profile.location.city,
        state: this.profile.location.state,
        country: this.profile.location.country
      } : null
    },
    stats: {
      averageRating: this.stats.averageRating,
      ratingCount: this.stats.ratingCount,
      productsListed: this.stats.productsListed,
      completionRate: this.stats.completionRate
    },
    verification: {
      isVerified: this.verification.isVerified,
      verificationLevel: this.verification.verificationLevel
    }
  };
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Ensure primary role is in roles array
  if (!this.roles.includes(this.primaryRole)) {
    this.roles.push(this.primaryRole);
  }

  // Auto-suspend if suspension has expired
  if (this.status.isSuspended && this.status.suspensionExpiresAt) {
    if (this.status.suspensionExpiresAt < new Date()) {
      this.status.isSuspended = false;
      this.status.suspensionReason = null;
      this.status.suspensionExpiresAt = null;
    }
  }

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
