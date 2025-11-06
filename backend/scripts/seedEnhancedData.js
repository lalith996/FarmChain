#!/usr/bin/env node

/**
 * Enhanced Synthetic Data Generator for FarmChain
 *
 * Generates realistic, consistent synthetic data that matches across
 * MongoDB database and frontend UI displays.
 *
 * Features:
 * - Realistic user profiles with Web3 wallets
 * - Supply chain transactions with blockchain hashes
 * - Agricultural product data
 * - Supplier and farmer profiles
 * - Consistent counts across database and UI
 *
 * Run: node scripts/seedEnhancedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');
const bcrypt = require('bcryptjs');
const { ethers } = require('ethers');

// Import models
const User = require('../src/models/User.model');
const Product = require('../src/models/Product.model');
const Order = require('../src/models/Order.model');
const Payment = require('../src/models/Payment.model');
const Review = require('../src/models/Review.model');
const Role = require('../src/models/Role.model');

// Configuration
const CONFIG = {
  users: {
    superAdmin: 1,
    admin: 2,
    farmers: 25,
    distributors: 15,
    retailers: 20,
    consumers: 50
  },
  products: {
    perFarmer: 8
  },
  orders: {
    perConsumer: 5
  },
  reviews: {
    percentage: 0.7 // 70% of orders get reviews
  }
};

// Generate deterministic wallet addresses (for testing only)
const generateWallet = (seed) => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
};

// Realistic data arrays
const FIRST_NAMES = ['John', 'Emma', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Mary', 'James', 'Patricia', 'Richard', 'Linda', 'Thomas', 'Barbara', 'Charles', 'Elizabeth', 'Daniel', 'Susan', 'Matthew', 'Margaret', 'Rajesh', 'Priya', 'Wei', 'Mei', 'Mohammed', 'Fatima', 'Carlos', 'Maria'];

const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Kumar', 'Singh', 'Chen', 'Wang', 'Ahmed', 'Ali', 'Santos', 'Silva'];

const FARM_NAMES = ['Green Valley Farm', 'Sunny Acres', 'Harvest Moon Ranch', 'Golden Fields', 'River Bend Farm', 'Mountain View Organic', 'Prairie Wind Farm', 'Sunset Orchards', 'Rolling Hills Ranch', 'Fresh Start Farm', 'Heritage Homestead', 'Blue Sky Organic', 'Evergreen Estates', 'Maple Grove Farm', 'Wildflower Meadows'];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Nagpur', 'Indore', 'Coimbatore', 'Kochi'];

const STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Punjab', 'Haryana', 'Uttar Pradesh', 'West Bengal', 'Kerala'];

const PRODUCTS = [
  { name: 'Organic Tomatoes', category: 'Vegetables', unit: 'kg', basePrice: 60 },
  { name: 'Fresh Strawberries', category: 'Fruits', unit: 'kg', basePrice: 250 },
  { name: 'Basmati Rice', category: 'Grains', unit: 'kg', basePrice: 120 },
  { name: 'Green Bell Peppers', category: 'Vegetables', unit: 'kg', basePrice: 80 },
  { name: 'Organic Apples', category: 'Fruits', unit: 'kg', basePrice: 180 },
  { name: 'Yellow Onions', category: 'Vegetables', unit: 'kg', basePrice: 40 },
  { name: 'Fresh Spinach', category: 'Vegetables', unit: 'kg', basePrice: 45 },
  { name: 'Mango (Alphonso)', category: 'Fruits', unit: 'kg', basePrice: 300 },
  { name: 'Wheat Flour', category: 'Grains', unit: 'kg', basePrice: 45 },
  { name: 'Organic Carrots', category: 'Vegetables', unit: 'kg', basePrice: 55 },
  { name: 'Fresh Cucumbers', category: 'Vegetables', unit: 'kg', basePrice: 35 },
  { name: 'Organic Bananas', category: 'Fruits', unit: 'dozen', basePrice: 60 },
  { name: 'Red Chili Peppers', category: 'Vegetables', unit: 'kg', basePrice: 200 },
  { name: 'Fresh Potatoes', category: 'Vegetables', unit: 'kg', basePrice: 30 },
  { name: 'Organic Grapes', category: 'Fruits', unit: 'kg', basePrice: 150 },
  { name: 'Turmeric Powder', category: 'Spices', unit: 'kg', basePrice: 250 },
  { name: 'Fresh Cauliflower', category: 'Vegetables', unit: 'kg', basePrice: 45 },
  { name: 'Organic Oranges', category: 'Fruits', unit: 'kg', basePrice: 100 },
  { name: 'Green Peas', category: 'Vegetables', unit: 'kg', basePrice: 70 },
  { name: 'Organic Papaya', category: 'Fruits', unit: 'kg', basePrice: 50 }
];

const CERTIFICATIONS = ['Organic India', 'USDA Organic', 'GlobalGAP', 'Fair Trade', 'Rainforest Alliance', 'Non-GMO Project'];

// Utility functions
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = (arr) => arr[random(0, arr.length - 1)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateBlockchainHash = () => '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

const generatePhone = () => `+91${random(6000000000, 9999999999)}`;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('✅ Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  logger.info('🗑️  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Review.deleteMany({})
  ]);
  logger.info('✅ Database cleared');
};

const createUsers = async () => {
  logger.info('\n👥 Creating users...');
  const users = [];

  // Create Super Admin
  const superAdminWallet = generateWallet('superadmin');
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const superAdmin = new User({
    walletAddress: superAdminWallet.address,
    primaryRole: 'SUPER_ADMIN',
    roles: ['SUPER_ADMIN'],
    profile: {
      name: 'Super Admin',
      email: 'superadmin@farmchain.com',
      phone: generatePhone()
    },
    password: hashedPassword,
    verification: {
      isVerified: true,
      kycStatus: 'approved',
      verificationLevel: 3
    },
    status: {
      isActive: true,
      accountStatus: 'active'
    }
  });

  await superAdmin.save();
  users.push({ user: superAdmin, password: 'Admin@123', role: 'SUPER_ADMIN' });
  logger.info(`✅ Created Super Admin: ${superAdmin.walletAddress}`);

  // Create Admins
  for (let i = 0; i < CONFIG.users.admin; i++) {
    const wallet = generateWallet(`admin${i}`);
    const admin = new User({
      walletAddress: wallet.address,
      primaryRole: 'ADMIN',
      roles: ['ADMIN'],
      profile: {
        name: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
        email: `admin${i + 1}@farmchain.com`,
        phone: generatePhone()
      },
      password: hashedPassword,
      verification: {
        isVerified: true,
        kycStatus: 'approved',
        verificationLevel: 2
      },
      status: {
        isActive: true,
        accountStatus: 'active'
      }
    });
    await admin.save();
    users.push({ user: admin, password: 'Admin@123', role: 'ADMIN' });
  }
  logger.info(`✅ Created ${CONFIG.users.admin} Admins`);

  // Create Farmers
  for (let i = 0; i < CONFIG.users.farmers; i++) {
    const wallet = generateWallet(`farmer${i}`);
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const city = randomElement(CITIES);
    const state = randomElement(STATES);

    const farmer = new User({
      walletAddress: wallet.address,
      primaryRole: 'FARMER',
      roles: ['FARMER'],
      profile: {
        name: `${firstName} ${lastName}`,
        email: `farmer${i + 1}@example.com`,
        phone: generatePhone(),
        businessName: randomElement(FARM_NAMES),
        businessType: 'Farm',
        address: `${random(1, 999)} Farm Road, ${city}, ${state}`,
        city,
        state,
        country: 'India',
        postalCode: `${random(100000, 999999)}`
      },
      password: hashedPassword,
      verification: {
        isVerified: true,
        kycStatus: 'approved',
        verificationLevel: 2
      },
      farmerDetails: {
        farmSize: random(1, 50),
        farmingType: randomElement(['Organic', 'Traditional', 'Mixed']),
        certifications: [randomElement(CERTIFICATIONS)]
      },
      status: {
        isActive: true,
        accountStatus: 'active'
      },
      stats: {
        productsListed: 0,
        productsSold: 0,
        totalRevenue: 0
      }
    });
    await farmer.save();
    users.push({ user: farmer, password: 'Admin@123', role: 'FARMER' });
  }
  logger.info(`✅ Created ${CONFIG.users.farmers} Farmers`);

  // Create Distributors
  for (let i = 0; i < CONFIG.users.distributors; i++) {
    const wallet = generateWallet(`distributor${i}`);
    const city = randomElement(CITIES);
    const state = randomElement(STATES);

    const distributor = new User({
      walletAddress: wallet.address,
      primaryRole: 'DISTRIBUTOR',
      roles: ['DISTRIBUTOR'],
      profile: {
        name: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
        email: `distributor${i + 1}@example.com`,
        phone: generatePhone(),
        businessName: `${randomElement(['Prime', 'Star', 'Global', 'Metro', 'Swift'])} Distribution Co.`,
        businessType: 'Distribution',
        address: `${random(1, 999)} Industrial Estate, ${city}, ${state}`,
        city,
        state,
        country: 'India',
        postalCode: `${random(100000, 999999)}`
      },
      password: hashedPassword,
      verification: {
        isVerified: true,
        kycStatus: 'approved',
        verificationLevel: 2
      },
      status: {
        isActive: true,
        accountStatus: 'active'
      }
    });
    await distributor.save();
    users.push({ user: distributor, password: 'Admin@123', role: 'DISTRIBUTOR' });
  }
  logger.info(`✅ Created ${CONFIG.users.distributors} Distributors`);

  // Create Retailers
  for (let i = 0; i < CONFIG.users.retailers; i++) {
    const wallet = generateWallet(`retailer${i}`);
    const city = randomElement(CITIES);
    const state = randomElement(STATES);

    const retailer = new User({
      walletAddress: wallet.address,
      primaryRole: 'RETAILER',
      roles: ['RETAILER'],
      profile: {
        name: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
        email: `retailer${i + 1}@example.com`,
        phone: generatePhone(),
        businessName: `${randomElement(['Fresh', 'Green', 'Organic', 'Farm', 'Daily'])} ${randomElement(['Mart', 'Store', 'Market', 'Shop'])}`,
        businessType: 'Retail',
        address: `${random(1, 999)} Market Street, ${city}, ${state}`,
        city,
        state,
        country: 'India',
        postalCode: `${random(100000, 999999)}`
      },
      password: hashedPassword,
      verification: {
        isVerified: true,
        kycStatus: 'approved',
        verificationLevel: 1
      },
      status: {
        isActive: true,
        accountStatus: 'active'
      }
    });
    await retailer.save();
    users.push({ user: retailer, password: 'Admin@123', role: 'RETAILER' });
  }
  logger.info(`✅ Created ${CONFIG.users.retailers} Retailers`);

  // Create Consumers
  for (let i = 0; i < CONFIG.users.consumers; i++) {
    const wallet = generateWallet(`consumer${i}`);
    const city = randomElement(CITIES);
    const state = randomElement(STATES);

    const consumer = new User({
      walletAddress: wallet.address,
      primaryRole: 'CONSUMER',
      roles: ['CONSUMER'],
      profile: {
        name: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
        email: `consumer${i + 1}@example.com`,
        phone: generatePhone(),
        address: `${random(1, 999)} Main Road, ${city}, ${state}`,
        city,
        state,
        country: 'India',
        postalCode: `${random(100000, 999999)}`
      },
      password: hashedPassword,
      verification: {
        isVerified: Math.random() > 0.3,
        kycStatus: Math.random() > 0.3 ? 'approved' : 'pending',
        verificationLevel: Math.random() > 0.5 ? 1 : 0
      },
      status: {
        isActive: true,
        accountStatus: 'active'
      }
    });
    await consumer.save();
    users.push({ user: consumer, password: 'Admin@123', role: 'CONSUMER' });
  }
  logger.info(`✅ Created ${CONFIG.users.consumers} Consumers`);

  return users;
};

const createProducts = async (users) => {
  logger.info('\n📦 Creating products...');
  const products = [];
  const farmers = users.filter(u => u.role === 'FARMER').map(u => u.user);

  for (const farmer of farmers) {
    const numProducts = random(CONFIG.products.perFarmer - 2, CONFIG.products.perFarmer + 2);

    for (let i = 0; i < numProducts; i++) {
      const productTemplate = randomElement(PRODUCTS);
      const quantity = random(50, 500);
      const priceVariation = random(-20, 30) / 100;
      const currentPrice = Math.round(productTemplate.basePrice * (1 + priceVariation));

      const product = new Product({
        farmer: farmer._id,
        isActive: Math.random() > 0.1, // 90% active
        basicInfo: {
          name: productTemplate.name,
          description: `Premium quality ${productTemplate.name.toLowerCase()} directly from our farm. Grown using ${farmer.farmerDetails.farmingType.toLowerCase()} farming methods.`,
          category: productTemplate.category,
          images: [
            `https://images.unsplash.com/photo-${random(1500000000000, 1700000000000)}-${random(1000000, 9999999)}?w=800&q=80`
          ],
          certifications: farmer.farmerDetails.certifications
        },
        farmDetails: {
          location: {
            type: 'Point',
            coordinates: [random(6800, 9700) / 100, random(700, 3500) / 100] // India coordinates
          },
          sowingDate: randomDate(new Date(2024, 0, 1), new Date(2024, 6, 1)),
          expectedHarvestDate: randomDate(new Date(2024, 8, 1), new Date(2025, 2, 1)),
          harvestDate: Math.random() > 0.5 ? randomDate(new Date(2024, 8, 1), new Date()) : null,
          farmingMethod: farmer.farmerDetails.farmingType,
          pesticidesUsed: farmer.farmerDetails.farmingType === 'Organic' ? 'None' : 'Minimal'
        },
        quantity: {
          available: quantity,
          unit: productTemplate.unit,
          minimumOrder: random(1, 5)
        },
        pricing: {
          basePrice: productTemplate.basePrice,
          currentPrice: currentPrice,
          currency: 'INR',
          priceHistory: [{
            price: currentPrice,
            date: new Date(),
            reason: 'Initial listing'
          }]
        },
        quality: {
          grade: randomElement(['A+', 'A', 'B+']),
          aiQualityScore: random(75, 99) / 100
        },
        supplyChain: {
          currentOwner: farmer._id,
          status: 'harvested',
          history: [{
            action: 'Product registered',
            actor: farmer._id,
            timestamp: new Date(),
            location: farmer.profile.city
          }]
        },
        blockchain: {
          isRegistered: Math.random() > 0.2,
          contractAddress: process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS || '0x' + '0'.repeat(40),
          tokenId: random(1000, 999999),
          registrationTxHash: generateBlockchainHash()
        },
        analytics: {
          views: random(10, 500),
          orders: random(0, 50)
        }
      });

      await product.save();
      products.push(product);

      // Update farmer stats
      farmer.stats.productsListed += 1;
      await farmer.save();
    }
  }

  logger.info(`✅ Created ${products.length} Products`);
  return products;
};

const createOrders = async (users, products) => {
  logger.info('\n📋 Creating orders...');
  const orders = [];
  const consumers = users.filter(u => u.role === 'CONSUMER').map(u => u.user);
  const retailers = users.filter(u => u.role === 'RETAILER').map(u => u.user);
  const buyers = [...consumers, ...retailers];

  for (const buyer of buyers) {
    const numOrders = random(
      Math.floor(CONFIG.orders.perConsumer * 0.5),
      Math.ceil(CONFIG.orders.perConsumer * 1.5)
    );

    for (let i = 0; i < numOrders; i++) {
      const product = randomElement(products);
      const quantity = random(product.quantity.minimumOrder, Math.min(20, product.quantity.available));
      const pricePerUnit = product.pricing.currentPrice;
      const totalAmount = quantity * pricePerUnit;
      const platformFee = totalAmount * 0.02;

      const statusOptions = ['pending', 'confirmed', 'processing', 'in_transit', 'delivered', 'completed'];
      const status = randomElement(statusOptions);
      const createdDate = randomDate(new Date(2024, 6, 1), new Date());

      const order = new Order({
        buyer: buyer._id,
        seller: product.farmer,
        product: product._id,
        productSnapshot: {
          name: product.basicInfo.name,
          images: product.basicInfo.images,
          price: pricePerUnit
        },
        orderDetails: {
          quantity,
          pricePerUnit,
          totalAmount,
          platformFee,
          netAmount: totalAmount + platformFee,
          currency: 'INR'
        },
        delivery: {
          address: buyer.profile.address,
          city: buyer.profile.city,
          state: buyer.profile.state,
          country: buyer.profile.country,
          postalCode: buyer.profile.postalCode,
          phone: buyer.profile.phone,
          expectedDeliveryDate: new Date(createdDate.getTime() + (7 * 24 * 60 * 60 * 1000)),
          trackingId: `TRK${Date.now()}${random(1000, 9999)}`
        },
        status,
        statusHistory: [{
          status: 'pending',
          timestamp: createdDate,
          note: 'Order placed'
        }],
        payment: {
          method: randomElement(['crypto', 'upi', 'bank_transfer']),
          status: ['delivered', 'completed'].includes(status) ? 'completed' : status === 'pending' ? 'pending' : 'processing',
          transactionHash: generateBlockchainHash()
        },
        blockchain: {
          isRegistered: Math.random() > 0.3,
          orderTxHash: generateBlockchainHash()
        },
        ratings: status === 'completed' ? {
          buyerRating: random(3, 5),
          sellerRating: random(3, 5)
        } : undefined,
        createdAt: createdDate
      });

      await order.save();
      orders.push(order);

      // Update product analytics
      product.analytics.orders += 1;
      await product.save();
    }
  }

  logger.info(`✅ Created ${orders.length} Orders`);
  return orders;
};

const createReviews = async (orders) => {
  logger.info('\n⭐ Creating reviews...');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const reviewCount = Math.floor(completedOrders.length * CONFIG.reviews.percentage);
  const reviews = [];

  for (let i = 0; i < reviewCount; i++) {
    const order = completedOrders[i];
    const rating = random(3, 5);

    const reviewTexts = {
      5: ['Excellent product!', 'Very fresh and high quality', 'Highly recommend', 'Best purchase ever', 'Will order again'],
      4: ['Good quality', 'Fresh product', 'Satisfied with purchase', 'Nice product', 'Good value for money'],
      3: ['Average product', 'Okay quality', 'Could be better', 'Decent', 'Fair product']
    };

    const review = new Review({
      product: order.product,
      seller: order.seller,
      reviewer: order.buyer,
      order: order._id,
      rating,
      title: randomElement(['Great!', 'Good', 'Satisfied', 'Happy', 'Nice']),
      comment: randomElement(reviewTexts[rating]),
      isVerifiedPurchase: true,
      helpful: {
        count: random(0, 20)
      }
    });

    await review.save();
    reviews.push(review);
  }

  logger.info(`✅ Created ${reviews.length} Reviews`);
  return reviews;
};

const generateStatistics = async (users, products, orders) => {
  logger.info('\n📊 Generating Statistics Report...\n');

  const stats = {
    users: {
      total: users.length,
      superAdmin: users.filter(u => u.role === 'SUPER_ADMIN').length,
      admin: users.filter(u => u.role === 'ADMIN').length,
      farmers: users.filter(u => u.role === 'FARMER').length,
      distributors: users.filter(u => u.role === 'DISTRIBUTOR').length,
      retailers: users.filter(u => u.role === 'RETAILER').length,
      consumers: users.filter(u => u.role === 'CONSUMER').length
    },
    products: {
      total: products.length,
      active: products.filter(p => p.isActive).length,
      categories: [...new Set(products.map(p => p.basicInfo.category))].length,
      blockchainRegistered: products.filter(p => p.blockchain.isRegistered).length
    },
    orders: {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      inTransit: orders.filter(o => o.status === 'in_transit').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      completed: orders.filter(o => o.status === 'completed').length,
      totalRevenue: orders.reduce((sum, o) => sum + o.orderDetails.totalAmount, 0)
    }
  };

  logger.info('═══════════════════════════════════════════════');
  logger.info('            FARMCHAIN DATA STATISTICS          ');
  logger.info('═══════════════════════════════════════════════');
  logger.info('\n👥 USERS:');
  logger.info(`   Total Users:        ${stats.users.total}`);
  logger.info(`   Super Admins:       ${stats.users.superAdmin}`);
  logger.info(`   Admins:             ${stats.users.admin}`);
  logger.info(`   Farmers:            ${stats.users.farmers}`);
  logger.info(`   Distributors:       ${stats.users.distributors}`);
  logger.info(`   Retailers:          ${stats.users.retailers}`);
  logger.info(`   Consumers:          ${stats.users.consumers}`);

  logger.info('\n📦 PRODUCTS:');
  logger.info(`   Total Products:     ${stats.products.total}`);
  logger.info(`   Active Products:    ${stats.products.active}`);
  logger.info(`   Categories:         ${stats.products.categories}`);
  logger.info(`   On Blockchain:      ${stats.products.blockchainRegistered}`);

  logger.info('\n📋 ORDERS:');
  logger.info(`   Total Orders:       ${stats.orders.total}`);
  logger.info(`   Pending:            ${stats.orders.pending}`);
  logger.info(`   Confirmed:          ${stats.orders.confirmed}`);
  logger.info(`   Processing:         ${stats.orders.processing}`);
  logger.info(`   In Transit:         ${stats.orders.inTransit}`);
  logger.info(`   Delivered:          ${stats.orders.delivered}`);
  logger.info(`   Completed:          ${stats.orders.completed}`);
  logger.info(`   Total Revenue:      ₹${stats.orders.totalRevenue.toLocaleString()}`);

  logger.info('\n═══════════════════════════════════════════════\n');

  // Save credentials
  logger.info('🔐 DEFAULT LOGIN CREDENTIALS:');
  logger.info('   Super Admin: superadmin@farmchain.com / Admin@123');
  logger.info('   All Users: Use password "Admin@123"');
  logger.info('\n   Sample Farmer: farmer1@example.com');
  logger.info('   Sample Consumer: consumer1@example.com\n');

  return stats;
};

const main = async () => {
  try {
    logger.info('🌾 Starting FarmChain Enhanced Data Seeding...\n');

    await connectDB();
    await clearDatabase();

    const users = await createUsers();
    const products = await createProducts(users);
    const orders = await createOrders(users, products);
    const reviews = await createReviews(orders);

    await generateStatistics(users, products, orders);

    logger.info('🎉 Data seeding completed successfully!');
    logger.info('✅ All counts are consistent across database and will match frontend displays\n');

    process.exit(0);
  } catch (error) {
    logger.error('Fatal error during seeding:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };
