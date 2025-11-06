const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Transaction = require('../src/models/Transaction');
const Analytics = require('../src/models/Analytics');
const Notification = require('../src/models/Notification');

// Helper functions for generating random data
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => 
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomDate = (start, end) => 
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Data arrays for realistic generation
const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anita', 'Suresh', 'Kavita', 
  'Ramesh', 'Lakshmi', 'Kumar', 'Deepa', 'Arun', 'Meera', 'Sanjay', 'Pooja', 'Ravi', 'Sneha',
  'Mahesh', 'Divya', 'Rakesh', 'Preeti', 'Ashok', 'Nisha', 'Manoj', 'Swati', 'Ajay', 'Anjali',
  'Kiran', 'Rekha', 'Nitin', 'Shobha', 'Prakash', 'Usha', 'Santosh', 'Asha', 'Dinesh', 'Lata'];

const lastNames = ['Kumar', 'Singh', 'Patel', 'Sharma', 'Reddy', 'Rao', 'Nair', 'Iyer',
  'Gupta', 'Verma', 'Joshi', 'Desai', 'Mehta', 'Shah', 'Pillai', 'Menon', 'Kulkarni', 'Agarwal',
  'Mishra', 'Trivedi', 'Pandey', 'Chaudhary', 'Malhotra', 'Khanna', 'Chopra', 'Bansal'];

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam',
  'Patna', 'Vadodara', 'Ludhiana', 'Agra', 'Nashik', 'Vijayawada', 'Madurai', 'Varanasi'];

const states = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Gujarat', 'Rajasthan', 'West Bengal', 'Madhya Pradesh', 'Bihar', 'Punjab', 'Haryana',
  'Andhra Pradesh', 'Odisha', 'Kerala', 'Assam', 'Jharkhand', 'Chhattisgarh'];

const vegetables = [
  { name: 'Tomato', category: 'Vegetables', unit: 'kg', priceRange: [20, 60] },
  { name: 'Potato', category: 'Vegetables', unit: 'kg', priceRange: [15, 35] },
  { name: 'Onion', category: 'Vegetables', unit: 'kg', priceRange: [25, 70] },
  { name: 'Carrot', category: 'Vegetables', unit: 'kg', priceRange: [30, 50] },
  { name: 'Cabbage', category: 'Vegetables', unit: 'kg', priceRange: [20, 40] },
  { name: 'Cauliflower', category: 'Vegetables', unit: 'kg', priceRange: [25, 55] },
  { name: 'Brinjal', category: 'Vegetables', unit: 'kg', priceRange: [30, 60] },
  { name: 'Capsicum', category: 'Vegetables', unit: 'kg', priceRange: [40, 80] },
  { name: 'Green Beans', category: 'Vegetables', unit: 'kg', priceRange: [35, 70] },
  { name: 'Spinach', category: 'Vegetables', unit: 'kg', priceRange: [20, 45] },
  { name: 'Cucumber', category: 'Vegetables', unit: 'kg', priceRange: [15, 35] },
  { name: 'Bitter Gourd', category: 'Vegetables', unit: 'kg', priceRange: [30, 55] },
  { name: 'Bottle Gourd', category: 'Vegetables', unit: 'kg', priceRange: [20, 40] },
  { name: 'Radish', category: 'Vegetables', unit: 'kg', priceRange: [15, 30] },
  { name: 'Beetroot', category: 'Vegetables', unit: 'kg', priceRange: [25, 50] }
];

const fruits = [
  { name: 'Apple', category: 'Fruits', unit: 'kg', priceRange: [80, 150] },
  { name: 'Banana', category: 'Fruits', unit: 'dozen', priceRange: [30, 60] },
  { name: 'Orange', category: 'Fruits', unit: 'kg', priceRange: [40, 80] },
  { name: 'Mango', category: 'Fruits', unit: 'kg', priceRange: [60, 120] },
  { name: 'Grapes', category: 'Fruits', unit: 'kg', priceRange: [50, 100] },
  { name: 'Pomegranate', category: 'Fruits', unit: 'kg', priceRange: [80, 150] },
  { name: 'Papaya', category: 'Fruits', unit: 'kg', priceRange: [25, 50] },
  { name: 'Watermelon', category: 'Fruits', unit: 'kg', priceRange: [15, 30] },
  { name: 'Guava', category: 'Fruits', unit: 'kg', priceRange: [30, 60] },
  { name: 'Pineapple', category: 'Fruits', unit: 'piece', priceRange: [40, 80] }
];

const grains = [
  { name: 'Rice', category: 'Grains', unit: 'kg', priceRange: [40, 80] },
  { name: 'Wheat', category: 'Grains', unit: 'kg', priceRange: [25, 45] },
  { name: 'Basmati Rice', category: 'Grains', unit: 'kg', priceRange: [80, 150] },
  { name: 'Jowar', category: 'Grains', unit: 'kg', priceRange: [30, 50] },
  { name: 'Bajra', category: 'Grains', unit: 'kg', priceRange: [35, 55] }
];

