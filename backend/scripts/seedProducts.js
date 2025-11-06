const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../src/models/Product.model');
const User = require('../src/models/User.model');

// Realistic product data templates
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

const farmingMethods = ['organic', 'conventional', 'hydroponic', 'greenhouse'];
const grades = ['A', 'B', 'C'];
const statuses = ['harvested', 'in_transit', 'at_warehouse'];
const units = { grains: 'quintal', vegetables: 'kg', fruits: 'kg', dairy: 'liter', pulses: 'kg', spices: 'kg' };

// Indian locations for realistic data
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

const certifications = [
  'Organic Certified',
  'FSSAI Approved',
  'ISO 22000',
  'GlobalGAP',
  'Fair Trade Certified',
  'Rainforest Alliance',
  'USDA Organic'
];

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

function generateProductDescription(name, variety, category) {
  const descriptions = {
    grains: `Premium quality ${name} (${variety}) sourced from certified farms. Rich in nutrients and carefully processed to maintain freshness.`,
    vegetables: `Fresh ${name} (${variety}) harvested at peak ripeness. Grown using sustainable farming practices with minimal pesticide use.`,
    fruits: `Delicious ${name} (${variety}) handpicked from our orchards. Sweet, juicy, and packed with natural vitamins and minerals.`,
    dairy: `Pure and fresh ${name} (${variety}) from healthy, well-fed cattle. Processed under strict hygiene standards.`,
    pulses: `High-quality ${name} (${variety}) with excellent protein content. Cleaned and sorted for premium quality.`,
    spices: `Aromatic ${name} (${variety}) with rich flavor and color. Sourced from the best growing regions.`
  };
  return descriptions[category] || `Quality ${name} (${variety}) from trusted farmers.`;
}

