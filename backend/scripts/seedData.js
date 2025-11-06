/**
 * Comprehensive Seed Data Generator for FarmChain
 * Generates realistic synthetic data for all models
 */

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// Sample data arrays for realistic generation
const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', coordinates: [19.0760, 72.8777] },
  { city: 'Delhi', state: 'Delhi', coordinates: [28.7041, 77.1025] },
  { city: 'Bangalore', state: 'Karnataka', coordinates: [12.9716, 77.5946] },
  { city: 'Hyderabad', state: 'Telangana', coordinates: [17.3850, 78.4867] },
  { city: 'Chennai', state: 'Tamil Nadu', coordinates: [13.0827, 80.2707] },
  { city: 'Kolkata', state: 'West Bengal', coordinates: [22.5726, 88.3639] },
  { city: 'Pune', state: 'Maharashtra', coordinates: [18.5204, 73.8567] },
  { city: 'Ahmedabad', state: 'Gujarat', coordinates: [23.0225, 72.5714] },
  { city: 'Jaipur', state: 'Rajasthan', coordinates: [26.9124, 75.7873] },
  { city: 'Lucknow', state: 'Uttar Pradesh', coordinates: [26.8467, 80.9462] },
];

const PRODUCT_CATEGORIES = {
  vegetables: ['Tomato', 'Potato', 'Onion', 'Carrot', 'Cabbage', 'Cauliflower', 'Brinjal', 'Okra', 'Spinach', 'Beans'],
  fruits: ['Apple', 'Banana', 'Mango', 'Orange', 'Grapes', 'Watermelon', 'Papaya', 'Guava', 'Pomegranate', 'Strawberry'],
  grains: ['Rice', 'Wheat', 'Corn', 'Barley', 'Millet', 'Sorghum', 'Oats', 'Quinoa', 'Rye', 'Buckwheat'],
  pulses: ['Chickpeas', 'Lentils', 'Black Gram', 'Green Gram', 'Kidney Beans', 'Pigeon Peas', 'Soybeans', 'Peas', 'Peanuts'],
  dairy: ['Milk', 'Butter', 'Cheese', 'Yogurt', 'Paneer', 'Ghee', 'Cream', 'Buttermilk', 'Curd'],
  spices: ['Turmeric', 'Chili', 'Coriander', 'Cumin', 'Cardamom', 'Black Pepper', 'Cinnamon', 'Cloves', 'Ginger', 'Garlic']
};