const pulses = [
  { name: 'Toor Dal', category: 'Pulses', unit: 'kg', priceRange: [80, 120] },
  { name: 'Moong Dal', category: 'Pulses', unit: 'kg', priceRange: [90, 140] },
  { name: 'Chana Dal', category: 'Pulses', unit: 'kg', priceRange: [70, 110] },
  { name: 'Urad Dal', category: 'Pulses', unit: 'kg', priceRange: [85, 130] },
  { name: 'Masoor Dal', category: 'Pulses', unit: 'kg', priceRange: [75, 115] }
];

const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
const paymentMethods = ['card', 'upi', 'netbanking', 'wallet', 'cod'];

// Generate email from name
const generateEmail = (firstName, lastName) => {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber(1, 999)}@example.com`;
};

// Generate phone number
const generatePhone = () => {
  return `+91${randomNumber(7000000000, 9999999999)}`;
};

// Generate address
const generateAddress = () => {
  const city = randomElement(cities);
  const state = randomElement(states);
  return {
    street: `${randomNumber(1, 999)}, ${randomElement(['Main Street', 'Market Road', 'Gandhi Nagar', 'MG Road', 'Station Road'])}`,
    city,
    state,
    pincode: `${randomNumber(100000, 999999)}`,
    country: 'India'
  };
};

// Hash password (simple for demo)
const bcrypt = require('bcryptjs');
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Cleaning existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Transaction.deleteMany({});
    await Analytics.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Cleaned existing data\n');

    // ============= STEP 1: Create Users =============
    console.log('👥 Creating users...');
    const hashedPassword = await hashPassword('password123');
    
    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@farmchain.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+919876543210',
      address: generateAddress(),
      isVerified: true,
      createdAt: new Date('2024-01-01')
    });

    // Create farmers (50)
    const farmers = [];
    for (let i = 0; i < 50; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const farmer = await User.create({
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName),
        password: hashedPassword,
        role: 'farmer',
        phone: generatePhone(),
        address: generateAddress(),
        isVerified: randomNumber(1, 10) > 2, // 80% verified
        createdAt: randomDate(new Date('2024-01-01'), new Date('2024-10-31'))
      });
      farmers.push(farmer);
    }

    // Create buyers (100)
    const buyers = [];
    for (let i = 0; i < 100; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const buyer = await User.create({
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName),
        password: hashedPassword,
        role: 'buyer',
        phone: generatePhone(),
        address: generateAddress(),
        isVerified: randomNumber(1, 10) > 3, // 70% verified
        createdAt: randomDate(new Date('2024-01-01'), new Date('2024-11-05'))
      });
      buyers.push(buyer);
    }

    console.log(`✅ Created ${farmers.length} farmers, ${buyers.length} buyers, and 1 admin\n`);

    // ============= STEP 2: Create Products =============
    console.log('🌾 Creating products...');
    const allProductTemplates = [...vegetables, ...fruits, ...grains, ...pulses];
    const products = [];

    for (let i = 0; i < 150; i++) {
      const template = randomElement(allProductTemplates);
      const farmer = randomElement(farmers);
      const quantity = randomNumber(50, 1000);
      const price = randomFloat(template.priceRange[0], template.priceRange[1]);
      
      const product = await Product.create({
        name: template.name,
        description: `Fresh ${template.name} directly from farm. Organically grown with no pesticides.`,
        category: template.category,
        price: price,
        quantity: quantity,
        unit: template.unit,
        farmer: farmer._id,
        images: [
          `https://images.unsplash.com/photo-${randomNumber(1500000000000, 1700000000000)}?w=400`,
          `https://images.unsplash.com/photo-${randomNumber(1500000000000, 1700000000000)}?w=400`
        ],
        location: farmer.address,
        certifications: randomNumber(1, 3) > 1 ? ['Organic', 'Pesticide Free'] : [],
        isAvailable: randomNumber(1, 10) > 2, // 80% available
        ratings: {
          average: randomFloat(3.5, 5.0, 1),
          count: randomNumber(0, 50)
        },
        createdAt: randomDate(new Date('2024-01-01'), new Date('2024-11-05'))
      });
      products.push(product);
    }

    console.log(`✅ Created ${products.length} products\n`);

    // ============= STEP 3: Create Orders =============
    console.log('📦 Creating orders...');
    const orders = [];
    let totalRevenue = 0;

    for (let i = 0; i < 300; i++) {
      const buyer = randomElement(buyers);
      const numItems = randomNumber(1, 5);
      const orderProducts = [];
      let orderTotal = 0;

      // Select random products for this order
      for (let j = 0; j < numItems; j++) {
        const product = randomElement(products);
        const quantity = randomNumber(1, 10);
        const itemTotal = product.price * quantity;
        orderTotal += itemTotal;

        orderProducts.push({
          product: product._id,
          quantity: quantity,
          price: product.price,
          total: itemTotal
        });
      }

      const status = randomElement(orderStatuses);
      const createdDate = randomDate(new Date('2024-01-01'), new Date('2024-11-05'));
      
      const order = await Order.create({
        orderNumber: `ORD${String(i + 1).padStart(6, '0')}`,
        buyer: buyer._id,
        items: orderProducts,
        totalAmount: orderTotal,
        status: status,
        paymentStatus: status === 'delivered' ? 'completed' : randomElement(paymentStatuses),
        paymentMethod: randomElement(paymentMethods),
        shippingAddress: buyer.address,
        deliveryDate: status === 'delivered' ? 
          randomDate(createdDate, new Date()) : 
          randomDate(new Date(), new Date('2024-12-31')),
        createdAt: createdDate,
        updatedAt: new Date()
      });

      orders.push(order);
      if (status === 'delivered') {
        totalRevenue += orderTotal;
      }
    }

    console.log(`✅ Created ${orders.length} orders\n`);

    // ============= STEP 4: Create Transactions =============
    console.log('💳 Creating transactions...');
    const transactions = [];

    for (const order of orders) {
      if (order.paymentStatus === 'completed') {
        const transaction = await Transaction.create({
          orderId: order._id,
          userId: order.buyer,
          amount: order.totalAmount,
          type: 'payment',
          status: 'completed',
          paymentMethod: order.paymentMethod,
          transactionId: `TXN${Date.now()}${randomNumber(1000, 9999)}`,
          description: `Payment for order ${order.orderNumber}`,
          createdAt: order.createdAt
        });
        transactions.push(transaction);
      }
    }

    console.log(`✅ Created ${transactions.length} transactions\n`);

    // ============= STEP 5: Create Analytics =============
    console.log('📊 Creating analytics data...');
    
    // Daily analytics for the last 30 days
    const analyticsData = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === date.getTime();
      });

      const dayRevenue = dayOrders
        .filter(o => o.paymentStatus === 'completed')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const analytics = await Analytics.create({
        date: date,
        metrics: {
          totalOrders: dayOrders.length,
          totalRevenue: dayRevenue,
          newUsers: randomNumber(1, 10),
          activeUsers: randomNumber(10, 50),
          productsListed: randomNumber(5, 20),
          productsSold: dayOrders.reduce((sum, o) => sum + o.items.length, 0)
        },
        categoryBreakdown: {
          Vegetables: randomNumber(20, 50),
          Fruits: randomNumber(15, 40),
          Grains: randomNumber(10, 30),
          Pulses: randomNumber(5, 20)
        },
        topProducts: products.slice(0, 5).map(p => ({
          product: p._id,
          revenue: randomFloat(1000, 10000),
          unitsSold: randomNumber(10, 100)
        })),
        createdAt: date
      });
      analyticsData.push(analytics);
    }

    console.log(`✅ Created ${analyticsData.length} days of analytics\n`);

    // ============= STEP 6: Create Notifications =============
    console.log('🔔 Creating notifications...');
    const notifications = [];
    const notificationTypes = [
      'order_placed',
      'order_confirmed',
      'order_shipped',
      'order_delivered',
      'payment_received',
      'new_product',
      'low_stock',
      'price_change'
    ];

    const notificationMessages = {
      order_placed: 'New order placed',
      order_confirmed: 'Your order has been confirmed',
      order_shipped: 'Your order has been shipped',
      order_delivered: 'Your order has been delivered',
      payment_received: 'Payment received successfully',
      new_product: 'New product available',
      low_stock: 'Product stock is low',
      price_change: 'Product price updated'
    };

    // Create notifications for all users
    for (const user of [...farmers, ...buyers]) {
      const numNotifications = randomNumber(3, 15);
      for (let i = 0; i < numNotifications; i++) {
        const type = randomElement(notificationTypes);
        const notification = await Notification.create({
          user: user._id,
          type: type,
          title: notificationMessages[type],
          message: `${notificationMessages[type]} - Order #ORD${String(randomNumber(1, 300)).padStart(6, '0')}`,
          isRead: randomNumber(1, 10) > 4, // 60% read
          createdAt: randomDate(new Date('2024-01-01'), new Date())
        });
        notifications.push(notification);
      }
    }

    console.log(`✅ Created ${notifications.length} notifications\n`);

    // ============= SUMMARY =============
    console.log('📈 DATABASE SEEDING COMPLETED!\n');
    console.log('═══════════════════════════════════════');
    console.log('SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`👥 Users: ${farmers.length + buyers.length + 1}`);
    console.log(`   - Farmers: ${farmers.length}`);
    console.log(`   - Buyers: ${buyers.length}`);
    console.log(`   - Admins: 1`);
    console.log(`🌾 Products: ${products.length}`);
    console.log(`📦 Orders: ${orders.length}`);
    console.log(`💳 Transactions: ${transactions.length}`);
    console.log(`📊 Analytics Records: ${analyticsData.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);
    console.log(`💰 Total Revenue: ₹${totalRevenue.toFixed(2)}`);
    console.log('═══════════════════════════════════════\n');

    console.log('✅ All data seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Email: admin@farmchain.com');
    console.log('   Password: password123');
    console.log('\n   (All users have password: password123)\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding
seedDatabase();