function generateFarmName(location) {
  const prefixes = ['Green Valley', 'Sunrise', 'Golden Harvest', 'Fresh Fields', 'Nature\'s Best', 'Organic Acres', 'Pure Land'];
  return `${randomElement(prefixes)} Farm - ${location.city}`;
}

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Get all farmers
    const farmers = await User.find({ primaryRole: 'FARMER', 'status.isActive': true });
    
    if (farmers.length === 0) {
      console.log('⚠️  No farmers found. Creating sample farmers...');
      // Create sample farmers if none exist
      const sampleFarmers = await createSampleFarmers();
      farmers.push(...sampleFarmers);
    }

    console.log(`📊 Found ${farmers.length} farmers`);

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});
    // console.log('🗑️  Cleared existing products');

    const products = [];
    let productCounter = 1000;

    // Generate products for each category
    for (const [category, items] of Object.entries(productTemplates)) {
      console.log(`\n📦 Generating ${category} products...`);
      
      for (const item of items) {
        // Create 2-5 products per item type from different farmers
        const numProducts = randomNumber(2, 5);
        
        for (let i = 0; i < numProducts; i++) {
          const farmer = randomElement(farmers);
          const location = randomElement(locations);
          const farmingMethod = randomElement(farmingMethods);
          const grade = randomElement(grades);
          const status = randomElement(statuses);
          
          // Date calculations
          const harvestDate = randomDate(new Date(2024, 0, 1), new Date());
          const sowingDate = new Date(harvestDate);
          sowingDate.setMonth(sowingDate.getMonth() - randomNumber(3, 6));
          
          // Quantity and pricing based on category
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
          
          const currentPrice = basePrice * randomFloat(0.9, 1.1);
          
          // Generate certifications (1-3 random)
          const numCerts = randomNumber(1, 3);
          const productCerts = [];
          for (let j = 0; j < numCerts; j++) {
            const cert = randomElement(certifications);
            if (!productCerts.includes(cert)) {
              productCerts.push(cert);
            }
          }
          
          // Helper to generate valid Ethereum address
          function generateEthAddress() {
            const chars = '0123456789abcdef';
            let address = '0x';
            for (let i = 0; i < 40; i++) {
              address += chars[Math.floor(Math.random() * chars.length)];
            }
            return address;
          }
          
          // Get category-specific images
          const categoryImages = productImages[category] || {};
          const itemImages = categoryImages[item.name] || [
            'https://images.unsplash.com/photo-1560493676-04071c5f467b',
            'https://images.unsplash.com/photo-1542838132-92c53300491e'
          ];

          const product = {
            productId: `PROD-${productCounter++}`,
            farmer: farmer._id,
            farmerWallet: farmer.walletAddress,
            basicInfo: {
              name: item.name,
              category: category,
              subCategory: item.subCategory,
              variety: item.variety,
              description: generateProductDescription(item.name, item.variety, category),
              images: itemImages,
              certifications: productCerts
            },
            farmDetails: {
              farmName: generateFarmName(location),
              farmLocation: {
                address: `${location.city}, ${location.state}, India`,
                coordinates: {
                  latitude: location.lat + randomFloat(-0.5, 0.5),
                  longitude: location.lng + randomFloat(-0.5, 0.5)
                }
              },
              sowingDate: sowingDate,
              harvestDate: harvestDate,
              farmingMethod: farmingMethod,
              pesticidesUsed: farmingMethod === 'organic' ? [] : [
                {
                  name: randomElement(['Neem Oil', 'Pyrethrin', 'Malathion']),
                  quantity: `${randomNumber(1, 5)} liters`,
                  date: randomDate(sowingDate, harvestDate)
                }
              ],
              fertilizersUsed: [
                {
                  name: farmingMethod === 'organic' ? 
                        randomElement(['Compost', 'Vermicompost', 'Green Manure']) :
                        randomElement(['NPK 10-26-26', 'Urea', 'DAP']),
                  quantity: `${randomNumber(10, 50)} kg`,
                  date: randomDate(sowingDate, harvestDate)
                }
              ]
            },
            quantity: {
              available: baseQuantity - soldQuantity,
              sold: soldQuantity,
              unit: units[category]
            },
            pricing: {
              basePrice: basePrice,
              currentPrice: currentPrice,
              currency: 'INR',
              priceHistory: [
                {
                  price: basePrice,
                  date: harvestDate,
                  reason: 'Initial listing'
                }
              ]
            },
            quality: {
              grade: grade,
              moistureContent: category === 'grains' ? randomFloat(10, 14) : null,
              defects: randomFloat(0, 5),
              aiQualityScore: randomNumber(75, 98),
              qualityReports: [
                {
                  reportType: 'Lab Test',
                  reportHash: (() => {
                    const chars = '0123456789abcdef';
                    let hash = '0x';
                    for (let i = 0; i < 64; i++) {
                      hash += chars[Math.floor(Math.random() * chars.length)];
                    }
                    return hash;
                  })(),
                  date: harvestDate,
                  inspector: 'Quality Control Lab'
                }
              ]
            },
            supplyChain: {
              currentOwner: farmer._id,
              currentOwnerWallet: farmer.walletAddress,
              status: status,
              location: {
                latitude: location.lat,
                longitude: location.lng,
                address: `${location.city}, ${location.state}`
              },
              temperature: randomFloat(15, 30),
              humidity: randomFloat(40, 70),
              lastUpdated: new Date()
            },
            batchInfo: {
              batchNumber: `BATCH-${randomNumber(1000, 9999)}`,
              totalBatches: randomNumber(1, 5),
              batchSize: Math.floor(baseQuantity / randomNumber(1, 3))
            },
            blockchain: {
              contractAddress: generateEthAddress(),
              tokenId: randomNumber(1000, 9999).toString(),
              registrationTxHash: (() => {
                const chars = '0123456789abcdef';
                let hash = '0x';
                for (let i = 0; i < 64; i++) {
                  hash += chars[Math.floor(Math.random() * chars.length)];
                }
                return hash;
              })(),
              registrationBlock: randomNumber(1000000, 2000000)
            },
            analytics: {
              views: randomNumber(10, 500),
              orders: randomNumber(0, 20),
              revenue: soldQuantity * currentPrice
            },
            isActive: true
          };
          
          products.push(product);
        }
      }
    }

    // Insert all products
    console.log(`\n💾 Inserting ${products.length} products into database...`);
    await Product.insertMany(products);
    
    console.log(`\n✅ Successfully seeded ${products.length} products!`);
    
    // Print summary
    console.log('\n📊 Summary by Category:');
    for (const category of Object.keys(productTemplates)) {
      const count = products.filter(p => p.basicInfo.category === category).length;
      console.log(`   ${category}: ${count} products`);
    }
    
    console.log('\n🎉 Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

async function createSampleFarmers() {
  const farmers = [];
  const farmerNames = [
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Devi', 
    'Ramesh Singh', 'Lakshmi Reddy', 'Vijay Yadav', 'Anita Verma'
  ];
  
  // Helper to generate valid Ethereum address
  function generateEthAddress() {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }
  
  for (let i = 0; i < farmerNames.length; i++) {
    const location = randomElement(locations);
    const farmer = new User({
      walletAddress: generateEthAddress(),
      roles: ['FARMER'],
      primaryRole: 'FARMER',
      profile: {
        name: farmerNames[i],
        email: `${farmerNames[i].toLowerCase().replace(' ', '.')}@farmchain.com`,
        phone: `+91${randomNumber(7000000000, 9999999999)}`,
        businessName: generateFarmName(location),
        location: {
          address: `${location.city}, ${location.state}`,
          city: location.city,
          state: location.state,
          country: 'India',
          pincode: `${randomNumber(100000, 999999)}`,
          type: 'Point',
          coordinates: [location.lng, location.lat] // [longitude, latitude]
        }
      },
      verification: {
        isVerified: true,
        verifiedAt: new Date(),
        kycStatus: 'approved',
        verificationLevel: 2
      },
      businessInfo: {
        farmSize: {
          value: randomNumber(5, 50),
          unit: 'acres'
        },
        farmingType: randomElement(['organic', 'conventional', 'mixed']),
        establishedYear: randomNumber(2000, 2020)
      },
      status: {
        isActive: true,
        isSuspended: false
      }
    });
    
    await farmer.save();
    farmers.push(farmer);
  }
  
  console.log(`✅ Created ${farmers.length} sample farmers`);
  return farmers;
}

// Run the seeder
if (require.main === module) {
  seedProducts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedProducts };
