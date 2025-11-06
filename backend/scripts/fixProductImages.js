const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const Product = require('../src/models/Product.model');

// Verified working image URLs - using placeholder.com for reliability
const productImages = {
  grains: {
    'Basmati Rice': [
      'https://via.placeholder.com/800x600/F5DEB3/000000?text=Basmati+Rice',
      'https://via.placeholder.com/800x600/DEB887/000000?text=Premium+Rice'
    ],
    'Wheat': [
      'https://via.placeholder.com/800x600/DAA520/000000?text=Wheat+Grains',
      'https://via.placeholder.com/800x600/B8860B/000000?text=Golden+Wheat'
    ],
    'Corn': [
      'https://via.placeholder.com/800x600/FFD700/000000?text=Fresh+Corn',
      'https://via.placeholder.com/800x600/FFA500/000000?text=Sweet+Corn'
    ],
    'Millet': [
      'https://via.placeholder.com/800x600/F0E68C/000000?text=Pearl+Millet',
      'https://via.placeholder.com/800x600/EEE8AA/000000?text=Millet+Grains'
    ],
    'Sorghum': [
      'https://via.placeholder.com/800x600/D2691E/000000?text=Sorghum',
      'https://via.placeholder.com/800x600/CD853F/000000?text=Jowar'
    ]
  },
  vegetables: {
    'Tomato': [
      'https://via.placeholder.com/800x600/FF6347/FFFFFF?text=Fresh+Tomatoes',
      'https://via.placeholder.com/800x600/DC143C/FFFFFF?text=Red+Tomatoes'
    ],
    'Potato': [
      'https://via.placeholder.com/800x600/D2B48C/000000?text=Fresh+Potatoes',
      'https://via.placeholder.com/800x600/BC8F8F/000000?text=Farm+Potatoes'
    ],
    'Onion': [
      'https://via.placeholder.com/800x600/F5F5DC/000000?text=Fresh+Onions',
      'https://via.placeholder.com/800x600/FFE4B5/000000?text=Red+Onions'
    ],
    'Carrot': [
      'https://via.placeholder.com/800x600/FF8C00/FFFFFF?text=Fresh+Carrots',
      'https://via.placeholder.com/800x600/FFA500/FFFFFF?text=Orange+Carrots'
    ],
    'Cabbage': [
      'https://via.placeholder.com/800x600/90EE90/000000?text=Green+Cabbage',
      'https://via.placeholder.com/800x600/98FB98/000000?text=Fresh+Cabbage'
    ],
    'Cauliflower': [
      'https://via.placeholder.com/800x600/FFFAF0/000000?text=Cauliflower',
      'https://via.placeholder.com/800x600/FFF8DC/000000?text=White+Cauliflower'
    ],
    'Spinach': [
      'https://via.placeholder.com/800x600/228B22/FFFFFF?text=Fresh+Spinach',
      'https://via.placeholder.com/800x600/32CD32/FFFFFF?text=Green+Spinach'
    ],
    'Bell Pepper': [
      'https://via.placeholder.com/800x600/FF0000/FFFFFF?text=Bell+Peppers',
      'https://via.placeholder.com/800x600/00FF00/000000?text=Green+Peppers'
    ]
  },
  fruits: {
    'Mango': [
      'https://via.placeholder.com/800x600/FFD700/000000?text=Alphonso+Mango',
      'https://via.placeholder.com/800x600/FFA500/000000?text=Fresh+Mangoes'
    ],
    'Apple': [
      'https://via.placeholder.com/800x600/DC143C/FFFFFF?text=Red+Apples',
      'https://via.placeholder.com/800x600/FF0000/FFFFFF?text=Fresh+Apples'
    ],
    'Banana': [
      'https://via.placeholder.com/800x600/FFFF00/000000?text=Fresh+Bananas',
      'https://via.placeholder.com/800x600/FFD700/000000?text=Yellow+Bananas'
    ],
    'Orange': [
      'https://via.placeholder.com/800x600/FFA500/000000?text=Fresh+Oranges',
      'https://via.placeholder.com/800x600/FF8C00/000000?text=Sweet+Oranges'
    ],
    'Grapes': [
      'https://via.placeholder.com/800x600/9370DB/FFFFFF?text=Fresh+Grapes',
      'https://via.placeholder.com/800x600/8B008B/FFFFFF?text=Purple+Grapes'
    ],
    'Pomegranate': [
      'https://via.placeholder.com/800x600/DC143C/FFFFFF?text=Pomegranate',
      'https://via.placeholder.com/800x600/B22222/FFFFFF?text=Red+Pomegranate'
    ],
    'Papaya': [
      'https://via.placeholder.com/800x600/FF6347/FFFFFF?text=Fresh+Papaya',
      'https://via.placeholder.com/800x600/FFA07A/000000?text=Ripe+Papaya'
    ]
  },
  dairy: {
    'Fresh Milk': [
      'https://via.placeholder.com/800x600/FFFFFF/000000?text=Fresh+Milk',
      'https://via.placeholder.com/800x600/F5F5F5/000000?text=Pure+Milk'
    ],
    'Paneer': [
      'https://via.placeholder.com/800x600/FFFAF0/000000?text=Fresh+Paneer',
      'https://via.placeholder.com/800x600/FFF8DC/000000?text=Cottage+Cheese'
    ],
    'Ghee': [
      'https://via.placeholder.com/800x600/FFD700/000000?text=Pure+Ghee',
      'https://via.placeholder.com/800x600/FFA500/000000?text=Clarified+Butter'
    ],
    'Yogurt': [
      'https://via.placeholder.com/800x600/FFFAF0/000000?text=Fresh+Yogurt',
      'https://via.placeholder.com/800x600/FFF8DC/000000?text=Greek+Yogurt'
    ]
  },
  pulses: {
    'Chickpeas': [
      'https://via.placeholder.com/800x600/F5DEB3/000000?text=Chickpeas',
      'https://via.placeholder.com/800x600/DEB887/000000?text=Kabuli+Chana'
    ],
    'Lentils': [
      'https://via.placeholder.com/800x600/CD853F/FFFFFF?text=Red+Lentils',
      'https://via.placeholder.com/800x600/D2691E/FFFFFF?text=Masoor+Dal'
    ],
    'Green Gram': [
      'https://via.placeholder.com/800x600/90EE90/000000?text=Green+Gram',
      'https://via.placeholder.com/800x600/98FB98/000000?text=Moong+Dal'
    ],
    'Black Gram': [
      'https://via.placeholder.com/800x600/2F4F4F/FFFFFF?text=Black+Gram',
      'https://via.placeholder.com/800x600/696969/FFFFFF?text=Urad+Dal'
    ],
    'Pigeon Peas': [
      'https://via.placeholder.com/800x600/FFD700/000000?text=Pigeon+Peas',
      'https://via.placeholder.com/800x600/DAA520/000000?text=Toor+Dal'
    ]
  },
  spices: {
    'Turmeric': [
      'https://via.placeholder.com/800x600/FF8C00/000000?text=Turmeric+Powder',
      'https://via.placeholder.com/800x600/FFA500/000000?text=Haldi'
    ],
    'Cumin': [
      'https://via.placeholder.com/800x600/8B4513/FFFFFF?text=Cumin+Seeds',
      'https://via.placeholder.com/800x600/A0522D/FFFFFF?text=Jeera'
    ],
    'Coriander': [
      'https://via.placeholder.com/800x600/D2691E/FFFFFF?text=Coriander+Seeds',
      'https://via.placeholder.com/800x600/CD853F/FFFFFF?text=Dhaniya'
    ],
    'Black Pepper': [
      'https://via.placeholder.com/800x600/000000/FFFFFF?text=Black+Pepper',
      'https://via.placeholder.com/800x600/2F4F4F/FFFFFF?text=Peppercorns'
    ],
    'Cardamom': [
      'https://via.placeholder.com/800x600/90EE90/000000?text=Green+Cardamom',
      'https://via.placeholder.com/800x600/98FB98/000000?text=Elaichi'
    ]
  }
};

async function fixProductImages() {
  try {
    console.log('🔧 Fixing product images with verified URLs...\n');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain');
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to fix\n`);

    let updatedCount = 0;

    for (const product of products) {
      const category = product.basicInfo.category;
      const name = product.basicInfo.name;

      const categoryImages = productImages[category] || {};
      const images = categoryImages[name];

      if (images && images.length > 0) {
        product.basicInfo.images = images;
        await product.save();
        updatedCount++;
        console.log(`✅ Fixed: ${name} (${category})`);
      }
    }

    console.log(`\n📊 Fix Summary:`);
    console.log(`   Total products: ${products.length}`);
    console.log(`   Fixed: ${updatedCount}`);
    console.log('\n🎉 Image fix completed!');

  } catch (error) {
    console.error('❌ Error fixing images:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

if (require.main === module) {
  fixProductImages()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { fixProductImages };
