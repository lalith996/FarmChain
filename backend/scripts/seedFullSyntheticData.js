/**
 * COMPREHENSIVE SYNTHETIC DATA SEEDING SCRIPT
 * Creates complete realistic data matching frontend counts
 * Run: node backend/scripts/seedFullSyntheticData.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
require('dotenv').config({ path: './backend/.env' });

// Import all models
const User = require('../src/models/User.model');
const Product = require('../src/models/Product.model');
const Order = require('../src/models/Order.model');
const Review = require('../src/models/Review.model');
const Wishlist = require('../src/models/Wishlist.model');
const ChatMessage = require('../src/models/ChatMessage.model');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`),
  count: (label, count) => console.log(`${colors.magenta}${label}:${colors.reset} ${count}`)
};

// Configuration for data counts
const DATA_CONFIG = {
  USERS: {
    SUPER_ADMIN: 1,
    ADMIN: 5,
    FARMER: 150,
    DISTRIBUTOR: 86,
    RETAILER: 42,
    CONSUMER: 1234 // Total users will be 1518
  },
  PRODUCTS: {
    ACTIVE: 450,
    PENDING: 25,
    OUT_OF_STOCK: 15,
    REJECTED: 10
  },
  ORDERS: {
    PENDING: 45,
    CONFIRMED: 67,
    PROCESSING: 34,
    SHIPPED: 89,
    DELIVERED: 456,
    CANCELLED: 23,
    DISPUTED: 8
  },
  REVIEWS_PER_PRODUCT: 15, // Average
  WISHLIST_ITEMS: 500
};

// The 4 wallet addresses from your system
const WALLET_ADDRESSES = {
  SUPER_ADMIN: '0xf0555abf16e154574bc3b4a9190f958ccdfce886',
  FARMER: '0x2be21bb71e0b840d25e68ea5ada47e6a3e5a05e1',
  DISTRIBUTOR: '0xd92b8dd87f7ee45bda4f6a1e6f6cf9cbf6a6d3d4',
  CONSUMER: '0x742d35cc6634c0532925a3b844bc9e7595f0bfbb'
};

// Indian names for realistic data
const INDIAN_NAMES = {
  male: ['Rajesh Kumar', 'Amit Sharma', 'Suresh Patel', 'Vijay Singh', 'Rahul Verma', 'Anil Gupta', 'Manoj Yadav', 'Sanjay Reddy'],
  female: ['Priya Sharma', 'Anjali Patel', 'Neha Gupta', 'Pooja Singh', 'Kavita Verma', 'Sunita Reddy', 'Rekha Kumar', 'Meera Rao']
};

const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];

// Product categories and names
const PRODUCTS_DATA = {
  grains: ['Rice', 'Wheat', 'Bajra', 'Jowar', 'Maize', 'Barley'],
  vegetables: ['Tomato', 'Potato', 'Onion', 'Cabbage', 'Cauliflower', 'Brinjal', 'Okra', 'Bitter Gourd'],
  fruits: ['Mango', 'Banana', 'Apple', 'Orange', 'Grapes', 'Pomegranate', 'Papaya', 'Guava'],
  pulses: ['Toor Dal', 'Moong Dal', 'Urad Dal', 'Chana Dal', 'Masoor Dal'],
  spices: ['Turmeric', 'Chilli', 'Coriander', 'Cumin', 'Cardamom', 'Black Pepper'],
  dairy: ['Milk', 'Ghee', 'Paneer', 'Curd', 'Butter']
};

// Helper: Generate random Indian phone number
const generateIndianPhone = () => {
  return `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`;
};

// Helper: Generate wallet address
const generateWalletAddress = () => {
  return '0x' + Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

// Helper: Generate random date in last N days
const randomDateInLast = (days) => {
  const now = Date.now();
  const past = now - (days * 24 * 60 * 60 * 1000);
  return new Date(past + Math.random() * (now - past));
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

// Clean existing data
const cleanDatabase = async () => {
  log.section('Cleaning Existing Data');
  
  try {
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Wishlist.deleteMany({}),
      ChatMessage.deleteMany({})
    ]);
    log.success('Database cleaned');
  } catch (error) {
    log.error(`Error cleaning database: ${error.message}`);
    throw error;
  }
};

// Seed Users
const seedUsers = async () => {
  log.section('Seeding Users');
  
  const users = [];
  
  // 1. Super Admin
  users.push({
    walletAddress: WALLET_ADDRESSES.SUPER_ADMIN,
    roles: ['SUPER_ADMIN'],
    primaryRole: 'SUPER_ADMIN',
    profile: {
      name: 'Admin User',
      email: 'admin@farmchain.com',
      phone: generateIndianPhone(),
      bio: 'Platform Super Administrator',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      }
    },
    verification: {
      isVerified: true,
      kycStatus: 'approved',
      verificationLevel: 'full'
    },
    isActive: true,
    status: 'active',
    createdAt: randomDateInLast(365)
  });
  
  // 2. Admins
  for (let i = 0; i < DATA_CONFIG.USERS.ADMIN; i++) {
    const name = faker.helpers.arrayElement([...INDIAN_NAMES.male, ...INDIAN_NAMES.female]);
    users.push({
      walletAddress: generateWalletAddress(),
      roles: ['ADMIN'],
      primaryRole: 'ADMIN',
      profile: {
        name,
        email: `admin${i + 1}@farmchain.com`,
        phone: generateIndianPhone(),
        bio: 'Platform Administrator',
        location: {
          city: faker.helpers.arrayElement(INDIAN_CITIES),
          state: 'Maharashtra',
          country: 'India'
        }
      },
      verification: {
        isVerified: true,
        kycStatus: 'approved',
        verificationLevel: 'full'
      },
      isActive: true,
      status: 'active',
      createdAt: randomDateInLast(365)
    });
  }
  
  // 3. Farmers (including the specific wallet)
  for (let i = 0; i < DATA_CONFIG.USERS.FARMER; i++) {
    const name = faker.helpers.arrayElement(INDIAN_NAMES.male);
    const isSpecialFarmer = i === 0;
    
    users.push({
      walletAddress: isSpecialFarmer ? WALLET_ADDRESSES.FARMER : generateWalletAddress(),
      roles: ['FARMER'],
      primaryRole: 'FARMER',
      profile: {
        name,
        email: `farmer${i + 1}@example.com`,
        phone: generateIndianPhone(),
        bio: `Organic farmer specializing in ${faker.helpers.arrayElement(['vegetables', 'grains', 'fruits'])}`,
        location: {
          city: faker.helpers.arrayElement(INDIAN_CITIES),
          state: faker.helpers.arrayElement(['Maharashtra', 'Punjab', 'Uttar Pradesh', 'Gujarat']),
          country: 'India'
        }
      },
      farmDetails: {
        farmName: `${name.split(' ')[0]} Farm`,
        farmSize: Math.floor(Math.random() * 50) + 5,
        farmingType: faker.helpers.arrayElement(['organic', 'conventional', 'hydroponic']),
        established: new Date(2000 + Math.floor(Math.random() * 20), 0, 1)
      },
      verification: {
        isVerified: Math.random() > 0.1,
        kycStatus: faker.helpers.arrayElement(['approved', 'pending', 'submitted']),
        verificationLevel: faker.helpers.arrayElement(['basic', 'full'])
      },
      rating: {
        average: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        count: Math.floor(Math.random() * 100) + 10
      },
      isActive: true,
      status: 'active',
      createdAt: randomDateInLast(365)
    });
  }
  
  // 4. Distributors (including the specific wallet)
  for (let i = 0; i < DATA_CONFIG.USERS.DISTRIBUTOR; i++) {
    const name = faker.helpers.arrayElement([...INDIAN_NAMES.male, ...INDIAN_NAMES.female]);
    const isSpecialDistributor = i === 0;
    
    users.push({
      walletAddress: isSpecialDistributor ? WALLET_ADDRESSES.DISTRIBUTOR : generateWalletAddress(),
      roles: ['DISTRIBUTOR'],
      primaryRole: 'DISTRIBUTOR',
      profile: {
        name,
        email: `distributor${i + 1}@example.com`,
        phone: generateIndianPhone(),
        bio: 'Agricultural products distributor',
        location: {
          city: faker.helpers.arrayElement(INDIAN_CITIES),
          state: faker.helpers.arrayElement(['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu']),
          country: 'India'
        }
      },
      verification: {
        isVerified: Math.random() > 0.15,
        kycStatus: faker.helpers.arrayElement(['approved', 'pending', 'submitted']),
        verificationLevel: 'full'
      },
      rating: {
        average: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        count: Math.floor(Math.random() * 80) + 5
      },
      isActive: true,
      status: 'active',
      createdAt: randomDateInLast(365)
    });
  }
  
  // 5. Retailers
  for (let i = 0; i < DATA_CONFIG.USERS.RETAILER; i++) {
    const name = faker.helpers.arrayElement([...INDIAN_NAMES.male, ...INDIAN_NAMES.female]);
    
    users.push({
      walletAddress: generateWalletAddress(),
      roles: ['RETAILER'],
      primaryRole: 'RETAILER',
      profile: {
        name,
        email: `retailer${i + 1}@example.com`,
        phone: generateIndianPhone(),
        bio: 'Retail store owner',
        location: {
          city: faker.helpers.arrayElement(INDIAN_CITIES),
          state: faker.helpers.arrayElement(['Maharashtra', 'Gujarat', 'Karnataka']),
          country: 'India'
        }
      },
      verification: {
        isVerified: Math.random() > 0.2,
        kycStatus: faker.helpers.arrayElement(['approved', 'pending', 'submitted']),
        verificationLevel: faker.helpers.arrayElement(['basic', 'full'])
      },
      rating: {
        average: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        count: Math.floor(Math.random() * 60) + 5
      },
      isActive: true,
      status: 'active',
      createdAt: randomDateInLast(365)
    });
  }
  
  // 6. Consumers (including the specific wallet)
  for (let i = 0; i < DATA_CONFIG.USERS.CONSUMER; i++) {
    const name = faker.helpers.arrayElement([...INDIAN_NAMES.male, ...INDIAN_NAMES.female]);
    const isSpecialConsumer = i === 0;
    
    users.push({
      walletAddress: isSpecialConsumer ? WALLET_ADDRESSES.CONSUMER : generateWalletAddress(),
      roles: ['CONSUMER'],
      primaryRole: 'CONSUMER',
      profile: {
        name,
        email: `consumer${i + 1}@example.com`,
        phone: generateIndianPhone(),
        bio: 'Agricultural product consumer',
        location: {
          city: faker.helpers.arrayElement(INDIAN_CITIES),
          state: faker.helpers.arrayElement(['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh']),
          country: 'India'
        }
      },
      verification: {
        isVerified: Math.random() > 0.3,
        kycStatus: faker.helpers.arrayElement(['approved', 'pending', 'not_submitted']),
        verificationLevel: faker.helpers.arrayElement(['basic', 'none'])
      },
      isActive: true,
      status: 'active',
      createdAt: randomDateInLast(365)
    });
  }
  
  // Insert all users
  const createdUsers = await User.insertMany(users);
  log.success(`Created ${createdUsers.length} users`);
  
  // Log breakdown
  log.count('Super Admins', DATA_CONFIG.USERS.SUPER_ADMIN);
  log.count('Admins', DATA_CONFIG.USERS.ADMIN);
  log.count('Farmers', DATA_CONFIG.USERS.FARMER);
  log.count('Distributors', DATA_CONFIG.USERS.DISTRIBUTOR);
  log.count('Retailers', DATA_CONFIG.USERS.RETAILER);
  log.count('Consumers', DATA_CONFIG.USERS.CONSUMER);
  log.count('TOTAL USERS', createdUsers.length);
  
  return createdUsers;
};

// Seed Products
const seedProducts = async (users) => {
  log.section('Seeding Products');
  
  const farmers = users.filter(u => u.primaryRole === 'FARMER');
  const products = [];
  
  const totalProducts = Object.values(DATA_CONFIG.PRODUCTS).reduce((a, b) => a + b, 0);
  
  let productCounter = 1;
  
  // Helper to create a product
  const createProduct = (status) => {
    const category = faker.helpers.objectKey(PRODUCTS_DATA);
    const productName = faker.helpers.arrayElement(PRODUCTS_DATA[category]);
    const farmer = faker.helpers.arrayElement(farmers);
    const price = Math.floor(Math.random() * 500) + 50;
    const quantity = status === 'out_of_stock' ? 0 : Math.floor(Math.random() * 1000) + 50;
    
    return {
      productId: `PROD-${String(productCounter++).padStart(6, '0')}`,
      farmer: farmer._id,
      farmerWallet: farmer.walletAddress,
      basicInfo: {
        name: `${faker.helpers.arrayElement(['Organic', 'Fresh', 'Premium', 'Grade A'])} ${productName}`,
        category,
        subCategory: faker.helpers.arrayElement(['Regular', 'Premium', 'Organic']),
        variety: `${productName} Variety ${Math.floor(Math.random() * 5) + 1}`,
        description: `High quality ${productName.toLowerCase()} directly from farm. Fresh and organic.`,
        images: [
          `https://picsum.photos/seed/${productCounter}/400/300`,
          `https://picsum.photos/seed/${productCounter + 1000}/400/300`
        ],
        certifications: faker.helpers.arrayElements(['Organic', 'FSSAI', 'ISO 9001'], Math.floor(Math.random() * 3))
      },
      farmDetails: {
        farmName: farmer.farmDetails?.farmName || `${farmer.profile.name.split(' ')[0]} Farm`,
        farmLocation: {
          address: `${farmer.profile.location.city}, ${farmer.profile.location.state}`,
          coordinates: {
            latitude: 20 + Math.random() * 10,
            longitude: 72 + Math.random() * 15
          }
        },
        sowingDate: randomDateInLast(120),
        harvestDate: randomDateInLast(30),
        farmingMethod: faker.helpers.arrayElement(['organic', 'conventional', 'hydroponic'])
      },
      quantity: {
        available: quantity,
        sold: status === 'active' ? Math.floor(Math.random() * 500) : 0,
        unit: faker.helpers.arrayElement(['kg', 'quintal', 'dozen', 'piece'])
      },
      pricing: {
        basePrice: price,
        currency: 'INR',
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0
      },
      quality: {
        grade: faker.helpers.arrayElement(['A', 'B', 'Premium', 'Standard']),
        freshness: faker.helpers.arrayElement(['Fresh', 'Very Fresh', 'Farm Fresh']),
        organicCertified: Math.random() > 0.5
      },
      logistics: {
        availableForPickup: true,
        availableForDelivery: true,
        deliveryRadius: Math.floor(Math.random() * 100) + 50,
        packagingType: faker.helpers.arrayElement(['Box', 'Bag', 'Crate', 'Bulk'])
      },
      blockchain: {
        onChain: Math.random() > 0.3,
        txHash: Math.random() > 0.3 ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : null
      },
      status,
      visibility: status === 'active' ? 'public' : 'private',
      rating: {
        average: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        count: Math.floor(Math.random() * 50)
      },
      createdAt: randomDateInLast(180),
      updatedAt: randomDateInLast(30)
    };
  };
  
  // Create products by status
  for (let i = 0; i < DATA_CONFIG.PRODUCTS.ACTIVE; i++) {
    products.push(createProduct('active'));
  }
  for (let i = 0; i < DATA_CONFIG.PRODUCTS.PENDING; i++) {
    products.push(createProduct('pending'));
  }
  for (let i = 0; i < DATA_CONFIG.PRODUCTS.OUT_OF_STOCK; i++) {
    products.push(createProduct('out_of_stock'));
  }
  for (let i = 0; i < DATA_CONFIG.PRODUCTS.REJECTED; i++) {
    products.push(createProduct('rejected'));
  }
  
  const createdProducts = await Product.insertMany(products);
  log.success(`Created ${createdProducts.length} products`);
  
  log.count('Active Products', DATA_CONFIG.PRODUCTS.ACTIVE);
  log.count('Pending Products', DATA_CONFIG.PRODUCTS.PENDING);
  log.count('Out of Stock', DATA_CONFIG.PRODUCTS.OUT_OF_STOCK);
  log.count('Rejected Products', DATA_CONFIG.PRODUCTS.REJECTED);
  log.count('TOTAL PRODUCTS', createdProducts.length);
  
  return createdProducts;
};

// Seed Orders
const seedOrders = async (users, products) => {
  log.section('Seeding Orders');
  
  const consumers = users.filter(u => ['CONSUMER', 'RETAILER', 'DISTRIBUTOR'].includes(u.primaryRole));
  const activeProducts = products.filter(p => p.status === 'active');
  const orders = [];
  
  let orderCounter = 1;
  
  // Helper to create an order
  const createOrder = (status) => {
    const buyer = faker.helpers.arrayElement(consumers);
    const product = faker.helpers.arrayElement(activeProducts);
    const seller = users.find(u => u._id.equals(product.farmer));
    const quantity = Math.floor(Math.random() * 20) + 1;
    const pricePerUnit = product.pricing.basePrice;
    const totalAmount = quantity * pricePerUnit;
    
    const order = {
      orderId: `ORD-2024-${String(orderCounter++).padStart(6, '0')}`,
      buyer: buyer._id,
      buyerWallet: buyer.walletAddress,
      seller: seller._id,
      sellerWallet: seller.walletAddress,
      product: product._id,
      productSnapshot: {
        productId: product.productId,
        name: product.basicInfo.name,
        category: product.basicInfo.category,
        images: product.basicInfo.images,
        grade: product.quality.grade
      },
      orderDetails: {
        quantity,
        unit: product.quantity.unit,
        pricePerUnit,
        totalAmount,
        currency: 'INR'
      },
      delivery: {
        address: {
          street: faker.location.streetAddress(),
          city: buyer.profile.location.city,
          state: buyer.profile.location.state,
          zipCode: faker.location.zipCode(),
          country: 'India'
        },
        method: faker.helpers.arrayElement(['standard', 'express', 'pickup']),
        estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      payment: {
        method: faker.helpers.arrayElement(['wallet', 'upi', 'card', 'netbanking']),
        status: ['delivered', 'shipped'].includes(status) ? 'completed' : 
                status === 'cancelled' ? 'refunded' : 'pending',
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        paidAmount: status !== 'pending' ? totalAmount : 0
      },
      status,
      timeline: [
        {
          status: 'placed',
          timestamp: randomDateInLast(30),
          description: 'Order placed successfully'
        }
      ],
      createdAt: randomDateInLast(90),
      updatedAt: randomDateInLast(10)
    };
    
    // Add more timeline entries based on status
    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(status)) {
      order.timeline.push({
        status: 'confirmed',
        timestamp: randomDateInLast(28),
        description: 'Order confirmed by seller'
      });
    }
    
    if (['processing', 'shipped', 'delivered'].includes(status)) {
      order.timeline.push({
        status: 'processing',
        timestamp: randomDateInLast(25),
        description: 'Order is being processed'
      });
    }
    
    if (['shipped', 'delivered'].includes(status)) {
      order.timeline.push({
        status: 'shipped',
        timestamp: randomDateInLast(20),
        description: 'Order has been shipped'
      });
    }
    
    if (status === 'delivered') {
      order.timeline.push({
        status: 'delivered',
        timestamp: randomDateInLast(15),
        description: 'Order delivered successfully'
      });
    }
    
    return order;
  };
  
  // Create orders by status
  for (let i = 0; i < DATA_CONFIG.ORDERS.PENDING; i++) {
    orders.push(createOrder('pending'));
  }
  for (let i = 0; i < DATA_CONFIG.ORDERS.CONFIRMED; i++) {
    orders.push(createOrder('confirmed'));
  }
  for (let i = 0; i < DATA_CONFIG.ORDERS.PROCESSING; i++) {
    orders.push(createOrder('processing'));
  }
  for (let i = 0; i < DATA_CONFIG.ORDERS.SHIPPED; i++) {
    orders.push(createOrder('shipped'));
  }
  for (let i = 0; i < DATA_CONFIG.ORDERS.DELIVERED; i++) {
    orders.push(createOrder('delivered'));
  }
  for (let i = 0; i < DATA_CONFIG.ORDERS.CANCELLED; i++) {
    orders.push(createOrder('cancelled'));
  }
  for (let i = 0; i < DATA_CONFIG.ORDERS.DISPUTED; i++) {
    const order = createOrder('disputed');
    order.dispute = {
      isDisputed: true,
      reason: faker.helpers.arrayElement(['Product quality issue', 'Late delivery', 'Wrong product', 'Damaged product']),
      raisedBy: order.buyer,
      raisedAt: randomDateInLast(10),
      status: 'open'
    };
    orders.push(order);
  }
  
  const createdOrders = await Order.insertMany(orders);
  log.success(`Created ${createdOrders.length} orders`);
  
  log.count('Pending Orders', DATA_CONFIG.ORDERS.PENDING);
  log.count('Confirmed Orders', DATA_CONFIG.ORDERS.CONFIRMED);
  log.count('Processing Orders', DATA_CONFIG.ORDERS.PROCESSING);
  log.count('Shipped Orders', DATA_CONFIG.ORDERS.SHIPPED);
  log.count('Delivered Orders', DATA_CONFIG.ORDERS.DELIVERED);
  log.count('Cancelled Orders', DATA_CONFIG.ORDERS.CANCELLED);
  log.count('Disputed Orders', DATA_CONFIG.ORDERS.DISPUTED);
  log.count('TOTAL ORDERS', createdOrders.length);
  
  return createdOrders;
};

// Seed Reviews
const seedReviews = async (users, products, orders) => {
  log.section('Seeding Reviews');
  
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const reviews = [];
  
  // Create reviews for random delivered orders
  const ordersToReview = faker.helpers.arrayElements(
    deliveredOrders, 
    Math.min(Math.floor(deliveredOrders.length * 0.6), 300)
  );
  
  for (const order of ordersToReview) {
    const buyer = users.find(u => u._id.equals(order.buyer));
    const product = products.find(p => p._id.equals(order.product));
    
    if (buyer && product) {
      reviews.push({
        user: buyer._id,
        userWallet: buyer.walletAddress,
        product: product._id,
        order: order._id,
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
        comment: faker.helpers.arrayElement([
          'Excellent quality product!',
          'Very fresh and organic.',
          'Good value for money.',
          'Fast delivery and good packaging.',
          'Satisfied with the purchase.',
          'Will buy again!',
          'Highly recommended.',
          'Good quality but slightly expensive.',
          'Average quality, could be better.',
          'Fresh produce, happy with it.'
        ]),
        images: Math.random() > 0.7 ? [
          `https://picsum.photos/seed/review${reviews.length}/300/200`
        ] : [],
        verified: true,
        helpful: Math.floor(Math.random() * 20),
        createdAt: randomDateInLast(60),
        updatedAt: randomDateInLast(30)
      });
    }
  }
  
  const createdReviews = await Review.insertMany(reviews);
  log.success(`Created ${createdReviews.length} reviews`);
  
  return createdReviews;
};

// Seed Wishlists
const seedWishlists = async (users, products) => {
  log.section('Seeding Wishlists');
  
  const consumers = users.filter(u => ['CONSUMER', 'RETAILER'].includes(u.primaryRole));
  const activeProducts = products.filter(p => p.status === 'active');
  const wishlists = [];
  
  // Create wishlists for random consumers
  const usersWithWishlists = faker.helpers.arrayElements(
    consumers,
    Math.min(Math.floor(consumers.length * 0.3), 200)
  );
  
  for (const user of usersWithWishlists) {
    const items = [];
    const numItems = Math.floor(Math.random() * 5) + 1;
    const selectedProducts = faker.helpers.arrayElements(activeProducts, numItems);
    
    for (const product of selectedProducts) {
      items.push({
        product: product._id,
        addedAt: randomDateInLast(60)
      });
    }
    
    wishlists.push({
      user: user._id,
      name: 'My Wishlist',
      items,
      isDefault: true,
      createdAt: randomDateInLast(90)
    });
  }
  
  const createdWishlists = await Wishlist.insertMany(wishlists);
  log.success(`Created ${createdWishlists.length} wishlists`);
  log.count('Total wishlist items', wishlists.reduce((sum, w) => sum + w.items.length, 0));
  
  return createdWishlists;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('\n' + colors.cyan + '╔════════════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.cyan + '║  FARMCHAIN COMPREHENSIVE SYNTHETIC DATA SEEDING SCRIPT     ║' + colors.reset);
    console.log(colors.cyan + '╚════════════════════════════════════════════════════════════╝' + colors.reset + '\n');
    
    await connectDB();
    
    // Clean existing data
    await cleanDatabase();
    
    // Seed data in order
    const users = await seedUsers();
    const products = await seedProducts(users);
    const orders = await seedOrders(users, products);
    const reviews = await seedReviews(users, products, orders);
    const wishlists = await seedWishlists(users, products);
    
    // Final summary
    log.section('SEEDING COMPLETE - DATABASE SUMMARY');
    
    const [
      totalUsers,
      usersByRole,
      totalProducts,
      productsByStatus,
      totalOrders,
      ordersByStatus,
      totalRevenue,
      totalReviews,
      totalWishlists
    ] = await Promise.all([
      User.countDocuments(),
      User.aggregate([
        { $group: { _id: '$primaryRole', count: { $sum: 1 } } }
      ]),
      Product.countDocuments(),
      Product.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$orderDetails.totalAmount' } } }
      ]),
      Review.countDocuments(),
      Wishlist.countDocuments()
    ]);
    
    console.log('\n' + colors.green + '═══════════════════════════════════════════════════════════' + colors.reset);
    log.count('✓ Total Users', totalUsers);
    usersByRole.forEach(r => log.count(`  └─ ${r._id}`, r.count));
    
    log.count('✓ Total Products', totalProducts);
    productsByStatus.forEach(p => log.count(`  └─ ${p._id}`, p.count));
    
    log.count('✓ Total Orders', totalOrders);
    ordersByStatus.forEach(o => log.count(`  └─ ${o._id}`, o.count));
    
    log.count('✓ Total Revenue', `₹${(totalRevenue[0]?.total || 0).toLocaleString('en-IN')}`);
    log.count('✓ Total Reviews', totalReviews);
    log.count('✓ Total Wishlists', totalWishlists);
    console.log(colors.green + '═══════════════════════════════════════════════════════════' + colors.reset + '\n');
    
    log.success('All synthetic data seeded successfully!');
    log.info('You can now start your backend and frontend servers');
    
  } catch (error) {
    log.error(`Seeding failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log.info('Database connection closed');
  }
};

// Run the seeding
seedDatabase();
