#!/usr/bin/env node

/**
 * Add Database Indexes for Performance Optimization
 *
 * This script creates indexes on frequently queried fields
 * to improve query performance and reduce database load.
 *
 * Run: node scripts/addDatabaseIndexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

// Import models
const User = require('../src/models/User.model');
const Product = require('../src/models/Product.model');
const Order = require('../src/models/Order.model');
const Payment = require('../src/models/Payment.model');
const Review = require('../src/models/Review.model');
const AuditLog = require('../src/models/AuditLog.model');

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

const addIndexes = async () => {
  try {
    logger.info('📊 Adding database indexes for performance optimization...\n');

    // ==================== USER MODEL INDEXES ====================
    logger.info('👤 Adding User indexes...');

    // Unique indexes
    await User.collection.createIndex({ walletAddress: 1 }, { unique: true, background: true });
    await User.collection.createIndex({ 'profile.email': 1 }, { unique: true, sparse: true, background: true });

    // Query optimization indexes
    await User.collection.createIndex({ primaryRole: 1, 'status.isActive': 1 }, { background: true });
    await User.collection.createIndex({ 'verification.kycStatus': 1 }, { background: true });
    await User.collection.createIndex({ 'verification.isVerified': 1 }, { background: true });
    await User.collection.createIndex({ createdAt: -1 }, { background: true });
    await User.collection.createIndex({ 'profile.name': 1 }, { background: true });

    // Security indexes
    await User.collection.createIndex({ 'security.lastLoginIP': 1, 'security.lastLogin': -1 }, { background: true });
    await User.collection.createIndex({ 'security.accountLockedUntil': 1 }, { sparse: true, background: true });

    // Text search index for user profiles
    await User.collection.createIndex(
      {
        'profile.name': 'text',
        'profile.businessName': 'text',
        walletAddress: 'text'
      },
      {
        name: 'user_search_index',
        background: true,
        weights: {
          'profile.name': 10,
          'profile.businessName': 5,
          walletAddress: 3
        }
      }
    );

    logger.info('✅ User indexes created');

    // ==================== PRODUCT MODEL INDEXES ====================
    logger.info('📦 Adding Product indexes...');

    // Query optimization indexes
    await Product.collection.createIndex({ farmer: 1, isActive: 1 }, { background: true });
    await Product.collection.createIndex({ 'basicInfo.category': 1, 'pricing.currentPrice': 1 }, { background: true });
    await Product.collection.createIndex({ 'basicInfo.category': 1, isActive: 1 }, { background: true });
    await Product.collection.createIndex({ createdAt: -1 }, { background: true });
    await Product.collection.createIndex({ updatedAt: -1 }, { background: true });

    // Supply chain indexes
    await Product.collection.createIndex({ 'supplyChain.currentOwner': 1, 'supplyChain.status': 1 }, { background: true });
    await Product.collection.createIndex({ 'blockchain.tokenId': 1 }, { sparse: true, background: true });
    await Product.collection.createIndex({ 'blockchain.contractAddress': 1 }, { sparse: true, background: true });

    // Analytics indexes
    await Product.collection.createIndex({ 'analytics.views': -1 }, { background: true });
    await Product.collection.createIndex({ 'analytics.orders': -1 }, { background: true });

    // Pricing and availability
    await Product.collection.createIndex({ 'pricing.currentPrice': 1, 'quantity.available': -1 }, { background: true });
    await Product.collection.createIndex({ 'quantity.available': 1 }, { background: true });

    // Location-based queries (geospatial index)
    await Product.collection.createIndex({ 'farmDetails.location': '2dsphere' }, { background: true });

    // Text search index for products
    await Product.collection.createIndex(
      {
        'basicInfo.name': 'text',
        'basicInfo.description': 'text',
        'basicInfo.category': 'text'
      },
      {
        name: 'product_search_index',
        background: true,
        weights: {
          'basicInfo.name': 10,
          'basicInfo.category': 5,
          'basicInfo.description': 3
        }
      }
    );

    logger.info('✅ Product indexes created');

    // ==================== ORDER MODEL INDEXES ====================
    logger.info('📋 Adding Order indexes...');

    // Query optimization indexes
    await Order.collection.createIndex({ buyer: 1, createdAt: -1 }, { background: true });
    await Order.collection.createIndex({ seller: 1, createdAt: -1 }, { background: true });
    await Order.collection.createIndex({ product: 1 }, { background: true });
    await Order.collection.createIndex({ status: 1, createdAt: -1 }, { background: true });

    // Payment indexes
    await Order.collection.createIndex({ 'payment.paymentId': 1 }, { sparse: true, background: true });
    await Order.collection.createIndex({ 'payment.status': 1 }, { background: true });

    // Blockchain indexes
    await Order.collection.createIndex({ 'blockchain.orderTxHash': 1 }, { sparse: true, background: true });

    // Dispute handling
    await Order.collection.createIndex({ 'dispute.isDisputed': 1, 'dispute.resolvedAt': 1 }, { background: true });

    // Delivery tracking
    await Order.collection.createIndex({ 'delivery.trackingId': 1 }, { sparse: true, background: true });

    logger.info('✅ Order indexes created');

    // ==================== PAYMENT MODEL INDEXES ====================
    logger.info('💳 Adding Payment indexes...');

    await Payment.collection.createIndex({ order: 1 }, { background: true });
    await Payment.collection.createIndex({ payer: 1, createdAt: -1 }, { background: true });
    await Payment.collection.createIndex({ recipient: 1, createdAt: -1 }, { background: true });
    await Payment.collection.createIndex({ status: 1 }, { background: true });
    await Payment.collection.createIndex({ 'blockchain.transactionHash': 1 }, { sparse: true, unique: true, background: true });
    await Payment.collection.createIndex({ createdAt: -1 }, { background: true });

    logger.info('✅ Payment indexes created');

    // ==================== REVIEW MODEL INDEXES ====================
    logger.info('⭐ Adding Review indexes...');

    await Review.collection.createIndex({ product: 1, createdAt: -1 }, { background: true });
    await Review.collection.createIndex({ seller: 1, rating: -1 }, { background: true });
    await Review.collection.createIndex({ reviewer: 1, createdAt: -1 }, { background: true });
    await Review.collection.createIndex({ rating: -1 }, { background: true });
    await Review.collection.createIndex({ isVerifiedPurchase: 1 }, { background: true });

    logger.info('✅ Review indexes created');

    // ==================== AUDIT LOG MODEL INDEXES ====================
    logger.info('📝 Adding AuditLog indexes...');

    await AuditLog.collection.createIndex({ user: 1, timestamp: -1 }, { background: true });
    await AuditLog.collection.createIndex({ action: 1, timestamp: -1 }, { background: true });
    await AuditLog.collection.createIndex({ 'security.isSuspicious': 1 }, { sparse: true, background: true });
    await AuditLog.collection.createIndex({ timestamp: -1 }, { background: true });

    // TTL index - automatically delete logs older than 90 days
    await AuditLog.collection.createIndex(
      { timestamp: 1 },
      {
        expireAfterSeconds: 7776000, // 90 days
        background: true
      }
    );

    logger.info('✅ AuditLog indexes created');

    // ==================== LIST ALL INDEXES ====================
    logger.info('\n📋 Listing all indexes...\n');

    const collections = [
      { name: 'User', model: User },
      { name: 'Product', model: Product },
      { name: 'Order', model: Order },
      { name: 'Payment', model: Payment },
      { name: 'Review', model: Review },
      { name: 'AuditLog', model: AuditLog }
    ];

    for (const { name, model } of collections) {
      const indexes = await model.collection.getIndexes();
      logger.info(`${name} Collection Indexes:`);
      Object.entries(indexes).forEach(([indexName, indexDef]) => {
        logger.info(`  - ${indexName}: ${JSON.stringify(indexDef.key)}`);
      });
      logger.info('');
    }

    logger.info('✅ All indexes added successfully!');
    logger.info('\n📊 Performance Tips:');
    logger.info('  1. Monitor index usage with: db.collection.aggregate([{$indexStats:{}}])');
    logger.info('  2. Check slow queries in MongoDB logs');
    logger.info('  3. Use explain() to analyze query performance');
    logger.info('  4. Consider compound indexes for complex queries');
    logger.info('  5. Remove unused indexes to improve write performance\n');

  } catch (error) {
    logger.error('Error adding indexes:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await addIndexes();

    logger.info('🎉 Index creation completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { addIndexes };
