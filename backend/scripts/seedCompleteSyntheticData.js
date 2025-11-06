#!/usr/bin/env node
/**
 * Complete Synthetic Data Seeding Script
 * Generates realistic data matching all frontend dashboard counts
 * Ensures MongoDB counts match exactly with frontend displays
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../src/models/User.model');
const Product = require('../src/models/Product.model');
const Order = require('../src/models/Order.model');
const Review = require('../src/models/Review.model');
const Wishlist = require('../src/models/Wishlist.model');
const ChatMessage = require('../src/models/ChatMessage.model');
const Subscription = require('../src/models/Subscription.model');
const Invoice = require('../src/models/Invoice.model');
const DeliveryUpdate = require('../src/models/DeliveryUpdate.model');
const BulkPricing = require('../src/models/BulkPricing.model');
const Comparison = require('../src/models/Comparison.model');
const SavedSearch = require('../src/models/SavedSearch.model');
const AuditLog = require('../src/models/AuditLog.model');

// Faker for realistic data generation
const { faker } = require('@faker-js/faker');

// Data Configuration - Matching Dashboard Counts
const DATA_CONFIG = {
  users: {
    SUPER_ADMIN: 1,
    ADMIN: 5,
    FARMER: 150,
    DISTRIBUTOR: 75,
    RETAILER: 50,
    CONSUMER: 220
  },
  products: 500,
  orders: {
    pending: 45,
    confirmed: 120,
    payment_completed: 80,
    shipped: 150,
    delivered: 305,
    cancelled: 50
  },
  reviews: 850,
  wishlists: 350,
  chatMessages: 2500,
  subscriptions: 180,
  invoices: 450,
  deliveryUpdates: 600,
  auditLogs: 1000
};

// Product Categories
const PRODUCT_CATEGORIES = {
  grains: ['Rice', 'Wheat', 'Barley', 'Maize', 'Oats', 'Millet'],
  vegetables: ['Tomato', 'Potato', 'Onion', 'Carrot', 'Cabbage', 'Spinach', 'Broccoli', 'Cauliflower'],
  fruits: ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Watermelon', 'Papaya', 'Guava'],
  dairy: ['Milk', 'Cheese', 'Butter', 'Yogurt', 'Paneer', 'Ghee'],
  pulses: ['Chickpeas', 'Lentils', 'Black Gram', 'Green Gram', 'Red Lentils', 'Kidney Beans'],
  spices: ['Turmeric', 'Chili', 'Cumin', 'Coriander', 'Cardamom', 'Black Pepper']
};

const UNITS = ['kg', 'quintal', 'ton', 'liter', 'dozen', 'piece'];
const FARMING_METHODS = ['organic', 'conventional', 'hydroponic', 'greenhouse'];
const INDIAN_STATES = ['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'West Bengal'];
const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];

// Helper Functions
function generateWalletAddress() {
  return '0x' + faker.string.hexadecimal({ length: 40, casing: 'lower' }).slice(2);
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateProductId() {
  return `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function generateOrderId() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Progress Logger
class ProgressLogger {
  constructor(total, name) {
    this.total = total;
    this.current = 0;
    this.name = name;
    this.startTime = Date.now();
  }

  increment() {
    this.current++;
    if (this.current % Math.max(1, Math.floor(this.total / 10)) === 0 || this.current === this.total) {
      const percentage = ((this.current / this.total) * 100).toFixed(1);
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.log(`   ├─ ${this.name}: ${this.current}/${this.total} (${percentage}%) - ${elapsed}s`);
    }
  }

  complete() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`   └─ ${this.name}: ✅ ${this.total} created in ${elapsed}s\n`);
  }
}

// Seeding Functions
async function seedUsers() {
  console.log('\n📊 Seeding Users...');
  const users = [];
  const usersByRole = {};

  // Super Admin
  const superAdmin = {
    walletAddress: generateWalletAddress(),
    roles: ['SUPER_ADMIN'],
    primaryRole: 'SUPER_ADMIN',
    profile: {
      name: 'Super Admin',
      email: 'superadmin@farmchain.com',
      phone: '+911234567890',
      avatar: faker.image.avatar()
    },
    verification: {
      isVerified: true,
      verifiedAt: new Date()
    },
    status: {
      isActive: true,
      isBlocked: false
    },
    roleHistory: [{
      role: 'SUPER_ADMIN',
      action: 'granted',
      timestamp: new Date(),
      reason: 'System initialization'
    }]
  };
  users.push(superAdmin);
  usersByRole.SUPER_ADMIN = [superAdmin];

  // Admins
  const admins = [];
  for (let i = 0; i < DATA_CONFIG.users.ADMIN; i++) {
    const admin = {
      walletAddress: generateWalletAddress(),
      roles: ['ADMIN'],
      primaryRole: 'ADMIN',
      profile: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `+91${faker.string.numeric(10)}`,
        avatar: faker.image.avatar()
      },
      verification: {
        isVerified: true,
        verifiedAt: randomDate(new Date(2024, 0, 1), new Date())
      },
      status: {
        isActive: true,
        isBlocked: false
      }
    };
    users.push(admin);
    admins.push(admin);
  }
  usersByRole.ADMIN = admins;

  // Farmers
  const farmers = [];
  const progress = new ProgressLogger(DATA_CONFIG.users.FARMER, 'Farmers');
  for (let i = 0; i < DATA_CONFIG.users.FARMER; i++) {
    const farmer = {
      walletAddress: generateWalletAddress(),
      roles: ['FARMER'],
      primaryRole: 'FARMER',
      profile: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `+91${faker.string.numeric(10)}`,
        avatar: faker.image.avatar(),
        bio: `Organic farmer specializing in ${faker.helpers.arrayElement(['vegetables', 'fruits', 'grains'])}`
      },
      businessInfo: {
        businessName: `${faker.person.lastName()} Farms`,
        businessType: 'FARMER',
        gstNumber: `29${faker.string.alphanumeric(13).toUpperCase()}`,
        farmSize: faker.number.int({ min: 5, max: 500 }),
        farmLocation: {
          address: faker.location.streetAddress(),
          city: faker.helpers.arrayElement(INDIAN_CITIES),
          state: faker.helpers.arrayElement(INDIAN_STATES),
          pincode: faker.string.numeric(6),
          country: 'India'
        }
      },
      verification: {
        isVerified: faker.datatype.boolean(0.8),
        verifiedAt: randomDate(new Date(2024, 0, 1), new Date()),
        kycStatus: faker.helpers.arrayElement(['pending', 'verified', 'rejected'])
      },
      status: {
        isActive: true,
        isBlocked: false
      }
    };
    users.push(farmer);
    farmers.push(farmer);
    progress.increment();
  }
  progress.complete();
  usersByRole.FARMER = farmers;

  // Distributors
  const distributors = [];
  for (let i = 0; i < DATA_CONFIG.users.DISTRIBUTOR; i++) {
    const distributor = {
      walletAddress: generateWalletAddress(),
      roles: ['DISTRIBUTOR'],
      primaryRole: 'DISTRIBUTOR',
      profile: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `+91${faker.string.numeric(10)}`,
        avatar: faker.image.avatar()
      },
      businessInfo: {
        businessName: `${faker.company.name()} Distributors`,
        businessType: 'DISTRIBUTOR',
        gstNumber: `29${faker.string.alphanumeric(13).toUpperCase()}`,
        warehouseCapacity: faker.number.int({ min: 1000, max: 100000 })
      },
      verification: {
        isVerified: faker.datatype.boolean(0.85),
        verifiedAt: randomDate(new Date(2024, 0, 1), new Date())
      },
      status: {
        isActive: true,
        isBlocked: false
      }
    };
    users.push(distributor);
    distributors.push(distributor);
  }
  usersByRole.DISTRIBUTOR = distributors;

  // Retailers
  const retailers = [];
  for (let i = 0; i < DATA_CONFIG.users.RETAILER; i++) {
    const retailer = {
      walletAddress: generateWalletAddress(),
      roles: ['RETAILER'],
      primaryRole: 'RETAILER',
      profile: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `+91${faker.string.numeric(10)}`,
        avatar: faker.image.avatar()
      },
      businessInfo: {
        businessName: `${faker.company.name()} Retail`,
        businessType: 'RETAILER',
        gstNumber: `29${faker.string.alphanumeric(13).toUpperCase()}`
      },
      verification: {
        isVerified: faker.datatype.boolean(0.75),
        verifiedAt: randomDate(new Date(2024, 0, 1), new Date())
      },
      status: {
        isActive: true,
        isBlocked: false
      }
    };
    users.push(retailer);
    retailers.push(retailer);
  }
  usersByRole.RETAILER = retailers;

  // Consumers
  const consumers = [];
  for (let i = 0; i < DATA_CONFIG.users.CONSUMER; i++) {
    const consumer = {
      walletAddress: generateWalletAddress(),
      roles: ['CONSUMER'],
      primaryRole: 'CONSUMER',
      profile: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `+91${faker.string.numeric(10)}`,
        avatar: faker.image.avatar()
      },
      verification: {
        isVerified: faker.datatype.boolean(0.6),
        verifiedAt: randomDate(new Date(2024, 0, 1), new Date())
      },
      status: {
        isActive: true,
        isBlocked: faker.datatype.boolean(0.05)
      }
    };
    users.push(consumer);
    consumers.push(consumer);
  }
  usersByRole.CONSUMER = consumers;

  // Insert all users
  const insertedUsers = await User.insertMany(users);
  console.log(`✅ Created ${insertedUsers.length} users`);
  
  return {
    all: insertedUsers,
    byRole: {
      SUPER_ADMIN: insertedUsers.filter(u => u.primaryRole === 'SUPER_ADMIN'),
      ADMIN: insertedUsers.filter(u => u.primaryRole === 'ADMIN'),
      FARMER: insertedUsers.filter(u => u.primaryRole === 'FARMER'),
      DISTRIBUTOR: insertedUsers.filter(u => u.primaryRole === 'DISTRIBUTOR'),
      RETAILER: insertedUsers.filter(u => u.primaryRole === 'RETAILER'),
      CONSUMER: insertedUsers.filter(u => u.primaryRole === 'CONSUMER')
    }
  };
}

async function seedProducts(farmers) {
  console.log('\n🌾 Seeding Products...');
  const products = [];
  const progress = new ProgressLogger(DATA_CONFIG.products, 'Products');

  for (let i = 0; i < DATA_CONFIG.products; i++) {
    const farmer = faker.helpers.arrayElement(farmers);
    const category = faker.helpers.arrayElement(Object.keys(PRODUCT_CATEGORIES));
    const items = PRODUCT_CATEGORIES[category];
    const item = faker.helpers.arrayElement(items);
    
    const basePrice = faker.number.int({ min: 20, max: 500 });
    const currentPrice = basePrice * faker.number.float({ min: 0.9, max: 1.2 });
    const available = faker.number.int({ min: 10, max: 1000 });
    const sold = faker.number.int({ min: 0, max: 500 });

    const product = {
      productId: generateProductId(),
      blockchainTxHash: `0x${faker.string.hexadecimal({ length: 64, casing: 'lower' }).slice(2)}`,
      farmer: farmer._id,
      farmerWallet: farmer.walletAddress,
      basicInfo: {
        name: item,
        category: category,
        subCategory: faker.helpers.arrayElement(['Premium', 'Standard', 'Economy']),
        variety: faker.helpers.arrayElement(['Hybrid', 'Local', 'Imported']),
        description: `Fresh ${item} directly from farm. ${faker.lorem.sentence()}`,
        images: [
          faker.image.urlLoremFlickr({ category: 'food' }),
          faker.image.urlLoremFlickr({ category: 'nature' })
        ],
        certifications: faker.helpers.arrayElements(['Organic', 'ISO', 'FSSAI', 'Fair Trade'], faker.number.int({ min: 0, max: 3 }))
      },
      farmDetails: {
        farmName: farmer.businessInfo?.businessName || `${farmer.profile.name}'s Farm`,
        farmLocation: {
          address: faker.location.streetAddress(),
          coordinates: {
            latitude: faker.location.latitude({ min: 8, max: 35 }),
            longitude: faker.location.longitude({ min: 68, max: 97 })
          }
        },
        sowingDate: randomDate(new Date(2024, 0, 1), new Date(2024, 6, 1)),
        harvestDate: randomDate(new Date(2024, 6, 1), new Date()),
        farmingMethod: faker.helpers.arrayElement(FARMING_METHODS),
        pesticidesUsed: [],
        fertilizersUsed: []
      },
      quantity: {
        available: available,
        sold: sold,
        unit: faker.helpers.arrayElement(UNITS)
      },
      pricing: {
        basePrice: basePrice,
        currentPrice: currentPrice,
        currency: 'INR',
        priceHistory: []
      },
      quality: {
        grade: faker.helpers.arrayElement(['A+', 'A', 'B+', 'B']),
        qualityScore: faker.number.int({ min: 70, max: 100 }),
        certifications: []
      },
      status: {
        isActive: faker.datatype.boolean(0.95),
        isApproved: faker.datatype.boolean(0.9),
        isBlocked: false,
        stock: available > 0 ? 'in_stock' : 'out_of_stock'
      },
      analytics: {
        views: faker.number.int({ min: 0, max: 1000 }),
        likes: faker.number.int({ min: 0, max: 200 }),
        shares: faker.number.int({ min: 0, max: 50 }),
        orders: sold,
        revenue: sold * currentPrice
      }
    };

    products.push(product);
    progress.increment();
  }
  progress.complete();

  const insertedProducts = await Product.insertMany(products);
  console.log(`✅ Created ${insertedProducts.length} products`);
  return insertedProducts;
}

async function seedOrders(products, users) {
  console.log('\n📦 Seeding Orders...');
  const orders = [];
  const buyers = [...users.byRole.CONSUMER, ...users.byRole.RETAILER, ...users.byRole.DISTRIBUTOR];
  
  const statuses = Object.keys(DATA_CONFIG.orders);
  const totalOrders = Object.values(DATA_CONFIG.orders).reduce((a, b) => a + b, 0);
  const progress = new ProgressLogger(totalOrders, 'Orders');

  for (const status of statuses) {
    const count = DATA_CONFIG.orders[status];
    
    for (let i = 0; i < count; i++) {
      const product = faker.helpers.arrayElement(products);
      const buyer = faker.helpers.arrayElement(buyers);
      const quantity = faker.number.int({ min: 1, max: 100 });
      const pricePerUnit = product.pricing.currentPrice;
      const totalAmount = quantity * pricePerUnit;

      const createdAt = randomDate(new Date(2024, 0, 1), new Date());
      let statusHistory = [{
        status: 'pending',
        timestamp: createdAt,
        note: 'Order created'
      }];

      if (status !== 'pending') {
        statusHistory.push({
          status: 'confirmed',
          timestamp: new Date(createdAt.getTime() + 3600000),
          note: 'Order confirmed by seller'
        });
      }

      if (['payment_completed', 'shipped', 'delivered'].includes(status)) {
        statusHistory.push({
          status: 'payment_completed',
          timestamp: new Date(createdAt.getTime() + 7200000),
          note: 'Payment received'
        });
      }

      if (['shipped', 'delivered'].includes(status)) {
        statusHistory.push({
          status: 'shipped',
          timestamp: new Date(createdAt.getTime() + 86400000),
          note: 'Order shipped'
        });
      }

      if (status === 'delivered') {
        statusHistory.push({
          status: 'delivered',
          timestamp: new Date(createdAt.getTime() + 259200000),
          note: 'Order delivered successfully'
        });
      }

      if (status === 'cancelled') {
        statusHistory = [{
          status: 'pending',
          timestamp: createdAt,
          note: 'Order created'
        }, {
          status: 'cancelled',
          timestamp: new Date(createdAt.getTime() + 1800000),
          note: 'Order cancelled by buyer'
        }];
      }

      const order = {
        orderId: generateOrderId(),
        buyer: buyer._id,
        buyerWallet: buyer.walletAddress,
        seller: product.farmer,
        sellerWallet: product.farmerWallet,
        product: product._id,
        productSnapshot: {
          productId: product.productId,
          name: product.basicInfo.name,
          category: product.basicInfo.category,
          images: product.basicInfo.images,
          grade: product.quality?.grade
        },
        orderDetails: {
          quantity: quantity,
          unit: product.quantity.unit,
          pricePerUnit: pricePerUnit,
          totalAmount: totalAmount,
          currency: 'INR'
        },
        delivery: {
          address: {
            street: faker.location.streetAddress(),
            city: faker.helpers.arrayElement(INDIAN_CITIES),
            state: faker.helpers.arrayElement(INDIAN_STATES),
            zipCode: faker.string.numeric(6),
            country: 'India'
          },
          expectedDate: new Date(createdAt.getTime() + 432000000),
          actualDate: status === 'delivered' ? new Date(createdAt.getTime() + 259200000) : null,
          trackingNumber: status !== 'pending' ? `TRK${faker.string.alphanumeric(10).toUpperCase()}` : null,
          carrier: status !== 'pending' ? faker.helpers.arrayElement(['DTDC', 'BlueDart', 'Delhivery', 'India Post']) : null
        },
        status: status,
        statusHistory: statusHistory,
        blockchain: {
          transactionHash: `0x${faker.string.hexadecimal({ length: 64, casing: 'lower' }).slice(2)}`,
          blockNumber: faker.number.int({ min: 1000000, max: 9999999 }),
          confirmed: true
        },
        payment: {
          method: faker.helpers.arrayElement(['crypto', 'upi', 'card']),
          status: ['payment_completed', 'shipped', 'delivered'].includes(status) ? 'completed' : status === 'cancelled' ? 'refunded' : 'pending',
          transactionId: faker.string.alphanumeric(16).toUpperCase(),
          paidAt: ['payment_completed', 'shipped', 'delivered'].includes(status) ? new Date(createdAt.getTime() + 7200000) : null
        },
        createdAt: createdAt,
        updatedAt: new Date()
      };

      orders.push(order);
      progress.increment();
    }
  }
  progress.complete();

  const insertedOrders = await Order.insertMany(orders);
  console.log(`✅ Created ${insertedOrders.length} orders`);
  return insertedOrders;
}

async function seedReviews(products, orders, users) {
  console.log('\n⭐ Seeding Reviews...');
  const reviews = [];
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const progress = new ProgressLogger(DATA_CONFIG.reviews, 'Reviews');

  for (let i = 0; i < DATA_CONFIG.reviews; i++) {
    const order = faker.helpers.arrayElement(deliveredOrders);
    
    const review = {
      order: order._id,
      product: order.product,
      reviewer: order.buyer,
      seller: order.seller,
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.helpers.arrayElement([
        'Excellent quality!',
        'Great product',
        'Satisfied with purchase',
        'Good value for money',
        'Fresh and organic',
        'Highly recommended'
      ]),
      comment: faker.lorem.paragraph(),
      images: faker.datatype.boolean(0.3) ? [faker.image.urlLoremFlickr({ category: 'food' })] : [],
      verified: true,
      helpful: faker.number.int({ min: 0, max: 50 }),
      createdAt: new Date(order.createdAt.getTime() + 432000000)
    };

    reviews.push(review);
    progress.increment();
  }
  progress.complete();

  const insertedReviews = await Review.insertMany(reviews);
  console.log(`✅ Created ${insertedReviews.length} reviews`);
  return insertedReviews;
}

async function seedWishlists(products, users) {
  console.log('\n❤️ Seeding Wishlists...');
  const wishlists = [];
  const consumers = [...users.byRole.CONSUMER, ...users.byRole.RETAILER];
  const progress = new ProgressLogger(DATA_CONFIG.wishlists, 'Wishlists');

  for (let i = 0; i < DATA_CONFIG.wishlists; i++) {
    const user = faker.helpers.arrayElement(consumers);
    const product = faker.helpers.arrayElement(products);

    const wishlist = {
      user: user._id,
      product: product._id,
      addedAt: randomDate(new Date(2024, 0, 1), new Date()),
      notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : ''
    };

    wishlists.push(wishlist);
    progress.increment();
  }
  progress.complete();

  const insertedWishlists = await Wishlist.insertMany(wishlists);
  console.log(`✅ Created ${insertedWishlists.length} wishlists`);
  return insertedWishlists;
}

async function seedChatMessages(users) {
  console.log('\n💬 Seeding Chat Messages...');
  const messages = [];
  const progress = new ProgressLogger(DATA_CONFIG.chatMessages, 'Messages');

  for (let i = 0; i < DATA_CONFIG.chatMessages; i++) {
    const sender = faker.helpers.arrayElement(users.all);
    const receiver = faker.helpers.arrayElement(users.all.filter(u => u._id !== sender._id));

    const message = {
      sender: sender._id,
      receiver: receiver._id,
      message: faker.lorem.sentence(),
      read: faker.datatype.boolean(0.7),
      readAt: faker.datatype.boolean(0.7) ? randomDate(new Date(2024, 0, 1), new Date()) : null,
      createdAt: randomDate(new Date(2024, 0, 1), new Date())
    };

    messages.push(message);
    progress.increment();
  }
  progress.complete();

  const insertedMessages = await ChatMessage.insertMany(messages);
  console.log(`✅ Created ${insertedMessages.length} messages`);
  return insertedMessages;
}

async function seedSubscriptions(users) {
  console.log('\n📧 Seeding Subscriptions...');
  const subscriptions = [];
  const subscribers = faker.helpers.arrayElements(users.all, DATA_CONFIG.subscriptions);
  const progress = new ProgressLogger(DATA_CONFIG.subscriptions, 'Subscriptions');

  for (const user of subscribers) {
    const subscription = {
      email: user.profile.email,
      user: user._id,
      plan: faker.helpers.arrayElement(['free', 'premium', 'enterprise']),
      status: faker.helpers.arrayElement(['active', 'inactive', 'cancelled']),
      subscribedAt: randomDate(new Date(2024, 0, 1), new Date()),
      preferences: {
        newsletter: faker.datatype.boolean(0.8),
        promotions: faker.datatype.boolean(0.6),
        updates: faker.datatype.boolean(0.9)
      }
    };

    subscriptions.push(subscription);
    progress.increment();
  }
  progress.complete();

  const insertedSubscriptions = await Subscription.insertMany(subscriptions);
  console.log(`✅ Created ${insertedSubscriptions.length} subscriptions`);
  return insertedSubscriptions;
}

async function seedInvoices(orders) {
  console.log('\n🧾 Seeding Invoices...');
  const invoices = [];
  const paidOrders = orders.filter(o => ['payment_completed', 'shipped', 'delivered'].includes(o.status));
  const selectedOrders = faker.helpers.arrayElements(paidOrders, Math.min(DATA_CONFIG.invoices, paidOrders.length));
  const progress = new ProgressLogger(selectedOrders.length, 'Invoices');

  for (const order of selectedOrders) {
    const invoice = {
      invoiceNumber: `INV-${faker.string.alphanumeric(10).toUpperCase()}`,
      order: order._id,
      buyer: order.buyer,
      seller: order.seller,
      amount: order.orderDetails.totalAmount,
      tax: order.orderDetails.totalAmount * 0.18,
      total: order.orderDetails.totalAmount * 1.18,
      status: 'paid',
      paidAt: order.payment.paidAt,
      dueDate: new Date(order.createdAt.getTime() + 604800000),
      createdAt: order.createdAt
    };

    invoices.push(invoice);
    progress.increment();
  }
  progress.complete();

  const insertedInvoices = await Invoice.insertMany(invoices);
  console.log(`✅ Created ${insertedInvoices.length} invoices`);
  return insertedInvoices;
}

async function seedDeliveryUpdates(orders) {
  console.log('\n🚚 Seeding Delivery Updates...');
  const updates = [];
  const shippedOrders = orders.filter(o => ['shipped', 'delivered'].includes(o.status));
  const progress = new ProgressLogger(DATA_CONFIG.deliveryUpdates, 'Updates');

  let count = 0;
  for (const order of shippedOrders) {
    if (count >= DATA_CONFIG.deliveryUpdates) break;

    const numUpdates = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numUpdates && count < DATA_CONFIG.deliveryUpdates; i++) {
      const update = {
        order: order._id,
        status: faker.helpers.arrayElement(['picked_up', 'in_transit', 'out_for_delivery', 'delivered']),
        location: faker.location.city(),
        message: faker.helpers.arrayElement([
          'Package picked up from warehouse',
          'In transit to destination',
          'Out for delivery',
          'Delivered successfully'
        ]),
        timestamp: randomDate(order.createdAt, new Date())
      };

      updates.push(update);
      count++;
      progress.increment();
    }
  }
  progress.complete();

  const insertedUpdates = await DeliveryUpdate.insertMany(updates);
  console.log(`✅ Created ${insertedUpdates.length} delivery updates`);
  return insertedUpdates;
}

async function seedAuditLogs(users) {
  console.log('\n📋 Seeding Audit Logs...');
  const logs = [];
  const progress = new ProgressLogger(DATA_CONFIG.auditLogs, 'Logs');

  const actions = [
    'user.login', 'user.logout', 'user.register', 'user.update',
    'product.create', 'product.update', 'product.delete',
    'order.create', 'order.update', 'order.cancel',
    'payment.success', 'payment.failed'
  ];

  for (let i = 0; i < DATA_CONFIG.auditLogs; i++) {
    const user = faker.helpers.arrayElement(users.all);
    const action = faker.helpers.arrayElement(actions);

    const log = {
      user: user._id,
      action: action,
      resourceType: action.split('.')[0],
      resourceId: new mongoose.Types.ObjectId(),
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      changes: {},
      timestamp: randomDate(new Date(2024, 0, 1), new Date())
    };

    logs.push(log);
    progress.increment();
  }
  progress.complete();

  const insertedLogs = await AuditLog.insertMany(logs);
  console.log(`✅ Created ${insertedLogs.length} audit logs`);
  return insertedLogs;
}

// Main Seeding Function
async function seedDatabase() {
  try {
    console.log('🌱 FarmChain Complete Synthetic Data Seeding');
    console.log('='.repeat(60));
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));

    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain');
    console.log('✅ MongoDB connected\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Wishlist.deleteMany({}),
      ChatMessage.deleteMany({}),
      Subscription.deleteMany({}),
      Invoice.deleteMany({}),
      DeliveryUpdate.deleteMany({}),
      AuditLog.deleteMany({})
    ]);
    console.log('✅ Database cleared\n');

    // Seed data in order
    const users = await seedUsers();
    const products = await seedProducts(users.byRole.FARMER);
    const orders = await seedOrders(products, users);
    const reviews = await seedReviews(products, orders, users);
    const wishlists = await seedWishlists(products, users);
    const messages = await seedChatMessages(users);
    const subscriptions = await seedSubscriptions(users);
    const invoices = await seedInvoices(orders);
    const deliveryUpdates = await seedDeliveryUpdates(orders);
    const auditLogs = await seedAuditLogs(users);

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    
    const counts = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Wishlist.countDocuments(),
      ChatMessage.countDocuments(),
      Subscription.countDocuments(),
      Invoice.countDocuments(),
      DeliveryUpdate.countDocuments(),
      AuditLog.countDocuments()
    ]);

    console.log(`\n👥 Users: ${counts[0]}`);
    console.log(`   ├─ Super Admins: ${await User.countDocuments({ primaryRole: 'SUPER_ADMIN' })}`);
    console.log(`   ├─ Admins: ${await User.countDocuments({ primaryRole: 'ADMIN' })}`);
    console.log(`   ├─ Farmers: ${await User.countDocuments({ primaryRole: 'FARMER' })}`);
    console.log(`   ├─ Distributors: ${await User.countDocuments({ primaryRole: 'DISTRIBUTOR' })}`);
    console.log(`   ├─ Retailers: ${await User.countDocuments({ primaryRole: 'RETAILER' })}`);
    console.log(`   └─ Consumers: ${await User.countDocuments({ primaryRole: 'CONSUMER' })}`);
    
    console.log(`\n🌾 Products: ${counts[1]}`);
    
    console.log(`\n📦 Orders: ${counts[2]}`);
    console.log(`   ├─ Pending: ${await Order.countDocuments({ status: 'pending' })}`);
    console.log(`   ├─ Confirmed: ${await Order.countDocuments({ status: 'confirmed' })}`);
    console.log(`   ├─ Payment Completed: ${await Order.countDocuments({ status: 'payment_completed' })}`);
    console.log(`   ├─ Shipped: ${await Order.countDocuments({ status: 'shipped' })}`);
    console.log(`   ├─ Delivered: ${await Order.countDocuments({ status: 'delivered' })}`);
    console.log(`   └─ Cancelled: ${await Order.countDocuments({ status: 'cancelled' })}`);
    
    console.log(`\n⭐ Reviews: ${counts[3]}`);
    console.log(`❤️  Wishlists: ${counts[4]}`);
    console.log(`💬 Chat Messages: ${counts[5]}`);
    console.log(`📧 Subscriptions: ${counts[6]}`);
    console.log(`🧾 Invoices: ${counts[7]}`);
    console.log(`🚚 Delivery Updates: ${counts[8]}`);
    console.log(`📋 Audit Logs: ${counts[9]}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`📅 Finished at: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));
    console.log('\n💡 Next Steps:');
    console.log('   1. Start backend: PORT=5001 node backend/start-server.js');
    console.log('   2. Start frontend: cd frontend && npm run dev');
    console.log('   3. Open: http://localhost:3000');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run seeding
seedDatabase();
