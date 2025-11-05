const mongoose = require('mongoose');

/**
 * Permission Schema
 * Defines individual permissions that can be assigned to roles
 */
const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Permission format: category:action (e.g., 'product:create')
        return /^[a-z_]+:[a-z_]+$/.test(v);
      },
      message: 'Permission must be in format category:action'
    }
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'authentication',
      'user_management',
      'product_management',
      'order_management',
      'payment_management',
      'inventory_management',
      'analytics',
      'admin_functions',
      'notification',
      'ai_services'
    ],
    index: true
  },

  description: {
    type: String,
    required: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },

  displayName: {
    type: String,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  metadata: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    requiresVerification: {
      type: Boolean,
      default: false
    },
    requiresKYC: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
permissionSchema.index({ category: 1, isActive: 1 });
permissionSchema.index({ name: 1, isActive: 1 });

// Static methods

/**
 * Get all permissions by category
 */
permissionSchema.statics.getByCategory = async function(category) {
  return await this.find({ category, isActive: true }).sort({ name: 1 });
};

/**
 * Get permissions by names
 */
permissionSchema.statics.getByNames = async function(names) {
  return await this.find({ name: { $in: names }, isActive: true });
};

/**
 * Check if permission exists
 */
permissionSchema.statics.exists = async function(name) {
  const permission = await this.findOne({ name });
  return !!permission;
};

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
