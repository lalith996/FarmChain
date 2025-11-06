/**
 * Database Seeding Script
 * Seeds MongoDB with roles, permissions, sample users, and test data
 * Run: node backend/scripts/seedDatabase.js
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

// Color codes for console output
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

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    log.success('Connected to MongoDB');
  } catch (error) {
    log.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Permission definitions (60+ permissions across 10 categories)
const permissionsData = [
  // 1. Product Management (8 permissions)
  { name: 'product.create', description: 'Create new products', category: 'product_management' },
  { name: 'product.read', description: 'View product details', category: 'product_management' },
  { name: 'product.update', description: 'Update product information', category: 'product_management' },
  { name: 'product.delete', description: 'Delete products', category: 'product_management' },
  { name: 'product.approve', description: 'Approve products for sale', category: 'product_management' },
  { name: 'product.reject', description: 'Reject product listings', category: 'product_management' },
  { name: 'product.transfer', description: 'Transfer product ownership', category: 'product_management' },
  { name: 'product.batch', description: 'Create product batches', category: 'product_management' },

  // 2. Order Management (7 permissions)
  { name: 'order.create', description: 'Create new orders', category: 'order_management' },
  { name: 'order.read', description: 'View order details', category: 'order_management' },
  { name: 'order.update', description: 'Update order status', category: 'order_management' },
  { name: 'order.cancel', description: 'Cancel orders', category: 'order_management' },
  { name: 'order.fulfill', description: 'Fulfill orders', category: 'order_management' },
  { name: 'order.track', description: 'Track order shipments', category: 'order_management' },
  { name: 'order.refund', description: 'Process order refunds', category: 'order_management' },

  // 3. Payment Management (6 permissions)
  { name: 'payment.create', description: 'Create payment escrows', category: 'payment_management' },
  { name: 'payment.release', description: 'Release escrowed payments', category: 'payment_management' },
  { name: 'payment.refund', description: 'Process payment refunds', category: 'payment_management' },
  { name: 'payment.dispute', description: 'Raise payment disputes', category: 'payment_management' },
  { name: 'payment.resolve', description: 'Resolve payment disputes', category: 'payment_management' },
  { name: 'payment.view', description: 'View payment history', category: 'payment_management' },

  // 4. Quality Control (5 permissions)
  { name: 'quality.inspect', description: 'Perform quality inspections', category: 'quality_control' },
  { name: 'quality.grade', description: 'Grade product quality', category: 'quality_control' },
  { name: 'quality.certify', description: 'Issue quality certificates', category: 'quality_control' },
  { name: 'quality.report', description: 'View quality reports', category: 'quality_control' },
  { name: 'quality.standards', description: 'Manage quality standards', category: 'quality_control' },

  // 5. User Management (8 permissions)
  { name: 'user.create', description: 'Create new users', category: 'user_management' },
  { name: 'user.read', description: 'View user profiles', category: 'user_management' },
  { name: 'user.update', description: 'Update user information', category: 'user_management' },
  { name: 'user.delete', description: 'Delete user accounts', category: 'user_management' },
  { name: 'user.suspend', description: 'Suspend user accounts', category: 'user_management' },
  { name: 'user.activate', description: 'Activate user accounts', category: 'user_management' },
  { name: 'user.verify', description: 'Verify user identity (KYC)', category: 'user_management' },
  { name: 'user.roles', description: 'Manage user roles', category: 'user_management' },

  // 6. Role & Permission Management (7 permissions)
  { name: 'role.create', description: 'Create new roles', category: 'role_management' },
  { name: 'role.read', description: 'View role details', category: 'role_management' },
  { name: 'role.update', description: 'Update role permissions', category: 'role_management' },
  { name: 'role.delete', description: 'Delete roles', category: 'role_management' },
  { name: 'role.assign', description: 'Assign roles to users', category: 'role_management' },
  { name: 'role.revoke', description: 'Revoke roles from users', category: 'role_management' },
  { name: 'permission.manage', description: 'Manage all permissions', category: 'role_management' },

  // 7. Analytics & Reporting (6 permissions)
  { name: 'analytics.view', description: 'View analytics dashboard', category: 'analytics' },
  { name: 'analytics.export', description: 'Export analytics data', category: 'analytics' },
  { name: 'report.generate', description: 'Generate reports', category: 'analytics' },
  { name: 'report.schedule', description: 'Schedule automated reports', category: 'analytics' },
  { name: 'metrics.view', description: 'View system metrics', category: 'analytics' },
  { name: 'logs.view', description: 'View audit logs', category: 'analytics' },

  // 8. System Administration (7 permissions)
  { name: 'system.config', description: 'Manage system configuration', category: 'system_admin' },
  { name: 'system.backup', description: 'Perform system backups', category: 'system_admin' },
  { name: 'system.restore', description: 'Restore from backups', category: 'system_admin' },
  { name: 'system.maintenance', description: 'Enable maintenance mode', category: 'system_admin' },
  { name: 'system.logs', description: 'Access system logs', category: 'system_admin' },
  { name: 'system.monitor', description: 'Monitor system health', category: 'system_admin' },
  { name: 'system.update', description: 'Update system settings', category: 'system_admin' },

  // 9. Blockchain Operations (5 permissions)
  { name: 'blockchain.read', description: 'View blockchain data', category: 'blockchain' },
  { name: 'blockchain.write', description: 'Write to blockchain', category: 'blockchain' },
  { name: 'blockchain.verify', description: 'Verify blockchain records', category: 'blockchain' },
  { name: 'contract.deploy', description: 'Deploy smart contracts', category: 'blockchain' },
  { name: 'contract.interact', description: 'Interact with smart contracts', category: 'blockchain' },

  // 10. Communication (4 permissions)
  { name: 'message.send', description: 'Send messages to users', category: 'communication' },
  { name: 'message.read', description: 'Read messages', category: 'communication' },
  { name: 'notification.send', description: 'Send notifications', category: 'communication' },
  { name: 'announcement.create', description: 'Create announcements', category: 'communication' }
];

// Role definitions with permission mappings
const rolesData = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full system access with all permissions',
    level: 10,
    permissions: permissionsData.map(p => p.name), // All permissions
    isSystemRole: true
  },
  {
    name: 'ADMIN',
    description: 'Administrative access for platform management',
    level: 8,
    permissions: [
      // Product Management
      'product.read', 'product.approve', 'product.reject',
      // Order Management
      'order.read', 'order.update', 'order.cancel', 'order.track',
      // Payment Management
      'payment.view', 'payment.resolve',
      // Quality Control
      'quality.inspect', 'quality.grade', 'quality.certify', 'quality.report',
      // User Management
      'user.read', 'user.update', 'user.suspend', 'user.activate', 'user.verify',
      // Role Management
      'role.read', 'role.assign', 'role.revoke',
      // Analytics
      'analytics.view', 'analytics.export', 'report.generate', 'metrics.view', 'logs.view',
      // Blockchain
      'blockchain.read', 'blockchain.verify',
      // Communication
      'message.send', 'message.read', 'notification.send', 'announcement.create'
    ],
    isSystemRole: true
  },
  {
    name: 'FARMER',
    description: 'Farmers who produce and sell agricultural products',
    level: 5,
    permissions: [
      // Product Management
      'product.create', 'product.read', 'product.update', 'product.transfer', 'product.batch',
      // Order Management
      'order.read', 'order.update', 'order.fulfill', 'order.track',
      // Payment Management
      'payment.view', 'payment.dispute',
      // Quality Control
      'quality.report',
      // User Management
      'user.read',
      // Analytics
      'analytics.view', 'report.generate',
      // Blockchain
      'blockchain.read', 'blockchain.write',
      // Communication
      'message.send', 'message.read'
    ],
    isSystemRole: true
  },
  {
    name: 'DISTRIBUTOR',
    description: 'Distributors who purchase and distribute products',
    level: 5,
    permissions: [
      // Product Management
      'product.read', 'product.transfer',
      // Order Management
      'order.create', 'order.read', 'order.update', 'order.cancel', 'order.track',
      // Payment Management
      'payment.create', 'payment.view', 'payment.dispute',
      // Quality Control
      'quality.inspect', 'quality.report',
      // User Management
      'user.read',
      // Analytics
      'analytics.view', 'report.generate',
      // Blockchain
      'blockchain.read', 'blockchain.write',
      // Communication
      'message.send', 'message.read'
    ],
    isSystemRole: true
  },
  {
    name: 'RETAILER',
    description: 'Retailers who sell products to end consumers',
    level: 4,
    permissions: [
      // Product Management
      'product.read',
      // Order Management
      'order.create', 'order.read', 'order.track', 'order.fulfill',
      // Payment Management
      'payment.create', 'payment.view', 'payment.dispute',
      // Quality Control
      'quality.report',
      // User Management
      'user.read',
      // Analytics
      'analytics.view',
      // Blockchain
      'blockchain.read',
      // Communication
      'message.send', 'message.read'
    ],
    isSystemRole: true
  },
  {
    name: 'CONSUMER',
    description: 'End consumers who purchase products',
    level: 2,
    permissions: [
      // Product Management
      'product.read',
      // Order Management
      'order.create', 'order.read', 'order.track',
      // Payment Management
      'payment.create', 'payment.view',
      // Quality Control
      'quality.report',
      // Blockchain
      'blockchain.read',
      // Communication
      'message.send', 'message.read'
    ],
    isSystemRole: true
  }
];

// Sample users for testing
  const sampleUsers = [
    {
      walletAddress: '0x1234567890123456789012345678901234567890',
      email: 'superadmin@farmchain.io',
      roles: ['SUPER_ADMIN'],
    username: 'SuperAdmin',
    isVerified: true,
    kycStatus: 'approved',
    kycDocuments: {
      idType: 'passport',
      idNumber: 'SA123456',
      issuedDate: new Date('2020-01-01'),
      expiryDate: new Date('2030-01-01'),
      ipfsHash: 'QmSuperAdminKYC123'
    }
  },
  {
    walletAddress: '0x2234567890123456789012345678901234567891',
    email: 'admin@farmchain.io',
    roles: ['ADMIN'],
    username: 'PlatformAdmin',
    isVerified: true,
    kycStatus: 'approved',
    kycDocuments: {
      idType: 'national_id',
      idNumber: 'AD789012',
      issuedDate: new Date('2020-03-15'),
      expiryDate: new Date('2030-03-15'),
      ipfsHash: 'QmAdminKYC456'
    }
  },
  {
    walletAddress: '0x3234567890123456789012345678901234567892',
    email: 'farmer1@farmchain.io',
    roles: ['FARMER'],
    username: 'JohnFarmer',
    isVerified: true,
    kycStatus: 'approved',
    profile: {
      firstName: 'John',
      lastName: 'Smith',
      farmName: 'Green Valley Farm',
      farmLocation: 'Iowa, USA',
      farmSize: '500 acres',
      crops: ['Corn', 'Soybeans', 'Wheat']
    },
    kycDocuments: {
      idType: 'drivers_license',
      idNumber: 'FM456789',
      issuedDate: new Date('2019-06-01'),
      expiryDate: new Date('2029-06-01'),
      ipfsHash: 'QmFarmer1KYC789'
    }
  },
  {
    walletAddress: '0x4234567890123456789012345678901234567893',
    email: 'farmer2@farmchain.io',
    roles: ['FARMER'],
    username: 'MariaCultivator',
    isVerified: true,
    kycStatus: 'approved',
    profile: {
      firstName: 'Maria',
      lastName: 'Garcia',
      farmName: 'Sunrise Organic Farm',
      farmLocation: 'California, USA',
      farmSize: '300 acres',
      crops: ['Tomatoes', 'Lettuce', 'Peppers', 'Strawberries']
    },
    kycDocuments: {
      idType: 'passport',
      idNumber: 'FM789012',
      issuedDate: new Date('2018-09-20'),
      expiryDate: new Date('2028-09-20'),
      ipfsHash: 'QmFarmer2KYC012'
    }
  },
  {
    walletAddress: '0x5234567890123456789012345678901234567894',
    email: 'distributor@farmchain.io',
    roles: ['DISTRIBUTOR'],
    username: 'AgriDistributors',
    isVerified: true,
    kycStatus: 'approved',
    profile: {
      firstName: 'Robert',
      lastName: 'Johnson',
      companyName: 'Midwest Agri Distributors',
      companyLocation: 'Chicago, IL',
      warehouseCapacity: '50000 sq ft'
    },
    kycDocuments: {
      idType: 'business_license',
      idNumber: 'DS123456',
      issuedDate: new Date('2017-01-10'),
      expiryDate: new Date('2027-01-10'),
      ipfsHash: 'QmDistributor1KYC345'
    }
  },
  {
    walletAddress: '0x6234567890123456789012345678901234567895',
    email: 'retailer@farmchain.io',
    roles: ['RETAILER'],
    username: 'FreshMartRetail',
    isVerified: true,
    kycStatus: 'approved',
    profile: {
      firstName: 'Sarah',
      lastName: 'Williams',
      storeName: 'FreshMart Grocery',
      storeLocation: 'New York, NY',
      storeSize: '5000 sq ft'
    },
    kycDocuments: {
      idType: 'business_license',
      idNumber: 'RT456789',
      issuedDate: new Date('2019-03-05'),
      expiryDate: new Date('2029-03-05'),
      ipfsHash: 'QmRetailer1KYC678'
    }
  },
  {
    walletAddress: '0x7234567890123456789012345678901234567896',
    email: 'consumer@farmchain.io',
    roles: ['CONSUMER'],
    username: 'AliceConsumer',
    isVerified: false,
    kycStatus: 'pending',
    profile: {
      firstName: 'Alice',
      lastName: 'Brown',
      preferredCategories: ['Organic', 'Local', 'Fresh Vegetables']
    }
  }
];

// Seed functions
async function seedPermissions() {
  log.section('Seeding Permissions');
  
  try {
    // Clear existing permissions
    await Permission.deleteMany({});
    log.info('Cleared existing permissions');

    // Insert new permissions
    const permissions = await Permission.insertMany(permissionsData);
    log.success(`Created ${permissions.length} permissions`);

    // Display permission breakdown
    const categories = {};
    permissions.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });

    console.log('\n  Permission Breakdown:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`    - ${category}: ${count} permissions`);
    });

    return permissions;
  } catch (error) {
    log.error(`Error seeding permissions: ${error.message}`);
    throw error;
  }
}

async function seedRoles() {
  log.section('Seeding Roles');
  
  try {
    // Clear existing roles
    await Role.deleteMany({});
    log.info('Cleared existing roles');

    // Insert new roles
    const roles = await Role.insertMany(rolesData);
    log.success(`Created ${roles.length} roles`);

    // Display role breakdown
    console.log('\n  Role Breakdown:');
    roles.forEach(role => {
      console.log(`    - ${role.name} (Level ${role.level}): ${role.permissions.length} permissions`);
    });

    return roles;
  } catch (error) {
    log.error(`Error seeding roles: ${error.message}`);
    throw error;
  }
}

async function seedUsers() {
  log.section('Seeding Users');
  
  try {
    // Clear existing users
    await UserRBAC.deleteMany({});
    log.info('Cleared existing users');

    // Create users with hashed passwords and nonces
    const users = [];
    for (const userData of sampleUsers) {
      const nonce = crypto.randomBytes(32).toString('hex');
      
      const user = new UserRBAC({
        ...userData,
        nonce,
        lastLogin: new Date(),
        loginCount: 0
      });

      await user.save();
      users.push(user);
      
      log.success(`Created user: ${user.username} (${user.role})`);
    }

    // Display user breakdown
    console.log('\n  User Breakdown:');
    const roleCount = {};
    users.forEach(u => {
      roleCount[u.role] = (roleCount[u.role] || 0) + 1;
    });
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`    - ${role}: ${count} user(s)`);
    });

    return users;
  } catch (error) {
    log.error(`Error seeding users: ${error.message}`);
    throw error;
  }
}

async function seedAuditLogs() {
  log.section('Seeding Audit Logs (Sample)');
  
  try {
    // Clear existing logs
    await AuditLog.deleteMany({});
    log.info('Cleared existing audit logs');

    const sampleLogs = [
      {
        userId: '0x1234567890123456789012345678901234567890',
        action: 'SYSTEM_INIT',
        resource: 'system',
        details: { message: 'Database seeded successfully' },
        ipAddress: '127.0.0.1',
        userAgent: 'Seed Script',
        status: 'success'
      },
      {
        userId: '0x3234567890123456789012345678901234567892',
        action: 'PRODUCT_CREATE',
        resource: 'product',
        resourceId: 'PROD001',
        details: { productName: 'Organic Tomatoes', quantity: 1000 },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        status: 'success'
      },
      {
        userId: '0x5234567890123456789012345678901234567894',
        action: 'ORDER_CREATE',
        resource: 'order',
        resourceId: 'ORD001',
        details: { orderTotal: 5000, products: 5 },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0',
        status: 'success'
      }
    ];

    const logs = await AuditLog.insertMany(sampleLogs);
    log.success(`Created ${logs.length} sample audit logs`);

    return logs;
  } catch (error) {
    log.error(`Error seeding audit logs: ${error.message}`);
    throw error;
  }
}

async function seedRateLimits() {
  log.section('Initializing Rate Limit Trackers');
  
  try {
    // Clear existing trackers
    await RateLimitTracker.deleteMany({});
    log.info('Cleared existing rate limit trackers');

    // Initialize trackers for each user
    const users = await User.find();
    const trackers = [];

    for (const user of users) {
      const userRole = user.roles[0]; // Get primary role
      const tracker = new RateLimitTracker({
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

      await tracker.save();
      trackers.push(tracker);
    }

    log.success(`Created ${trackers.length} rate limit trackers`);

    return trackers;
  } catch (error) {
    log.error(`Error seeding rate limits: ${error.message}`);
    throw error;
  }
}

// Generate summary report
async function generateSummary() {
  log.section('Database Seeding Summary');

  const stats = {
    permissions: await Permission.countDocuments(),
    roles: await Role.countDocuments(),
    users: await User.countDocuments(),
    auditLogs: await AuditLog.countDocuments(),
    rateLimitTrackers: await RateLimitTracker.countDocuments()
  };

  console.log('  📊 Final Statistics:');
  console.log(`    ├─ Permissions: ${stats.permissions}`);
  console.log(`    ├─ Roles: ${stats.roles}`);
  console.log(`    ├─ Users: ${stats.users}`);
  console.log(`    ├─ Audit Logs: ${stats.auditLogs}`);
  console.log(`    └─ Rate Limit Trackers: ${stats.rateLimitTrackers}`);

  console.log('\n  🎯 Test Users Created:');
  const users = await User.find().select('username email roles walletAddress');
  users.forEach(user => {
    console.log(`    ├─ ${user.username}`);
    console.log(`    │  ├─ Email: ${user.email}`);
    console.log(`    │  ├─ Role: ${user.roles.join(', ')}`);
    console.log(`    │  └─ Wallet: ${user.walletAddress.substring(0, 10)}...`);
  });

  console.log('\n  🔐 Login Credentials:');
  console.log('    Connect using wallet addresses listed above');
  console.log('    Use MetaMask or any Web3 wallet to sign authentication message\n');
}

// Main execution
async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   🌾 FarmChain Database Seeding Script 🌾   ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('\n');

  try {
    // Connect to database
    await connectDB();

    // Run seeding in order
    await seedPermissions();
    await seedRoles();
    await seedUsers();
    await seedAuditLogs();
    await seedRateLimits();

    // Generate summary
    await generateSummary();

    log.success('\n✨ Database seeding completed successfully!\n');
    
    process.exit(0);
  } catch (error) {
    log.error(`\n❌ Seeding failed: ${error.message}\n`);
    console.error(error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { seedPermissions, seedRoles, seedUsers, seedAuditLogs, seedRateLimits };
