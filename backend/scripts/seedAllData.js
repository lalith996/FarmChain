const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../src/models/User.model');
const Product = require('../src/models/Product.model');
const Order = require('../src/models/Order.model');
const Review = require('../src/models/Review.model');
const Wishlist = require('../src/models/Wishlist.model');
const BulkPricing = require('../src/models/BulkPricing.model');
const DeliveryUpdate = require('../src/models/DeliveryUpdate.model');

// Helper functions
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEthAddress() {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

function generateTxHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Product images by category (Unsplash)
const productImages = {
  grains: {
    'Basmati Rice': ['https://images.unsplash.com/photo-1586201375761-83865001e31c', 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6'],
    'Wheat': ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', 'https://images.unsplash.com/photo-1595855759920-86582396756a'],
    'Corn': ['https://images.unsplash.com/photo-1551754655-cd27e38d2076', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617'],
    'Millet': ['https://images.unsplash.com/photo-1599909533730-f9d5f8e5be8d', 'https://images.unsplash.com/photo-1607672632458-9eb56696346b'],
    'Sorghum': ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', 'https://images.unsplash.com/photo-1595855759920-86582396756a']
  },
  vegetables: {
    'Tomato': ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337'],
    'Potato': ['https://images.unsplash.com/photo-1518977676601-b53f82aba655', 'https://images.unsplash.com/photo-1596910547037-846b1980329f'],
    'Onion': ['https://images.unsplash.com/photo-1587049352846-4a222e784210', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb'],
    'Carrot': ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37', 'https://images.unsplash.com/photo-1582515073490-39981397c445'],
    'Cabbage': ['https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f', 'https://images.unsplash.com/photo-1553395572-8a6af6e4e1c7'],
    'Cauliflower': ['https://images.unsplash.com/photo-1568584711271-e88a6c8b6a4b', 'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785'],
    'Spinach': ['https://images.unsplash.com/photo-1576045057995-568f588f82fb', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb'],
    'Bell Pepper': ['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83', 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716']
  },
  fruits: {
    'Mango': ['https://images.unsplash.com/photo-1553279768-865429fa0078', 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716'],
    'Apple': ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2'],
    'Banana': ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e', 'https://images.unsplash.com/photo-1603833665858-e61d17a86224'],
    'Orange': ['https://images.unsplash.com/photo-1580052614034-c55d20bfee3b', 'https://images.unsplash.com/photo-1547514701-42782101795e'],
    'Grapes': ['https://images.unsplash.com/photo-1599819177795-d9eb531d8f98', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f'],
    'Pomegranate': ['https://images.unsplash.com/photo-1615485500834-bc10199bc727', 'https://images.unsplash.com/photo-1590301157890-4810ed352733'],
    'Papaya': ['https://images.unsplash.com/photo-1617112848923-cc2234396a8d', 'https://images.unsplash.com/photo-1526318472351-c75fcf070305']
  },
  dairy: {
    'Fresh Milk': ['https://images.unsplash.com/photo-1550583724-b2692b85b150', 'https://images.unsplash.com/photo-1563636619-e9143da7973b'],
    'Paneer': ['https://images.unsplash.com/photo-1628088062854-d1870b4553da', 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c'],
    'Ghee': ['https://images.unsplash.com/photo-1628088062854-d1870b4553da', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d'],
    'Yogurt': ['https://images.unsplash.com/photo-1488477181946-6428a0291777', 'https://images.unsplash.com/photo-1571212515416-fca2ce42c9f5']
  },
  pulses: {
    'Chickpeas': ['https://images.unsplash.com/photo-1610440042657-612c34d95e9f', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41'],
    'Lentils': ['https://images.unsplash.com/photo-1596797038530-2c107229654b', 'https://images.unsplash.com/photo-1607672632458-9eb56696346b'],
    'Green Gram': ['https://images.unsplash.com/photo-1610440042657-612c34d95e9f', 'https://images.unsplash.com/photo-1607672632458-9eb56696346b'],
    'Black Gram': ['https://images.unsplash.com/photo-1596797038530-2c107229654b', 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f'],
    'Pigeon Peas': ['https://images.unsplash.com/photo-1626200419199-391ae4be7a41', 'https://images.unsplash.com/photo-1596797038530-2c107229654b']
  },
  spices: {
    'Turmeric': ['https://images.unsplash.com/photo-1615485500834-bc10199bc727', 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398'],
    'Cumin': ['https://images.unsplash.com/photo-1596040033229-a0b3b46fe6b6', 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398'],
    'Coriander': ['https://images.unsplash.com/photo-1599639957043-f3aa5c986398', 'https://images.unsplash.com/photo-1596040033229-a0b3b46fe6b6'],
    'Black Pepper': ['https://images.unsplash.com/photo-1599639957043-f3aa5c986398', 'https://images.unsplash.com/photo-1615485500834-bc10199bc727'],
    'Cardamom': ['https://images.unsplash.com/photo-1596040033229-a0b3b46fe6b6', 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398']
  }
};

// Product templates and data
const productTemplates = {
  grains: [
    { name: 'Basmati Rice', variety: 'Pusa Basmati 1121', subCategory: 'Long Grain Rice' },
    { name: 'Wheat', variety: 'HD-2967', subCategory: 'Durum Wheat' },
    { name: 'Corn', variety: 'Sweet Corn', subCategory: 'Yellow Corn' },
    { name: 'Millet', variety: 'Pearl Millet', subCategory: 'Bajra' },
    { name: 'Sorghum', variety: 'White Sorghum', subCategory: 'Jowar' }
  ],
  vegetables: [
    { name: 'Tomato', variety: 'Roma', subCategory: 'Cherry Tomato' },
    { name: 'Potato', variety: 'Russet', subCategory: 'White Potato' },
    { name: 'Onion', variety: 'Red Onion', subCategory: 'Bulb Onion' },
    { name: 'Carrot', variety: 'Nantes', subCategory: 'Orange Carrot' },
    { name: 'Cabbage', variety: 'Green Cabbage', subCategory: 'Round Cabbage' },
    { name: 'Cauliflower', variety: 'Snowball', subCategory: 'White Cauliflower' },
    { name: 'Spinach', variety: 'Savoy', subCategory: 'Leaf Spinach' },
    { name: 'Bell Pepper', variety: 'California Wonder', subCategory: 'Green Pepper' }
  ],
  fruits: [
    { name: 'Mango', variety: 'Alphonso', subCategory: 'Indian Mango' },
    { name: 'Apple', variety: 'Fuji', subCategory: 'Red Apple' },
    { name: 'Banana', variety: 'Cavendish', subCategory: 'Yellow Banana' },
    { name: 'Orange', variety: 'Valencia', subCategory: 'Sweet Orange' },
    { name: 'Grapes', variety: 'Thompson Seedless', subCategory: 'Green Grapes' },
    { name: 'Pomegranate', variety: 'Wonderful', subCategory: 'Red Pomegranate' },
    { name: 'Papaya', variety: 'Red Lady', subCategory: 'Hawaiian Papaya' }
  ],
  dairy: [
    { name: 'Fresh Milk', variety: 'Full Cream', subCategory: 'Cow Milk' },
    { name: 'Paneer', variety: 'Fresh Paneer', subCategory: 'Cottage Cheese' },
    { name: 'Ghee', variety: 'Pure Ghee', subCategory: 'Clarified Butter' },
    { name: 'Yogurt', variety: 'Greek Yogurt', subCategory: 'Plain Yogurt' }
  ],
  pulses: [
    { name: 'Chickpeas', variety: 'Kabuli Chana', subCategory: 'White Chickpeas' },
    { name: 'Lentils', variety: 'Masoor Dal', subCategory: 'Red Lentils' },
    { name: 'Green Gram', variety: 'Moong Dal', subCategory: 'Split Green Gram' },
    { name: 'Black Gram', variety: 'Urad Dal', subCategory: 'Split Black Gram' },
    { name: 'Pigeon Peas', variety: 'Toor Dal', subCategory: 'Yellow Pigeon Peas' }
  ],
  spices: [
    { name: 'Turmeric', variety: 'Alleppey Finger', subCategory: 'Turmeric Powder' },
    { name: 'Cumin', variety: 'Jeera', subCategory: 'Cumin Seeds' },
    { name: 'Coriander', variety: 'Dhaniya', subCategory: 'Coriander Seeds' },
    { name: 'Black Pepper', variety: 'Malabar', subCategory: 'Whole Peppercorns' },
    { name: 'Cardamom', variety: 'Green Cardamom', subCategory: 'Elaichi' }
  ]
};

const locations = [
  { state: 'Punjab', city: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { state: 'Haryana', city: 'Karnal', lat: 29.6857, lng: 76.9905 },
  { state: 'Uttar Pradesh', city: 'Meerut', lat: 28.9845, lng: 77.7064 },
  { state: 'Maharashtra', city: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { state: 'Gujarat', city: 'Anand', lat: 22.5645, lng: 72.9289 },
  { state: 'Rajasthan', city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { state: 'Karnataka', city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { state: 'Tamil Nadu', city: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { state: 'Andhra Pradesh', city: 'Guntur', lat: 16.3067, lng: 80.4365 },
  { state: 'West Bengal', city: 'Kolkata', lat: 22.5726, lng: 88.3639 }
];

const certifications = ['Organic Certified', 'FSSAI Approved', 'ISO 22000', 'GlobalGAP', 'Fair Trade Certified'];
const farmingMethods = ['organic', 'conventional', 'hydroponic', 'greenhouse'];
const grades = ['A', 'B', 'C'];
const units = { grains: 'quintal', vegetables: 'kg', fruits: 'kg', dairy: 'liter', pulses: 'kg', spices: 'kg' };

async function seedAllData() {
  try {
    console.log('🌱 Starting comprehensive database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain');
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Create Users (Farmers, Distributors, Retailers, Consumers)
    console.log('👥 Creating users...');
    const users = await createUsers();
    console.log(`✅ Created ${users.length} users\n`);

    // Step 2: Get or Create Products
    console.log('📦 Checking products...');
    let products = await Product.find({ isActive: true }).limit(200);
    if (products.length < 50) {
      console.log('   Creating new products...');
      const newProducts = await createProducts(users.farmers);
      products = [...products, ...newProducts];
    }
    console.log(`✅ Using ${products.length} products\n`);

    // Step 3: Create Orders
    console.log('🛒 Creating orders...');
    const orders = await createOrders(users, products);
    console.log(`✅ Created ${orders.length} orders\n`);

    // Step 4: Create Reviews
    console.log('⭐ Creating reviews...');
    const reviews = await createReviews(users, products, orders);
    console.log(`✅ Created ${reviews.length} reviews\n`);

    // Step 5: Create Wishlists
    console.log('❤️  Creating wishlists...');
    const wishlists = await createWishlists(users, products);
    console.log(`✅ Created ${wishlists.length} wishlist entries\n`);

    // Step 6: Create Bulk Pricing
    console.log('💰 Creating bulk pricing...');
    const bulkPricing = await createBulkPricing(products);
    console.log(`✅ Created ${bulkPricing.length} bulk pricing tiers\n`);

    // Step 7: Create Delivery Updates
    console.log('🚚 Creating delivery updates...');
    const deliveryUpdates = await createDeliveryUpdates(orders);
    console.log(`✅ Created ${deliveryUpdates.length} delivery updates\n`);

    // Print summary
    console.log('\n📊 SEEDING SUMMARY');
    console.log('==================');
    console.log(`Users: ${users.all.length}`);
    console.log(`  - Farmers: ${users.farmers.length}`);
    console.log(`  - Distributors: ${users.distributors.length}`);
    console.log(`  - Retailers: ${users.retailers.length}`);
    console.log(`  - Consumers: ${users.consumers.length}`);
    console.log(`Products: ${products.length}`);
    console.log(`Orders: ${orders.length}`);
    console.log(`Reviews: ${reviews.length}`);
    console.log(`Wishlists: ${wishlists.length}`);
    console.log(`Bulk Pricing: ${bulkPricing.length}`);
    console.log(`Delivery Updates: ${deliveryUpdates.length}`);
    console.log('\n🎉 All data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

async function createUsers() {
  const farmerNames = [
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Devi',
    'Ramesh Singh', 'Lakshmi Reddy', 'Vijay Yadav', 'Anita Verma',
    'Suresh Gupta', 'Meena Joshi', 'Prakash Rao', 'Kavita Nair'
  ];

  const distributorNames = [
    'Agrotech Distributors', 'Fresh Farm Supply', 'Green Valley Logistics',
    'Farm Direct Distribution', 'Organic Wholesale Hub'
  ];

  const retailerNames = [
    'Fresh Mart', 'Organic Store', 'Farm Fresh Retail', 'Green Grocers',
    'Nature\'s Basket', 'Healthy Harvest Store'
  ];

  const consumerNames = [
    'Arjun Mehta', 'Sneha Kapoor', 'Rahul Verma', 'Pooja Singh',
    'Vikram Patel', 'Anjali Sharma', 'Karan Malhotra', 'Divya Reddy',
    'Sanjay Kumar', 'Neha Gupta'
  ];

  const farmers = [];
  const distributors = [];
  const retailers = [];
  const consumers = [];

  // Create Farmers
  for (const name of farmerNames) {
    const location = randomElement(locations);
    const farmer = await User.create({
      walletAddress: generateEthAddress(),
      roles: ['FARMER'],
      primaryRole: 'FARMER',
      profile: {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@farmchain.com`,
        phone: `+91${randomNumber(7000000000, 9999999999)}`,
        businessName: `${name}'s Farm`,
        location: {
          address: `${location.city}, ${location.state}`,
          city: location.city,
          state: location.state,
          country: 'India',
          pincode: `${randomNumber(100000, 999999)}`,
          type: 'Point',
          coordinates: [location.lng, location.lat]
        }
      },
      verification: {
        isVerified: true,
        verifiedAt: new Date(),
        kycStatus: 'approved',
        verificationLevel: 2
      },
      businessInfo: {
        farmSize: { value: randomNumber(5, 50), unit: 'acres' },
        farmingType: randomElement(['organic', 'conventional', 'mixed']),
        establishedYear: randomNumber(2000, 2020)
      },
      stats: {
        averageRating: randomFloat(3.5, 5.0, 1),
        ratingCount: randomNumber(5, 50)
      },
      status: { isActive: true, isSuspended: false }
    });
    farmers.push(farmer);
  }

  // Create Distributors
  for (const name of distributorNames) {
    const location = randomElement(locations);
    const distributor = await User.create({
      walletAddress: generateEthAddress(),
      roles: ['DISTRIBUTOR'],
      primaryRole: 'DISTRIBUTOR',
      profile: {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@farmchain.com`,
        phone: `+91${randomNumber(7000000000, 9999999999)}`,
        businessName: name,
        businessType: 'distributor',
        location: {
          address: `${location.city}, ${location.state}`,
          city: location.city,
          state: location.state,
          country: 'India',
          pincode: `${randomNumber(100000, 999999)}`,
          type: 'Point',
          coordinates: [location.lng, location.lat]
        }
      },
      verification: {
        isVerified: true,
        verifiedAt: new Date(),
        kycStatus: 'approved',
        verificationLevel: 2
      },
      stats: {
        averageRating: randomFloat(3.8, 5.0, 1),
        ratingCount: randomNumber(10, 100)
      },
      status: { isActive: true, isSuspended: false }
    });
    distributors.push(distributor);
  }

  // Create Retailers
  for (const name of retailerNames) {
    const location = randomElement(locations);
    const retailer = await User.create({
      walletAddress: generateEthAddress(),
      roles: ['RETAILER'],
      primaryRole: 'RETAILER',
      profile: {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@farmchain.com`,
        phone: `+91${randomNumber(7000000000, 9999999999)}`,
        businessName: name,
        businessType: 'retail',
        location: {
          address: `${location.city}, ${location.state}`,
          city: location.city,
          state: location.state,
          country: 'India',
          pincode: `${randomNumber(100000, 999999)}`,
          type: 'Point',
          coordinates: [location.lng, location.lat]
        }
      },
      verification: {
        isVerified: true,
        verifiedAt: new Date(),
        kycStatus: 'approved',
        verificationLevel: 2
      },
      stats: {
        averageRating: randomFloat(4.0, 5.0, 1),
        ratingCount: randomNumber(20, 150)
      },
      status: { isActive: true, isSuspended: false }
    });
    retailers.push(retailer);
  }

  // Create Consumers
  for (const name of consumerNames) {
    const location = randomElement(locations);
    const consumer = await User.create({
      walletAddress: generateEthAddress(),
      roles: ['CONSUMER'],
      primaryRole: 'CONSUMER',
      profile: {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@farmchain.com`,
        phone: `+91${randomNumber(7000000000, 9999999999)}`,
        location: {
          address: `${location.city}, ${location.state}`,
          city: location.city,
          state: location.state,
          country: 'India',
          pincode: `${randomNumber(100000, 999999)}`,
          type: 'Point',
          coordinates: [location.lng, location.lat]
        }
      },
      verification: {
        isVerified: randomElement([true, false]),
        kycStatus: randomElement(['approved', 'pending', 'not_started']),
        verificationLevel: randomNumber(0, 2)
      },
      status: { isActive: true, isSuspended: false }
    });
    consumers.push(consumer);
  }

  const allUsers = [...farmers, ...distributors, ...retailers, ...consumers];
  console.log(`   Farmers: ${farmers.length}, Distributors: ${distributors.length}, Retailers: ${retailers.length}, Consumers: ${consumers.length}`);
  
  return {
    farmers,
    distributors,
    retailers,
    consumers,
    all: allUsers
  };
}

async function createProducts(farmers) {
  const products = [];
  // Start from a higher number to avoid conflicts
  let productCounter = 2000 + randomNumber(0, 1000);

  for (const [category, items] of Object.entries(productTemplates)) {
    for (const item of items) {
      const numProducts = randomNumber(2, 4);

      for (let i = 0; i < numProducts; i++) {
        const farmer = randomElement(farmers);
        const location = randomElement(locations);
        const harvestDate = randomDate(new Date(2024, 0, 1), new Date());
        const sowingDate = new Date(harvestDate);
        sowingDate.setMonth(sowingDate.getMonth() - randomNumber(3, 6));

        const baseQuantity = category === 'grains' ? randomNumber(50, 500) :
                            category === 'dairy' ? randomNumber(100, 1000) :
                            randomNumber(100, 2000);
        const soldQuantity = Math.floor(baseQuantity * randomFloat(0, 0.4));
        const basePrice = category === 'grains' ? randomNumber(2000, 5000) :
                         category === 'vegetables' ? randomNumber(20, 80) :
                         category === 'fruits' ? randomNumber(40, 150) :
                         category === 'dairy' ? randomNumber(50, 100) :
                         category === 'pulses' ? randomNumber(80, 200) :
                         randomNumber(200, 800);

        // Get category-specific images
        const categoryImages = productImages[category] || {};
        const itemImages = categoryImages[item.name] || [
          'https://images.unsplash.com/photo-1560493676-04071c5f467b',
          'https://images.unsplash.com/photo-1542838132-92c53300491e'
        ];

        const product = await Product.create({
          productId: `PROD-${productCounter++}`,
          farmer: farmer._id,
          farmerWallet: farmer.walletAddress,
          basicInfo: {
            name: item.name,
            category,
            subCategory: item.subCategory,
            variety: item.variety,
            description: `Premium quality ${item.name} (${item.variety}) from certified farms. Fresh, organic, and sustainably grown.`,
            images: itemImages,
            certifications: [randomElement(certifications), randomElement(certifications)]
          },
          farmDetails: {
            farmName: farmer.profile.businessName,
            farmLocation: {
              address: `${location.city}, ${location.state}, India`,
              coordinates: { latitude: location.lat, longitude: location.lng }
            },
            sowingDate,
            harvestDate,
            farmingMethod: randomElement(farmingMethods)
          },
          quantity: {
            available: baseQuantity - soldQuantity,
            sold: soldQuantity,
            unit: units[category]
          },
          pricing: {
            basePrice,
            currentPrice: basePrice * randomFloat(0.9, 1.1),
            currency: 'INR'
          },
          quality: {
            grade: randomElement(grades),
            aiQualityScore: randomNumber(75, 98)
          },
          supplyChain: {
            currentOwner: farmer._id,
            currentOwnerWallet: farmer.walletAddress,
            status: randomElement(['harvested', 'in_transit', 'at_warehouse']),
            location: { latitude: location.lat, longitude: location.lng },
            lastUpdated: new Date()
          },
          blockchain: {
            contractAddress: generateEthAddress(),
            registrationTxHash: generateTxHash()
          },
          analytics: {
            views: randomNumber(10, 500),
            orders: randomNumber(0, 20)
          },
          isActive: true
        });

        products.push(product);
      }
    }
  }

  return products;
}

async function createOrders(users, products) {
  const orders = [];
  const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods = ['crypto', 'escrow', 'cod', 'online'];

  // Create 50-100 orders
  const numOrders = randomNumber(50, 100);

  for (let i = 0; i < numOrders; i++) {
    const product = randomElement(products);
    const buyer = randomElement([...users.distributors, ...users.retailers, ...users.consumers]);
    const seller = await User.findById(product.farmer);
    const quantity = randomNumber(1, Math.min(50, product.quantity.available));
    const pricePerUnit = product.pricing.currentPrice;
    const totalAmount = quantity * pricePerUnit;
    const status = randomElement(orderStatuses);
    const createdDate = randomDate(new Date(2024, 0, 1), new Date());

    const order = await Order.create({
      orderId: `ORD-${Date.now()}-${randomNumber(1000, 9999)}`,
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
          street: `${randomNumber(1, 999)} Main Street`,
          city: buyer.profile.location.city,
          state: buyer.profile.location.state,
          zipCode: buyer.profile.location.pincode,
          country: 'India'
        },
        expectedDate: new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      },
      status,
      payment: {
        method: randomElement(paymentMethods),
        status: status === 'cancelled' ? 'refunded' : status === 'pending' ? 'pending' : 'completed',
        transactionHash: status !== 'pending' ? generateTxHash() : undefined,
        paidAt: status !== 'pending' ? createdDate : undefined
      },
      blockchain: {
        orderTxHash: generateTxHash()
      },
      createdAt: createdDate
    });

    orders.push(order);
  }

  return orders;
}

async function createReviews(users, products, orders) {
  const reviews = [];
  const reviewTexts = [
    'Excellent quality product! Very fresh and well-packaged.',
    'Good product, delivered on time. Satisfied with the purchase.',
    'Amazing quality! Will definitely order again.',
    'Product quality is decent. Could be better.',
    'Outstanding! Best quality I have received so far.',
    'Fresh and organic as promised. Highly recommended!',
    'Good value for money. Product matches description.',
    'Superb quality! Exceeded my expectations.'
  ];

  // Create reviews for 60% of delivered orders
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const numReviews = Math.floor(deliveredOrders.length * 0.6);

  for (let i = 0; i < numReviews; i++) {
    const order = deliveredOrders[i];
    const product = await Product.findById(order.product);
    const overallRating = randomNumber(3, 5);

    const review = await Review.create({
      orderId: order._id,
      productId: product._id,
      sellerId: order.seller,
      reviewerId: order.buyer,
      ratings: {
        overall: overallRating,
        quality: randomNumber(3, 5),
        delivery: randomNumber(3, 5),
        communication: randomNumber(3, 5),
        valueForMoney: randomNumber(3, 5)
      },
      title: overallRating >= 4 ? 'Great Product!' : 'Good Product',
      comment: randomElement(reviewTexts),
      media: overallRating >= 4 ? [{
        type: 'image',
        url: `https://images.unsplash.com/photo-${randomNumber(1500000000000, 1700000000000)}`,
        caption: 'Product photo'
      }] : [],
      verifiedPurchase: true,
      helpfulCount: randomNumber(0, 20),
      notHelpfulCount: randomNumber(0, 5),
      status: 'approved',
      createdAt: new Date(order.createdAt.getTime() + randomNumber(1, 7) * 24 * 60 * 60 * 1000)
    });

    reviews.push(review);
  }

  return reviews;
}

async function createWishlists(users, products) {
  const wishlists = [];

  // Create wishlists for consumers and retailers
  const buyers = [...users.consumers, ...users.retailers];

  for (const buyer of buyers) {
    const numItems = randomNumber(3, 10);
    const selectedProducts = [];

    for (let i = 0; i < numItems; i++) {
      const product = randomElement(products);
      if (!selectedProducts.find(p => p._id.equals(product._id))) {
        selectedProducts.push(product);
      }
    }

    const wishlist = await Wishlist.create({
      userId: buyer._id,
      items: selectedProducts.map(p => ({
        productId: p._id,
        addedAt: randomDate(new Date(2024, 0, 1), new Date()),
        notes: randomElement(['', 'Need to order soon', 'For next season', 'Bulk order planned'])
      }))
    });

    wishlists.push(wishlist);
  }

  return wishlists;
}

async function createBulkPricing(products) {
  const bulkPricingList = [];

  // Create bulk pricing for 70% of products
  const numProducts = Math.floor(products.length * 0.7);

  for (let i = 0; i < numProducts; i++) {
    const product = products[i];
    
    // Skip if bulk pricing already exists for this product
    const existing = await BulkPricing.findOne({ productId: product._id });
    if (existing) continue;

    const bulkPricing = await BulkPricing.create({
      productId: product._id,
      sellerId: product.farmer,
      tiers: [
        {
          minQuantity: 10,
          maxQuantity: 49,
          discountPercentage: 5,
          pricePerUnit: product.pricing.currentPrice * 0.95
        },
        {
          minQuantity: 50,
          maxQuantity: 99,
          discountPercentage: 10,
          pricePerUnit: product.pricing.currentPrice * 0.90
        },
        {
          minQuantity: 100,
          maxQuantity: null,
          discountPercentage: 15,
          pricePerUnit: product.pricing.currentPrice * 0.85
        }
      ],
      isActive: true
    });

    bulkPricingList.push(bulkPricing);
  }

  return bulkPricingList;
}

async function createDeliveryUpdates(orders) {
  const deliveryUpdates = [];
  const updateStatuses = ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
  const updateMessages = {
    picked_up: 'Order picked up from warehouse',
    in_transit: 'Package is in transit',
    out_for_delivery: 'Out for delivery',
    delivered: 'Successfully delivered'
  };

  // Create delivery updates for shipped and delivered orders
  const shippedOrders = orders.filter(o => ['shipped', 'delivered'].includes(o.status));

  for (const order of shippedOrders) {
    const numUpdates = order.status === 'delivered' ? randomNumber(3, 4) : randomNumber(1, 2);
    let currentDate = new Date(order.createdAt);

    for (let i = 0; i < numUpdates; i++) {
      currentDate = new Date(currentDate.getTime() + randomNumber(1, 3) * 24 * 60 * 60 * 1000);
      const status = updateStatuses[Math.min(i, updateStatuses.length - 1)];
      const location = randomElement(locations);

      const update = await DeliveryUpdate.create({
        orderId: order._id,
        status,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat], // [longitude, latitude]
          address: `${location.city}, ${location.state}`
        },
        message: updateMessages[status],
        estimatedDelivery: order.delivery.expectedDate,
        carrierInfo: {
          name: randomElement(['BlueDart', 'DTDC', 'Delhivery', 'India Post']),
          trackingNumber: `TRK${randomNumber(100000000, 999999999)}`,
          contactNumber: `+91${randomNumber(7000000000, 9999999999)}`
        },
        timestamp: currentDate
      });

      deliveryUpdates.push(update);
    }
  }

  return deliveryUpdates;
}

// Run the seeder
if (require.main === module) {
  seedAllData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedAllData };
