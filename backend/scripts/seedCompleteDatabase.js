/**
 * Complete Database Seeding Script with Synthetic Data
 * Seeds MongoDB with realistic data matching the 4 wallet addresses
 * Run: node backend/scripts/seedCompleteDatabase.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

// Import models
const Role = require('../src/models/Role.model');
const User = require('../src/models/User.model');
const Product = require('../src/models/Product.model');
const Order = require('../src/models/Order.model');

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

// Seed Roles
const seedRoles = async () => {
  log.section('Seeding Roles');
  
  const roles = [
    { name: 'SUPER_ADMIN', description: 'System Administrator with full access', level: 100 },
    { name: 'ADMIN', description: 'Administrator with management access', level: 90 },
    { name: 'FARMER', description: 'Farmer who can sell products', level: 50 },
    { name: 'DISTRIBUTOR', description: 'Distributor for supply chain', level: 50 },
    { name: 'CONSUMER', description: 'Consumer who can buy products', level: 10 }
  ];

  for (const roleData of roles) {
    const exists = await Role.findOne({ name: roleData.name });
    if (!exists) {
      await Role.create(roleData);
      log.success(`Created role: ${roleData.name}`);
    } else {
      log.info(`Role already exists: ${roleData.name}`);
    }
  }
};

// Seed Users (4 specific wallet addresses)
const seedUsers = async () => {
  log.section('Seeding Users');
  
  const adminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
  const farmerRole = await Role.findOne({ name: 'FARMER' });
  const distributorRole = await Role.findOne({ name: 'DISTRIBUTOR' });
  const consumerRole = await Role.findOne({ name: 'CONSUMER' });

  const users = [
    {
      walletAddress: '0xf0555abf16e154574bc3b4a9190f958ccdfce886',
      primaryRole: 'SUPER_ADMIN',
      roles: [adminRole._id],
      profile: {
        name: 'Admin User',
        email: 'admin@farmchain.com',
        phone: '+1234567890',
        bio: 'System Administrator',
        avatar: ''
      },
      verification: {
        isVerified: true,
        kycStatus: 'approved',
        kycDocuments: []
      },
      rating: {
        average: 5.0,
        count: 150,
        reviews: []
      },
      isActive: true,
      status: {
        isActive: true,
        isSuspended: false,
        suspensionReason: null
      }
    },
    {
      walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1',
      primaryRole: 'FARMER',
      roles: [farmerRole._id],
      profile: {
        name: 'John Farmer',
        email: 'farmer@farmchain.com',
        phone: '+1234567891',
        bio: 'Organic vegetable farmer with 10 years experience',
        avatar: ''
      },
      verification: {
        isVerified: true,
        kycStatus: 'approved',
        kycDocuments: []
      },
      rating: {
        average: 4.8,
        count: 86,
        reviews: []
      },
      isActive: true,
      status: {
        isActive: true,
        isSuspended: false,
        suspensionReason: null
      }
    },
    {
      walletAddress: '0xafe9c2a21650c800d3d8b6a638e61bb513046ea7',
      primaryRole: 'DISTRIBUTOR',
      roles: [distributorRole._id],
      profile: {
        name: 'Distribution Co',
        email: 'distributor@farmchain.com',
        phone: '+1234567892',
        bio: 'Regional distributor covering 5 states',
        avatar: ''
      },
      verification: {
        isVerified: true,
        kycStatus: 'approved',
        kycDocuments: []
      },
      rating: {
        average: 4.5,
        count: 42,
        reviews: []
      },
      isActive: true,
      status: {
        isActive: true,
        isSuspended: false,
        suspensionReason: null
      }
    },
    {
      walletAddress: '0xf75a95a93af19896379635e2bb2283c32bfbf935',
      primaryRole: 'CONSUMER',
      roles: [consumerRole._id],
      profile: {
        name: 'Jane Consumer',
        email: 'consumer@farmchain.com',
        phone: '+1234567893',
        bio: 'Health-conscious buyer, loves organic produce',
        avatar: ''
      },
      verification: {
        isVerified: true,
        kycStatus: 'approved',
        kycDocuments: []
      },
      rating: {
        average: 5.0,
        count: 28,
        reviews: []
      },
      isActive: true,
      status: {
        isActive: true,
        isSuspended: false,
        suspensionReason: null
      }
    }
  ];

  const createdUsers = {};
  
  for (const userData of users) {
    const exists = await User.findOne({ walletAddress: userData.walletAddress });
    if (!exists) {
      const user = await User.create(userData);
      createdUsers[userData.primaryRole] = user;
      log.success(`Created user: ${userData.profile.name} (${userData.primaryRole})`);
    } else {
      createdUsers[userData.primaryRole] = exists;
      log.info(`User already exists: ${userData.profile.name}`);
    }
  }

  return createdUsers;
};

// Seed Products
const seedProducts = async (users) => {
  log.section('Seeding Products');
  
  const farmer = users.FARMER;
  
  const products = [
    {
      name: 'Organic Tomatoes',
      description: 'Fresh organic tomatoes grown without pesticides',
      category: 'Vegetables',
      price: 4.99,
      unit: 'kg',
      quantity: 500,
      minimumOrder: 1,
      images: [],
      farmer: farmer._id,
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: 'Farm Valley, CA'
      },
      certifications: ['Organic', 'Non-GMO'],
      harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'active',
      qualityChecks: [],
      ratings: {
        average: 4.8,
        count: 45
      }
    },
    {
      name: 'Fresh Strawberries',
      description: 'Sweet and juicy strawberries, perfect for desserts',
      category: 'Fruits',
      price: 8.99,
      unit: 'kg',
      quantity: 200,
      minimumOrder: 0.5,
      images: [],
      farmer: farmer._id,
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: 'Farm Valley, CA'
      },
      certifications: ['Organic'],
      harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'active',
      qualityChecks: [],
      ratings: {
        average: 4.9,
        count: 32
      }
    },
    {
      name: 'Organic Carrots',
      description: 'Crunchy organic carrots, rich in vitamins',
      category: 'Vegetables',
      price: 3.49,
      unit: 'kg',
      quantity: 350,
      minimumOrder: 1,
      images: [],
      farmer: farmer._id,
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: 'Farm Valley, CA'
      },
      certifications: ['Organic', 'Non-GMO'],
      harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'active',
      qualityChecks: [],
      ratings: {
        average: 4.7,
        count: 28
      }
    },
    {
      name: 'Fresh Spinach',
      description: 'Leafy green spinach, perfect for salads',
      category: 'Vegetables',
      price: 5.99,
      unit: 'kg',
      quantity: 150,
      minimumOrder: 0.5,
      images: [],
      farmer: farmer._id,
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: 'Farm Valley, CA'
      },
      certifications: ['Organic'],
      harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active',
      qualityChecks: [],
      ratings: {
        average: 4.6,
        count: 19
      }
    },
    {
      name: 'Organic Apples',
      description: 'Crisp and sweet organic apples',
      category: 'Fruits',
      price: 6.99,
      unit: 'kg',
      quantity: 400,
      minimumOrder: 1,
      images: [],
      farmer: farmer._id,
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: 'Farm Valley, CA'
      },
      certifications: ['Organic', 'Non-GMO'],
      harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      qualityChecks: [],
      ratings: {
        average: 4.9,
        count: 53
      }
    }
  ];

  const createdProducts = [];
  
  for (const productData of products) {
    const exists = await Product.findOne({ name: productData.name, farmer: farmer._id });
    if (!exists) {
      const product = await Product.create(productData);
      createdProducts.push(product);
      log.success(`Created product: ${productData.name}`);
    } else {
      createdProducts.push(exists);
      log.info(`Product already exists: ${productData.name}`);
    }
  }

  return createdProducts;
};

// Seed Orders
const seedOrders = async (users, products) => {
  log.section('Seeding Orders');
  
  const farmer = users.FARMER;
  const consumer = users.CONSUMER;
  const distributor = users.DISTRIBUTOR;
  
  const orders = [
    {
      orderNumber: `ORD-${Date.now()}-001`,
      buyer: consumer._id,
      seller: farmer._id,
      items: [
        {
          product: products[0]._id,
          quantity: 5,
          price: products[0].price,
          total: 5 * products[0].price
        }
      ],
      totalAmount: 5 * products[0].price,
      shippingAddress: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      status: 'delivered',
      paymentStatus: 'completed',
      deliveryStatus: 'delivered',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    },
    {
      orderNumber: `ORD-${Date.now()}-002`,
      buyer: consumer._id,
      seller: farmer._id,
      items: [
        {
          product: products[1]._id,
          quantity: 2,
          price: products[1].price,
          total: 2 * products[1].price
        }
      ],
      totalAmount: 2 * products[1].price,
      shippingAddress: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      status: 'delivered',
      paymentStatus: 'completed',
      deliveryStatus: 'delivered',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      orderNumber: `ORD-${Date.now()}-003`,
      buyer: distributor._id,
      seller: farmer._id,
      items: [
        {
          product: products[0]._id,
          quantity: 50,
          price: products[0].price,
          total: 50 * products[0].price
        },
        {
          product: products[2]._id,
          quantity: 30,
          price: products[2].price,
          total: 30 * products[2].price
        }
      ],
      totalAmount: (50 * products[0].price) + (30 * products[2].price),
      shippingAddress: {
        street: '456 Distribution Ave',
        city: 'Oakland',
        state: 'CA',
        zipCode: '94601',
        country: 'USA'
      },
      status: 'shipped',
      paymentStatus: 'completed',
      deliveryStatus: 'in_transit',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      orderNumber: `ORD-${Date.now()}-004`,
      buyer: consumer._id,
      seller: farmer._id,
      items: [
        {
          product: products[4]._id,
          quantity: 3,
          price: products[4].price,
          total: 3 * products[4].price
        }
      ],
      totalAmount: 3 * products[4].price,
      shippingAddress: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      status: 'confirmed',
      paymentStatus: 'pending',
      deliveryStatus: 'preparing',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      orderNumber: `ORD-${Date.now()}-005`,
      buyer: consumer._id,
      seller: farmer._id,
      items: [
        {
          product: products[3]._id,
          quantity: 1,
          price: products[3].price,
          total: 1 * products[3].price
        }
      ],
      totalAmount: 1 * products[3].price,
      shippingAddress: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      status: 'pending',
      paymentStatus: 'pending',
      deliveryStatus: 'pending',
      createdAt: new Date()
    }
  ];

  let createdCount = 0;
  
  for (const orderData of orders) {
    const exists = await Order.findOne({ orderNumber: orderData.orderNumber });
    if (!exists) {
      await Order.create(orderData);
      createdCount++;
      log.success(`Created order: ${orderData.orderNumber}`);
    } else {
      log.info(`Order already exists: ${orderData.orderNumber}`);
    }
  }

  return createdCount;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    log.section('Starting Database Seeding');
    
    // Seed in order
    await seedRoles();
    const users = await seedUsers();
    const products = await seedProducts(users);
    const ordersCount = await seedOrders(users, products);
    
    // Get final counts
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    
    log.section('Seeding Complete');
    log.success(`Total Users: ${userCount}`);
    log.success(`Total Products: ${productCount}`);
    log.success(`Total Orders: ${orderCount}`);
    
    log.info('\nDatabase seeded successfully!');
    log.info('You can now start the backend server and see real data from MongoDB.\n');
    
    process.exit(0);
  } catch (error) {
    log.error(`Seeding failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
