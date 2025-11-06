#!/usr/bin/env node

/**
 * Database Seeding Script for FarmChain
 * Populates MongoDB with comprehensive synthetic data
 *
 * Usage: node scripts/seed.js [--clear] [--count=<number>]
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../src/models/User.model');
const Product = require('../src/models/Product.model');
const Order = require('../src/models/Order.model');
const Review = require('../src/models/Review.model');
const Wishlist = require('../src/models/Wishlist.model');

// Import seed data generators
const {
  generateUsers,
  generateProducts,
  generateOrders,
  generateReviews
} = require('./seedData');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldClear = args.includes('--clear');
const countArg = args.find(arg => arg.startsWith('--count='));
const multiplier = countArg ? parseInt(countArg.split('=')[1]) : 1;

// Data counts (can be adjusted with --count parameter)
const COUNTS = {
  FARMERS: 50 * multiplier,
  DISTRIBUTORS: 30 * multiplier,
  RETAILERS: 40 * multiplier,
  CONSUMERS: 100 * multiplier,
  ADMINS: 5,
  PRODUCTS_PER_FARMER: 3,
  ORDERS_PER_PRODUCT: 2,
  REVIEWS_PERCENTAGE: 0.6 // 60% of delivered orders get reviews
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain';
    await mongoose.connect(mongoURI);
    log('✓ Connected to MongoDB', 'green');
    return true;
  } catch (error) {
    log(`✗ MongoDB connection error: ${error.message}`, 'red');
    return false;
  }
}

async function clearDatabase() {
  log('\n🗑️  Clearing existing data...', 'yellow');

  try {
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Wishlist.deleteMany({})
    ]);

    log('✓ Database cleared successfully', 'green');
    return true;
  } catch (error) {
    log(`✗ Error clearing database: ${error.message}`, 'red');
    return false;
  }
}

async function seedUsers() {
  log('\n👥 Seeding users...', 'cyan');

  try {
    // Generate users for each role
    log('   Creating farmers...', 'blue');
    const farmers = generateUsers(COUNTS.FARMERS, 'FARMER');
    const insertedFarmers = await User.insertMany(farmers);
    log(`   ✓ Created ${insertedFarmers.length} farmers`, 'green');

    log('   Creating distributors...', 'blue');
    const distributors = generateUsers(COUNTS.DISTRIBUTORS, 'DISTRIBUTOR');
    const insertedDistributors = await User.insertMany(distributors);
    log(`   ✓ Created ${insertedDistributors.length} distributors`, 'green');

    log('   Creating retailers...', 'blue');
    const retailers = generateUsers(COUNTS.RETAILERS, 'RETAILER');
    const insertedRetailers = await User.insertMany(retailers);
    log(`   ✓ Created ${insertedRetailers.length} retailers`, 'green');

    log('   Creating consumers...', 'blue');
    const consumers = generateUsers(COUNTS.CONSUMERS, 'CONSUMER');
    const insertedConsumers = await User.insertMany(consumers);
    log(`   ✓ Created ${insertedConsumers.length} consumers`, 'green');

    log('   Creating admins...', 'blue');
    const admins = generateUsers(COUNTS.ADMINS, 'SUPER_ADMIN');
    const insertedAdmins = await User.insertMany(admins);
    log(`   ✓ Created ${insertedAdmins.length} admins`, 'green');

    const totalUsers = insertedFarmers.length + insertedDistributors.length +
                       insertedRetailers.length + insertedConsumers.length +
                       insertedAdmins.length;

    log(`\n✓ Total users created: ${totalUsers}`, 'green');

    return {
      farmers: insertedFarmers,
      distributors: insertedDistributors,
      retailers: insertedRetailers,
      consumers: insertedConsumers,
      admins: insertedAdmins,
      allSellers: [...insertedFarmers, ...insertedDistributors],
      allBuyers: [...insertedDistributors, ...insertedRetailers, ...insertedConsumers]
    };
  } catch (error) {
    log(`✗ Error seeding users: ${error.message}`, 'red');
    throw error;
  }
}

async function seedProducts(farmers) {
  log('\n📦 Seeding products...', 'cyan');

  try {
    const totalProducts = COUNTS.FARMERS * COUNTS.PRODUCTS_PER_FARMER;
    log(`   Creating ${totalProducts} products...`, 'blue');

    const products = generateProducts(farmers, totalProducts);
    const insertedProducts = await Product.insertMany(products);

    log(`✓ Created ${insertedProducts.length} products`, 'green');

    // Log product breakdown by category
    const breakdown = insertedProducts.reduce((acc, p) => {
      acc[p.basicInfo.category] = (acc[p.basicInfo.category] || 0) + 1;
      return acc;
    }, {});

    log('\n   Product breakdown by category:', 'blue');
    Object.entries(breakdown).forEach(([category, count]) => {
      log(`   - ${category}: ${count}`, 'blue');
    });

    return insertedProducts;
  } catch (error) {
    log(`✗ Error seeding products: ${error.message}`, 'red');
    throw error;
  }
}

async function seedOrders(products, buyers, sellers) {
  log('\n🛒 Seeding orders...', 'cyan');

  try {
    const totalOrders = products.length * COUNTS.ORDERS_PER_PRODUCT;
    log(`   Creating ${totalOrders} orders...`, 'blue');

    const orders = generateOrders(products, buyers, sellers, totalOrders);
    const insertedOrders = await Order.insertMany(orders);

    log(`✓ Created ${insertedOrders.length} orders`, 'green');

    // Log order breakdown by status
    const breakdown = insertedOrders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    log('\n   Order breakdown by status:', 'blue');
    Object.entries(breakdown).forEach(([status, count]) => {
      log(`   - ${status}: ${count}`, 'blue');
    });

    return insertedOrders;
  } catch (error) {
    log(`✗ Error seeding orders: ${error.message}`, 'red');
    throw error;
  }
}

async function seedReviews(orders, products) {
  log('\n⭐ Seeding reviews...', 'cyan');

  try {
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const reviewCount = Math.floor(deliveredOrders.length * COUNTS.REVIEWS_PERCENTAGE);

    log(`   Creating ${reviewCount} reviews...`, 'blue');

    const reviews = generateReviews(orders, products, reviewCount);
    const insertedReviews = await Review.insertMany(reviews);

    log(`✓ Created ${insertedReviews.length} reviews`, 'green');

    // Log review breakdown by rating
    const breakdown = insertedReviews.reduce((acc, r) => {
      const rating = r.ratings.overall;
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    log('\n   Review breakdown by rating:', 'blue');
    [5, 4, 3, 2, 1].forEach(rating => {
      const count = breakdown[rating] || 0;
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      log(`   ${stars} ${rating}: ${count}`, 'blue');
    });

    return insertedReviews;
  } catch (error) {
    log(`✗ Error seeding reviews: ${error.message}`, 'red');
    throw error;
  }
}

async function seedWishlists(consumers, products) {
  log('\n💝 Seeding wishlists...', 'cyan');

  try {
    const wishlists = [];

    // Create wishlists for random 30% of consumers
    const activeConsumers = consumers.filter(() => Math.random() < 0.3);

    for (const consumer of activeConsumers) {
      // Add random 3-10 products to wishlist
      const productCount = Math.floor(Math.random() * 8) + 3;
      const randomProducts = products
        .sort(() => 0.5 - Math.random())
        .slice(0, productCount);

      const items = randomProducts.map(product => ({
        product: product._id,
        addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        notes: Math.random() > 0.5 ? 'Want to order soon' : null
      }));

      wishlists.push({
        user: consumer._id,
        items: items,
        isPublic: Math.random() > 0.5
      });
    }

    const insertedWishlists = await Wishlist.insertMany(wishlists);
    log(`✓ Created ${insertedWishlists.length} wishlists`, 'green');

    return insertedWishlists;
  } catch (error) {
    log(`✗ Error seeding wishlists: ${error.message}`, 'red');
    throw error;
  }
}

async function printSummary(stats) {
  log('\n' + '='.repeat(60), 'cyan');
  log('                   SEEDING COMPLETE', 'bright');
  log('='.repeat(60), 'cyan');

  log('\n📊 Database Summary:', 'yellow');
  log(`   • Farmers:      ${stats.users.farmers.length}`, 'green');
  log(`   • Distributors: ${stats.users.distributors.length}`, 'green');
  log(`   • Retailers:    ${stats.users.retailers.length}`, 'green');
  log(`   • Consumers:    ${stats.users.consumers.length}`, 'green');
  log(`   • Admins:       ${stats.users.admins.length}`, 'green');
  log(`   ────────────────────`, 'cyan');
  log(`   • Total Users:  ${stats.totalUsers}`, 'bright');

  log(`\n   • Products:     ${stats.products.length}`, 'green');
  log(`   • Orders:       ${stats.orders.length}`, 'green');
  log(`   • Reviews:      ${stats.reviews.length}`, 'green');
  log(`   • Wishlists:    ${stats.wishlists.length}`, 'green');

  log('\n💾 Database URL:', 'yellow');
  log(`   ${process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain'}`, 'blue');

  log('\n✨ Sample Admin Login:', 'yellow');
  const adminWallet = stats.users.admins[0].walletAddress;
  log(`   Wallet: ${adminWallet}`, 'green');
  log(`   Role: SUPER_ADMIN`, 'green');

  log('\n✨ Sample Farmer Login:', 'yellow');
  const farmerWallet = stats.users.farmers[0].walletAddress;
  log(`   Wallet: ${farmerWallet}`, 'green');
  log(`   Role: FARMER`, 'green');

  log('\n' + '='.repeat(60), 'cyan');
  log('🎉 Ready to use! Start your backend server now.', 'green');
  log('='.repeat(60) + '\n', 'cyan');
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('        FarmChain Database Seeding Script', 'bright');
  log('='.repeat(60), 'cyan');

  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  // Clear database if requested
  if (shouldClear) {
    const cleared = await clearDatabase();
    if (!cleared) {
      process.exit(1);
    }
  }

  try {
    // Seed data
    const users = await seedUsers();
    const products = await seedProducts(users.farmers);
    const orders = await seedOrders(products, users.allBuyers, users.allSellers);
    const reviews = await seedReviews(orders, products);
    const wishlists = await seedWishlists(users.consumers, products);

    // Calculate stats
    const stats = {
      users: users,
      totalUsers: users.farmers.length + users.distributors.length +
                  users.retailers.length + users.consumers.length + users.admins.length,
      products: products,
      orders: orders,
      reviews: reviews,
      wishlists: wishlists
    };

    // Print summary
    await printSummary(stats);

    // Close database connection
    await mongoose.connection.close();
    log('Database connection closed.', 'green');

    process.exit(0);
  } catch (error) {
    log(`\n✗ Seeding failed: ${error.message}`, 'red');
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  main();
}

module.exports = { main };