const FARMING_METHODS = ['organic', 'conventional', 'hydroponic', 'greenhouse'];
const ORDER_STATUSES = ['confirmed', 'payment_completed', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
const PAYMENT_METHODS = ['crypto', 'escrow', 'cod', 'online'];
const CERTIFICATIONS = ['Organic Certification', 'ISO 9001', 'FSSAI', 'Good Agricultural Practices (GAP)', 'Fair Trade'];

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateWalletAddress() {
  return '0x' + Array.from({length: 40}, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function generateTransactionHash() {
  return '0x' + Array.from({length: 64}, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function pastDate(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// User generation
function generateUsers(count, role) {
  const users = [];

  for (let i = 0; i < count; i++) {
    const location = randomElement(INDIAN_CITIES);
    const walletAddress = generateWalletAddress();

    const user = {
      walletAddress: walletAddress,
      roles: [role],
      primaryRole: role,
      permissions: [],
      verification: {
        isVerified: randomFloat(0, 1) > 0.3, // 70% verified
        verifiedAt: randomFloat(0, 1) > 0.3 ? pastDate(randomInt(10, 365)) : null,
        kycStatus: randomFloat(0, 1) > 0.4 ? 'approved' : 'pending',
        documents: randomFloat(0, 1) > 0.4 ? ['id_proof', 'address_proof'] : []
      },
      profile: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: '+91' + randomInt(7000000000, 9999999999),
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        location: {
          address: faker.location.streetAddress(),
          city: location.city,
          state: location.state,
          country: 'India',
          zipCode: randomInt(100000, 999999).toString(),
          coordinates: {
            latitude: location.coordinates[0] + randomFloat(-0.5, 0.5),
            longitude: location.coordinates[1] + randomFloat(-0.5, 0.5)
          }
        }
      },
      businessInfo: role !== 'CONSUMER' ? {
        businessName: role === 'FARMER' ? `${faker.person.lastName()} Farms` :
                      role === 'DISTRIBUTOR' ? `${faker.company.name()} Distribution` :
                      `${faker.company.name()} Store`,
        gst: `22AAAAA${randomInt(1000, 9999)}A1Z${randomInt(1, 9)}`,
        pan: `AAAAA${randomInt(1000, 9999)}A`,
        businessType: role === 'FARMER' ? 'farm' : role === 'DISTRIBUTOR' ? 'distributor' : 'retail',
        registrationNumber: `REG${randomInt(100000, 999999)}`,
        establishedYear: randomInt(2010, 2023)
      } : undefined,
      rating: {
        average: randomFloat(3.5, 5),
        count: randomInt(10, 500),
        breakdown: {
          5: randomInt(50, 300),
          4: randomInt(30, 150),
          3: randomInt(10, 80),
          2: randomInt(0, 30),
          1: randomInt(0, 20)
        }
      },
      statistics: {
        totalOrders: randomInt(5, 200),
        completedOrders: randomInt(5, 180),
        totalRevenue: randomFloat(10000, 1000000, 2),
        totalSpent: role === 'CONSUMER' ? randomFloat(5000, 100000, 2) : 0,
        productsListed: role === 'FARMER' ? randomInt(5, 50) : 0,
        productsDistributed: role === 'DISTRIBUTOR' ? randomInt(50, 500) : 0
      },
      preferences: {
        language: 'en',
        currency: 'INR',
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        theme: randomElement(['light', 'dark', 'auto'])
      },
      isActive: true,
      lastLogin: pastDate(randomInt(0, 30)),
      createdAt: pastDate(randomInt(30, 730)),
      updatedAt: pastDate(randomInt(0, 30))
    };

    users.push(user);
  }

  return users;
}

// Product generation
function generateProducts(farmers, count) {
  const products = [];

  for (let i = 0; i < count; i++) {
    const farmer = randomElement(farmers);
    const category = randomElement(Object.keys(PRODUCT_CATEGORIES));
    const productName = randomElement(PRODUCT_CATEGORIES[category]);
    const location = randomElement(INDIAN_CITIES);
    const farmingMethod = randomElement(FARMING_METHODS);
    const isOrganic = farmingMethod === 'organic';

    const basePrice = category === 'spices' ? randomFloat(200, 1000) :
                     category === 'fruits' ? randomFloat(30, 150) :
                     category === 'dairy' ? randomFloat(40, 200) :
                     category === 'grains' ? randomFloat(20, 80) :
                     category === 'pulses' ? randomFloat(50, 150) :
                     randomFloat(15, 100);

    const product = {
      productId: `PROD${Date.now()}${i}`,
      blockchainTxHash: generateTransactionHash(),
      farmer: farmer._id,
      farmerWallet: farmer.walletAddress,
      basicInfo: {
        name: productName,
        category: category,
        subCategory: randomElement(['Grade A', 'Premium', 'Standard', 'Export Quality']),
        variety: faker.lorem.word(),
        description: `Fresh ${productName.toLowerCase()} grown using ${farmingMethod} methods. ${isOrganic ? 'Certified organic produce with no pesticides.' : 'High-quality produce following best agricultural practices.'}`,
        images: [
          faker.image.url({ category: 'food' }),
          faker.image.url({ category: 'food' }),
          faker.image.url({ category: 'food' })
        ],
        certifications: isOrganic ? randomElements(CERTIFICATIONS, randomInt(2, 4)) : randomElements(CERTIFICATIONS, randomInt(0, 2))
      },
      farmDetails: {
        farmName: farmer.businessInfo?.businessName || `${faker.person.lastName()} Farms`,
        farmLocation: {
          address: farmer.profile.location.address,
          coordinates: {
            latitude: location.coordinates[0] + randomFloat(-0.5, 0.5),
            longitude: location.coordinates[1] + randomFloat(-0.5, 0.5)
          }
        },
        sowingDate: pastDate(randomInt(60, 180)),
        harvestDate: pastDate(randomInt(0, 60)),
        farmingMethod: farmingMethod,
        pesticidesUsed: !isOrganic ? [{
          name: randomElement(['Pyrethrin', 'Neem Oil', 'Malathion']),
          quantity: `${randomInt(1, 5)}L`,
          date: pastDate(randomInt(30, 90))
        }] : [],
        fertilizersUsed: [{
          name: randomElement(['NPK', 'Urea', 'Compost', 'Vermicompost']),
          quantity: `${randomInt(10, 100)}kg`,
          date: pastDate(randomInt(30, 120))
        }]
      },
      quantity: {
        available: randomInt(100, 5000),
        sold: randomInt(0, 500),
        unit: category === 'dairy' ? 'liter' : ['kg', 'quintal'][randomInt(0, 1)]
      },
      pricing: {
        basePrice: basePrice,
        currentPrice: basePrice * randomFloat(0.9, 1.15),
        currency: 'INR',
        priceHistory: [{
          price: basePrice * 1.1,
          date: pastDate(randomInt(30, 90)),
          reason: 'Market adjustment'
        }]
      },
      quality: {
        grade: randomElement(['A', 'B', 'C']),
        moistureContent: randomFloat(5, 15),
        defects: randomFloat(0, 5),
        aiQualityScore: randomFloat(70, 98),
        qualityReports: [{
          reportType: 'Lab Test',
          reportHash: generateTransactionHash(),
          date: pastDate(randomInt(10, 60)),
          inspector: faker.person.fullName()
        }]
      },
      supplyChain: {
        currentOwner: farmer._id,
        currentOwnerWallet: farmer.walletAddress,
        status: randomElement(['harvested', 'at_warehouse', 'sold']),
        location: {
          latitude: location.coordinates[0],
          longitude: location.coordinates[1],
          address: farmer.profile.location.address
        },
        temperature: randomFloat(15, 30),
        humidity: randomFloat(40, 80),
        lastUpdated: pastDate(randomInt(0, 7))
      },
      batchInfo: {
        batchNumber: `BATCH${randomInt(1000, 9999)}`,
        totalBatches: randomInt(1, 10),
        batchSize: randomInt(100, 1000)
      },
      blockchain: {
        contractAddress: generateWalletAddress(),
        tokenId: randomInt(1, 100000).toString(),
        registrationTxHash: generateTransactionHash(),
        registrationBlock: randomInt(1000000, 9999999),
        lastUpdateTxHash: generateTransactionHash(),
        lastUpdateBlock: randomInt(1000000, 9999999)
      },
      analytics: {
        views: randomInt(50, 2000),
        orders: randomInt(5, 200),
        revenue: randomFloat(5000, 500000, 2)
      },
      isActive: randomFloat(0, 1) > 0.1, // 90% active
      createdAt: pastDate(randomInt(30, 365)),
      updatedAt: pastDate(randomInt(0, 30))
    };

    products.push(product);
  }

  return products;
}

// Order generation
function generateOrders(products, buyers, sellers, count) {
  const orders = [];

  for (let i = 0; i < count; i++) {
    const product = randomElement(products);
    const buyer = randomElement(buyers);
    const seller = randomElement(sellers);
    const status = randomElement(ORDER_STATUSES);
    const quantity = randomInt(1, 100);
    const pricePerUnit = product.pricing.currentPrice;
    const totalAmount = quantity * pricePerUnit;
    const location = randomElement(INDIAN_CITIES);

    const order = {
      orderId: `ORD${Date.now()}${i}`,
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
        quantity: quantity,
        unit: product.quantity.unit,
        pricePerUnit: pricePerUnit,
        totalAmount: totalAmount,
        currency: 'INR'
      },
      delivery: {
        address: {
          street: buyer.profile.location.address,
          city: location.city,
          state: location.state,
          zipCode: randomInt(100000, 999999).toString(),
          country: 'India'
        },
        location: {
          type: 'Point',
          coordinates: location.coordinates
        },
        expectedDate: new Date(Date.now() + randomInt(3, 15) * 24 * 60 * 60 * 1000),
        actualDate: status === 'delivered' ? pastDate(randomInt(0, 10)) : null,
        trackingNumber: `TRK${randomInt(1000000, 9999999)}`,
        carrier: randomElement(['BlueDart', 'DTDC', 'DHL', 'FedEx', 'India Post'])
      },
      status: status,
      statusHistory: [
        {
          status: 'pending',
          timestamp: pastDate(randomInt(15, 45)),
          notes: 'Order placed'
        },
        {
          status: 'confirmed',
          timestamp: pastDate(randomInt(14, 44)),
          notes: 'Order confirmed by seller'
        },
        ...(status !== 'confirmed' ? [{
          status: status,
          timestamp: pastDate(randomInt(0, 30)),
          notes: `Order ${status.replace('_', ' ')}`
        }] : [])
      ],
      payment: {
        paymentId: `PAY${randomInt(100000, 999999)}`,
        method: randomElement(PAYMENT_METHODS),
        status: ['delivered', 'in_transit', 'shipped'].includes(status) ? 'completed' : 'pending',
        transactionHash: generateTransactionHash(),
        paidAt: pastDate(randomInt(10, 40)),
        refundedAt: null
      },
      blockchain: {
        contractAddress: generateWalletAddress(),
        orderTxHash: generateTransactionHash(),
        paymentTxHash: generateTransactionHash(),
        transferTxHash: status === 'delivered' ? generateTransactionHash() : null
      },
      qualityVerification: {
        required: randomFloat(0, 1) > 0.6,
        completed: status === 'delivered' && randomFloat(0, 1) > 0.5,
        result: status === 'delivered' ? randomElement(['passed', 'passed', 'passed', 'pending']) : 'pending',
        verificationDate: status === 'delivered' ? pastDate(randomInt(0, 10)) : null,
        reportHash: status === 'delivered' ? generateTransactionHash() : null
      },
      dispute: {
        isDisputed: randomFloat(0, 1) > 0.95, // 5% disputes
        reason: null,
        status: 'open'
      },
      ratings: status === 'delivered' && randomFloat(0, 1) > 0.3 ? {
        buyerRating: {
          rating: randomInt(3, 5),
          review: faker.lorem.sentence(),
          date: pastDate(randomInt(0, 10))
        }
      } : {},
      isActive: true,
      createdAt: pastDate(randomInt(15, 60)),
      updatedAt: pastDate(randomInt(0, 10))
    };

    orders.push(order);
  }

  return orders;
}

// Review generation
function generateReviews(orders, products, count) {
  const reviews = [];
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  for (let i = 0; i < Math.min(count, deliveredOrders.length); i++) {
    const order = deliveredOrders[i];
    const product = products.find(p => p._id.toString() === order.product.toString());

    if (!product) continue;

    const overallRating = randomInt(3, 5);

    const review = {
      orderId: order._id,
      productId: product._id,
      sellerId: order.seller,
      reviewerId: order.buyer,
      ratings: {
        overall: overallRating,
        quality: randomInt(Math.max(1, overallRating - 1), 5),
        delivery: randomInt(Math.max(1, overallRating - 1), 5),
        communication: randomInt(Math.max(1, overallRating - 1), 5),
        valueForMoney: randomInt(Math.max(1, overallRating - 1), 5)
      },
      title: faker.lorem.sentence(),
      comment: faker.lorem.paragraph(),
      media: randomFloat(0, 1) > 0.7 ? [{
        type: 'image',
        url: faker.image.url({ category: 'food' })
      }] : [],
      verification: {
        isPurchaseVerified: true,
        isBlockchainVerified: randomFloat(0, 1) > 0.3,
        verificationTxHash: generateTransactionHash()
      },
      helpful: {
        count: randomInt(0, 50),
        users: []
      },
      sellerResponse: randomFloat(0, 1) > 0.6 ? {
        comment: faker.lorem.sentence(),
        respondedAt: pastDate(randomInt(0, 20))
      } : null,
      status: 'approved',
      isVisible: true,
      createdAt: pastDate(randomInt(5, 40)),
      updatedAt: pastDate(randomInt(0, 5))
    };

    reviews.push(review);
  }

  return reviews;
}

module.exports = {
  generateUsers,
  generateProducts,
  generateOrders,
  generateReviews,
  generateWalletAddress,
  generateTransactionHash
};
