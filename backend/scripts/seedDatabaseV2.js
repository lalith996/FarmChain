/**
 * Database Seeding Script V2 - Fixed for correct schema
 * Run: node backend/scripts/seedDatabaseV2.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config({ path: './backend/.env' });

// Import models
const Role = require('../src/models/Role.model');
const Permission = require('../src/models/Permission.model');
const User = require('../src/models/User.model');
const AuditLog = require('../src/models/AuditLog.model');
const RateLimitTracker = require('../src/models/RateLimitTracker.model');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

// Permission definitions (46 permissions with correct schema)
const permissionsData = [
  // Product Management (8)
  { name: 'product:create', displayName: 'Create Product', description: 'Create new products', category: 'product_management' },
  { name: 'product:read', displayName: 'View Product', description: 'View product details', category: 'product_management' },
  { name: 'product:update', displayName: 'Update Product', description: 'Update product information', category: 'product_management' },
  { name: 'product:delete', displayName: 'Delete Product', description: 'Delete products', category: 'product_management' },
  { name: 'product:approve', displayName: 'Approve Product', description: 'Approve products for sale', category: 'product_management' },
  { name: 'product:reject', displayName: 'Reject Product', description: 'Reject product listings', category: 'product_management' },
  { name: 'product:transfer', displayName: 'Transfer Product', description: 'Transfer product ownership', category: 'product_management' },
  { name: 'product:batch', displayName: 'Batch Products', description: 'Create product batches', category: 'product_management' },

  // Order Management (7)
  { name: 'order:create', displayName: 'Create Order', description: 'Create new orders', category: 'order_management' },
  { name: 'order:read', displayName: 'View Order', description: 'View order details', category: 'order_management' },
  { name: 'order:update', displayName: 'Update Order', description: 'Update order status', category: 'order_management' },
  { name: 'order:cancel', displayName: 'Cancel Order', description: 'Cancel orders', category: 'order_management' },
  { name: 'order:fulfill', displayName: 'Fulfill Order', description: 'Fulfill orders', category: 'order_management' },
  { name: 'order:track', displayName: 'Track Order', description: 'Track order shipments', category: 'order_management' },
  { name: 'order:refund', displayName: 'Refund Order', description: 'Process order refunds', category: 'order_management' },

  // Payment Management (6)
  { name: 'payment:create', displayName: 'Create Payment', description: 'Create payment escrows', category: 'payment_management' },
  { name: 'payment:release', displayName: 'Release Payment', description: 'Release escrowed payments', category: 'payment_management' },
  { name: 'payment:refund', displayName: 'Refund Payment', description: 'Process payment refunds', category: 'payment_management' },
  { name: 'payment:dispute', displayName: 'Dispute Payment', description: 'Raise payment disputes', category: 'payment_management' },
  { name: 'payment:resolve', displayName: 'Resolve Payment', description: 'Resolve payment disputes', category: 'payment_management' },
  { name: 'payment:view', displayName: 'View Payments', description: 'View payment history', category: 'payment_management' },

  // User Management (8)
  { name: 'user:create', displayName: 'Create User', description: 'Create new users', category: 'user_management' },
  { name: 'user:read', displayName: 'View User', description: 'View user profiles', category: 'user_management' },
  { name: 'user:update', displayName: 'Update User', description: 'Update user information', category: 'user_management' },
  { name: 'user:delete', displayName: 'Delete User', description: 'Delete user accounts', category: 'user_management' },
  { name: 'user:suspend', displayName: 'Suspend User', description: 'Suspend user accounts', category: 'user_management' },
  { name: 'user:activate', displayName: 'Activate User', description: 'Activate user accounts', category: 'user_management' },
  { name: 'user:verify', displayName: 'Verify User', description: 'Verify user identity (KYC)', category: 'user_management' },
  { name: 'user:roles', displayName: 'Manage User Roles', description: 'Manage user roles', category: 'user_management' },

  // Analytics (5)
  { name: 'analytics:view', displayName: 'View Analytics', description: 'View analytics dashboard', category: 'analytics' },
  { name: 'analytics:export', displayName: 'Export Analytics', description: 'Export analytics data', category: 'analytics' },
  { name: 'analytics:reports', displayName: 'Generate Reports', description: 'Generate reports', category: 'analytics' },
  { name: 'analytics:metrics', displayName: 'View Metrics', description: 'View system metrics', category: 'analytics' },
  { name: 'analytics:logs', displayName: 'View Logs', description: 'View audit logs', category: 'analytics' },

  // Admin Functions (5)
  { name: 'admin:config', displayName: 'System Config', description: 'Manage system configuration', category: 'admin_functions' },
  { name: 'admin:backup', displayName: 'System Backup', description: 'Perform system backups', category: 'admin_functions' },
  { name: 'admin:restore', displayName: 'System Restore', description: 'Restore from backups', category: 'admin_functions' },
  { name: 'admin:maintenance', displayName: 'Maintenance Mode', description: 'Enable maintenance mode', category: 'admin_functions' },
  { name: 'admin:monitor', displayName: 'System Monitor', description: 'Monitor system health', category: 'admin_functions' },

  // Inventory Management (4)
  { name: 'inventory:view', displayName: 'View Inventory', description: 'View inventory levels', category: 'inventory_management' },
  { name: 'inventory:update', displayName: 'Update Inventory', description: 'Update inventory quantities', category: 'inventory_management' },
  { name: 'inventory:transfer', displayName: 'Transfer Inventory', description: 'Transfer inventory between locations', category: 'inventory_management' },
  { name: 'inventory:audit', displayName: 'Audit Inventory', description: 'Perform inventory audits', category: 'inventory_management' },

  // Notifications (3)
  { name: 'notification:send', displayName: 'Send Notification', description: 'Send notifications', category: 'notification' },
  { name: 'notification:read', displayName: 'Read Notification', description: 'Read notifications', category: 'notification' },
  { name: 'notification:manage', displayName: 'Manage Notifications', description: 'Manage notification settings', category: 'notification' }
];

// Role definitions
const rolesData = [
  {
    name: 'SUPER_ADMIN',
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions',
    level: 10,
    permissions: permissionsData.map(p => p.name),
    isSystemRole: true
  },
  {
    name: 'ADMIN',
    displayName: 'Administrator',
    description: 'Administrative access for platform management',
    level: 8,
    permissions: permissionsData.filter(p => 
      !p.name.startsWith('admin:config') && 
      !p.name.startsWith('admin:backup') &&
      !p.name.startsWith('admin:restore')
    ).map(p => p.name),
    isSystemRole: true
  },
  {
    name: 'FARMER',
    displayName: 'Farmer',
    description: 'Producer with product and order management',
    level: 5,
    permissions: [
      'product:create', 'product:read', 'product:update', 'product:batch',
      'order:read', 'order:update', 'order:fulfill',
      'payment:view', 'payment:dispute',
      'inventory:view', 'inventory:update',
      'notification:read', 'notification:send',
      'analytics:view'
    ],
    isSystemRole: true
  },
  {
    name: 'DISTRIBUTOR',
    displayName: 'Distributor',
    description: 'Distributor with purchasing and logistics',
    level: 5,
    permissions: [
      'product:read', 'product:transfer',
      'order:create', 'order:read', 'order:update', 'order:track', 'order:fulfill',
      'payment:create', 'payment:view', 'payment:dispute',
      'inventory:view', 'inventory:transfer',
      'notification:read', 'notification:send',
      'analytics:view'
    ],
    isSystemRole: true
  },
  {
    name: 'RETAILER',
    displayName: 'Retailer',
    description: 'Retailer with sales and fulfillment',
    level: 4,
    permissions: [
      'product:read',
      'order:create', 'order:read', 'order:update', 'order:fulfill', 'order:refund',
      'payment:create', 'payment:view',
      'inventory:view',
      'notification:read',
      'analytics:view'
    ],
    isSystemRole: true
  },
  {
    name: 'CONSUMER',
    displayName: 'Consumer',
    description: 'End consumer with purchasing capability',
    level: 2,
    permissions: [
      'product:read',
      'order:create', 'order:read', 'order:cancel', 'order:track',
      'payment:create', 'payment:view',
      'notification:read'
    ],
    isSystemRole: true
  }
];

// Sample users
const sampleUsers = [
  {
    walletAddress: '0x1234567890123456789012345678901234567890',
    email: 'superadmin@farmchain.io',
    roles: ['SUPER_ADMIN'],
    username: 'SuperAdmin',
    profile: {
      name: 'Super Administrator',
      email: 'superadmin@farmchain.io'
    },
    verification: {
      isVerified: true,
      kycStatus: 'approved',
      kycDocuments: [{
        idType: 'passport',
        idNumber: 'SA123456',
        issuedDate: new Date('2020-01-01'),
        expiryDate: new Date('2030-01-01'),
        ipfsHash: 'QmSuperAdminKYC123'
      }]
    }
  },
  {
    walletAddress: '0x2234567890123456789012345678901234567891',
    email: 'admin@farmchain.io',
    roles: ['ADMIN'],
    username: 'PlatformAdmin',
    profile: {
      name: 'Platform Administrator',
      email: 'admin@farmchain.io'
    },
    verification: {
      isVerified: true,
      kycStatus: 'approved',
      kycDocuments: [{
        idType: 'national_id',
        idNumber: 'AD789012',
        issuedDate: new Date('2020-03-15'),
        expiryDate: new Date('2030-03-15'),
        ipfsHash: 'QmAdminKYC456'
      }]
    }
  },
  {
    walletAddress: '0x3234567890123456789012345678901234567892',
    email: 'farmer1@farmchain.io',
    roles: ['FARMER'],
    username: 'JohnFarmer',
    profile: {
      name: 'John Smith',
      email: 'farmer1@farmchain.io',
      businessName: 'Green Valley Farm',
      businessType: 'farm',
      location: {
        address: 'Iowa, USA'
      }
    },
    verification: {
      isVerified: true,
      kycStatus: 'approved',
      kycDocuments: [{
        idType: 'drivers_license',
        idNumber: 'FM456789',
        issuedDate: new Date('2019-06-01'),
        expiryDate: new Date('2029-06-01'),
        ipfsHash: 'QmFarmer1KYC789'
      }]
    }
  },
  {
    walletAddress: '0x4234567890123456789012345678901234567893',
    email: 'distributor@farmchain.io',
    roles: ['DISTRIBUTOR'],
    username: 'AgriDistributors',
    profile: {
      name: 'Agri Distributors Inc',
      email: 'distributor@farmchain.io',
      businessName: 'Midwest Agri Distributors',
      businessType: 'distributor',
      location: {
        address: 'Illinois, USA'
      }
    },
    verification: {
      isVerified: true,
      kycStatus: 'approved',
      kycDocuments: [{
        idType: 'business_license',
        idNumber: 'DT012345',
        issuedDate: new Date('2018-01-15'),
        expiryDate: new Date('2028-01-15'),
        ipfsHash: 'QmDistributorKYC012'
      }]
    }
  },
  {
    walletAddress: '0x5234567890123456789012345678901234567894',
    email: 'retailer@farmchain.io',
    roles: ['RETAILER'],
    username: 'FreshMartRetail',
    profile: {
      name: 'FreshMart Retail',
      email: 'retailer@farmchain.io',
      businessName: 'FreshMart Grocery Store',
      businessType: 'retail',
      location: {
        address: 'New York, USA'
      }
    },
    verification: {
      isVerified: true,
      kycStatus: 'approved',
      kycDocuments: [{
        idType: 'business_license',
        idNumber: 'RT567890',
        issuedDate: new Date('2019-05-10'),
        expiryDate: new Date('2029-05-10'),
        ipfsHash: 'QmRetailerKYC567'
      }]
    }
  },
  {
    walletAddress: '0x6234567890123456789012345678901234567895',
    email: 'consumer@farmchain.io',
    roles: ['CONSUMER'],
    username: 'AliceConsumer',
    profile: {
      name: 'Alice Johnson',
      email: 'consumer@farmchain.io',
      location: {
        address: 'California, USA'
      }
    },
    verification: {
      isVerified: false,
      kycStatus: 'pending'
    }
  }
];

// Seeding functions
async function seedPermissions() {
  try {
    log.info('Clearing existing permissions');
    await Permission.deleteMany({});
    
    const permissions = await Permission.insertMany(permissionsData);
    log.success(`Seeded ${permissions.length} permissions`);
    
    // Show breakdown by category
    const categories = {};
    permissions.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    console.log(`${colors.blue}  Category Breakdown:${colors.reset}`);
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`    ├─ ${category}: ${count}`);
    });
  } catch (error) {
    log.error(`Error seeding permissions: ${error.message}`);
    throw error;
  }
}

async function seedRoles() {
  try {
    log.info('Clearing existing roles');
    await Role.deleteMany({});
    
    const roles = await Role.insertMany(rolesData);
    log.success(`Seeded ${roles.length} roles`);
    
    console.log(`${colors.blue}  Role Breakdown:${colors.reset}`);
    roles.forEach(role => {
      console.log(`    ├─ ${role.name} (Level ${role.level}): ${role.permissions.length} permissions`);
    });
  } catch (error) {
    log.error(`Error seeding roles: ${error.message}`);
    throw error;
  }
}

async function seedUsers() {
  try {
    log.info('Clearing existing users');
    await User.deleteMany({});
    
    // Generate nonces for all users
    const usersWithNonces = sampleUsers.map(user => ({
      ...user,
      authentication: {
        nonce: crypto.randomBytes(16).toString('hex'),
        lastLogin: new Date()
      }
    }));
    
    const users = await User.insertMany(usersWithNonces);
    log.success(`Seeded ${users.length} sample users`);
    
    console.log(`${colors.blue}  Sample Users:${colors.reset}`);
    users.forEach(user => {
      console.log(`    ├─ ${user.email} (${user.roles.join(', ')})`);
      console.log(`    │  └─ Wallet: ${user.walletAddress}`);
    });
    
    return users;
  } catch (error) {
    log.error(`Error seeding users: ${error.message}`);
    throw error;
  }
}

async function seedAuditLogs(users) {
  try {
    log.info('Clearing existing audit logs');
    await AuditLog.deleteMany({});
    
    const auditLogs = [
      {
        userId: users[0]._id,
        action: 'system.initialize',
        resource: 'system',
        status: 'success',
        ipAddress: '127.0.0.1',
        userAgent: 'FarmChain/Seeding Script'
      },
      {
        userId: users[2]._id,
        action: 'product.create',
        resource: 'product',
        resourceId: 'PROD001',
        status: 'success',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0'
      },
      {
        userId: users[3]._id,
        action: 'order.create',
        resource: 'order',
        resourceId: 'ORD001',
        status: 'success',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0'
      }
    ];
    
    await AuditLog.insertMany(auditLogs);
    log.success(`Seeded ${auditLogs.length} audit logs`);
  } catch (error) {
    log.error(`Error seeding audit logs: ${error.message}`);
    throw error;
  }
}

async function seedRateLimitTrackers(users) {
  try {
    log.info('Clearing existing rate limit trackers');
    await RateLimitTracker.deleteMany({});
    
    const trackers = [];
    for (const user of users) {
      const userRole = user.roles[0];
      trackers.push({
        userId: user.walletAddress,
        role: userRole,
        requestCount: 0,
        windowStart: new Date(),
        limits: {
          perMinute: userRole === 'SUPER_ADMIN' ? 1000 : userRole === 'ADMIN' ? 500 : 100,
          perHour: userRole === 'SUPER_ADMIN' ? 50000 : userRole === 'ADMIN' ? 20000 : 5000,
          perDay: userRole === 'SUPER_ADMIN' ? 1000000 : userRole === 'ADMIN' ? 500000 : 100000
        }
      });
    }
    
    await RateLimitTracker.insertMany(trackers);
    log.success(`Seeded ${trackers.length} rate limit trackers`);
  } catch (error) {
    log.error(`Error seeding rate limit trackers: ${error.message}`);
    throw error;
  }
}

async function generateSummary() {
  const stats = {
    permissions: await Permission.countDocuments(),
    roles: await Role.countDocuments(),
    users: await User.countDocuments(),
    auditLogs: await AuditLog.countDocuments(),
    rateLimitTrackers: await RateLimitTracker.countDocuments()
  };
  
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║           Database Seeding Complete!          ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}`);
  
  console.log(`\n${colors.blue}📊 Final Statistics:${colors.reset}`);
  console.log(`  ├─ Permissions: ${stats.permissions}`);
  console.log(`  ├─ Roles: ${stats.roles}`);
  console.log(`  ├─ Users: ${stats.users}`);
  console.log(`  ├─ Audit Logs: ${stats.auditLogs}`);
  console.log(`  └─ Rate Limit Trackers: ${stats.rateLimitTrackers}`);
  
  console.log(`\n${colors.green}✨ Database ready for use!${colors.reset}\n`);
}

async function main() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   🌾 FarmChain Database Seeding Script 🌾     ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain');
    log.success('Connected to MongoDB');
    
    log.section('Seeding Permissions');
    await seedPermissions();
    
    log.section('Seeding Roles');
    await seedRoles();
    
    log.section('Seeding Users');
    const users = await seedUsers();
    
    log.section('Seeding Audit Logs');
    await seedAuditLogs(users);
    
    log.section('Seeding Rate Limit Trackers');
    await seedRateLimitTrackers(users);
    
    await generateSummary();
    
    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}❌ Seeding failed: ${error.message}${colors.reset}\n`);
    console.error(error);
    process.exit(1);
  }
}

main();
