# Database Seeding Scripts

This directory contains scripts for generating and seeding synthetic data into the FarmChain MongoDB database.

## 📋 Overview

The seeding system generates realistic synthetic data for:
- **Users** (Farmers, Distributors, Retailers, Consumers, Admins)
- **Products** (with complete farm details, blockchain data, pricing)
- **Orders** (with payment, delivery, and blockchain tracking)
- **Reviews** (with ratings, comments, and verification)
- **Wishlists** (with saved products)

## 🚀 Quick Start

### Basic Seeding (Default Data)
```bash
cd backend
npm run seed
```

This generates:
- 50 Farmers
- 30 Distributors
- 40 Retailers
- 100 Consumers
- 5 Admins
- ~150 Products (3 per farmer)
- ~300 Orders (2 per product)
- ~180 Reviews (60% of delivered orders)
- ~30 Wishlists

### Clear and Reseed
```bash
npm run seed:clear
```

Clears all existing data and seeds fresh data.

### Large Dataset (3x data)
```bash
npm run seed:large
```

Generates 3x the default data for load testing.

### Custom Count
```bash
node scripts/seed.js --clear --count=5
```

Multiplies all data by the count factor.

## 📊 Data Generated

### Users
- **Wallet addresses** (valid Ethereum format)
- **Profiles** (name, email, phone, location with Indian cities)
- **Business info** (for farmers, distributors, retailers)
- **Ratings** (average, count, breakdown)
- **Statistics** (orders, revenue, products listed)
- **Verification status** (KYC, documents)

### Products
- **Categories**: vegetables, fruits, grains, pulses, dairy, spices
- **Farm details**: sowing date, harvest date, farming method, location
- **Quality data**: grade, moisture content, AI quality score, lab reports
- **Blockchain data**: contract address, token ID, transaction hashes
- **Pricing**: base price, current price, price history
- **Supply chain**: current owner, status, temperature, humidity
- **Certifications**: Organic, ISO, FSSAI, GAP, Fair Trade

### Orders
- **Order details**: quantity, unit, price, total amount
- **Delivery**: address, tracking number, expected/actual dates
- **Status**: pending → confirmed → shipped → delivered
- **Payment**: method (crypto, escrow, COD, online), transaction hash
- **Blockchain**: order TX hash, payment TX hash, transfer TX hash
- **Quality verification**: inspection results, reports
- **Ratings**: buyer and seller ratings

### Reviews
- **Ratings**: overall, quality, delivery, communication, value
- **Content**: title, comment, media attachments
- **Verification**: purchase verified, blockchain verified
- **Helpful count**: number of users who found it helpful
- **Seller response**: optional response from seller

## 🗂️ File Structure

```
scripts/
├── seed.js          # Main seeding script
├── seedData.js      # Data generation functions
└── README.md        # This file
```

## 📝 Generated Data Examples

### Sample Farmer
```json
{
  "walletAddress": "0x1a2b3c4d5e6f7g8h9i0j...",
  "primaryRole": "FARMER",
  "profile": {
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "phone": "+91 9876543210",
    "location": {
      "city": "Pune",
      "state": "Maharashtra",
      "coordinates": { "latitude": 18.52, "longitude": 73.85 }
    }
  },
  "businessInfo": {
    "businessName": "Kumar Farms",
    "gst": "27AAAAA1234A1Z5",
    "businessType": "farm"
  },
  "rating": {
    "average": 4.5,
    "count": 120
  },
  "verification": {
    "isVerified": true,
    "kycStatus": "approved"
  }
}
```

### Sample Product
```json
{
  "productId": "PROD1699123456789",
  "farmer": "ObjectId(...)",
  "basicInfo": {
    "name": "Organic Tomatoes",
    "category": "vegetables",
    "variety": "Roma",
    "certifications": ["Organic Certification", "FSSAI", "GAP"]
  },
  "farmDetails": {
    "farmName": "Kumar Farms",
    "farmingMethod": "organic",
    "sowingDate": "2024-08-15",
    "harvestDate": "2024-10-20"
  },
  "pricing": {
    "currentPrice": 45.50,
    "currency": "INR"
  },
  "quality": {
    "grade": "A",
    "aiQualityScore": 92
  },
  "blockchain": {
    "tokenId": "12345",
    "registrationTxHash": "0xabc123...",
    "contractAddress": "0x789def..."
  },
  "supplyChain": {
    "status": "harvested",
    "temperature": 22.5,
    "humidity": 65
  }
}
```

### Sample Order
```json
{
  "orderId": "ORD1699123456790",
  "buyer": "ObjectId(...)",
  "seller": "ObjectId(...)",
  "product": "ObjectId(...)",
  "orderDetails": {
    "quantity": 50,
    "unit": "kg",
    "pricePerUnit": 45.50,
    "totalAmount": 2275.00
  },
  "status": "delivered",
  "payment": {
    "method": "escrow",
    "status": "completed",
    "transactionHash": "0x123abc..."
  },
  "delivery": {
    "address": { "city": "Mumbai", "state": "Maharashtra" },
    "trackingNumber": "TRK1234567",
    "carrier": "BlueDart"
  },
  "blockchain": {
    "orderTxHash": "0x456def...",
    "paymentTxHash": "0x789ghi...",
    "transferTxHash": "0xabcjkl..."
  }
}
```

## 🔧 Configuration

Edit `scripts/seedData.js` to customize:
- **Cities and locations** (`INDIAN_CITIES` array)
- **Product categories** (`PRODUCT_CATEGORIES` object)
- **Data generation logic** (generator functions)

Edit `scripts/seed.js` to customize:
- **Data counts** (`COUNTS` object)
- **Review percentage** (default: 60%)
- **Wishlist percentage** (default: 30%)

## 🧪 Testing

After seeding, verify data:

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/farmchain

# Check collections
db.users.countDocuments()
db.products.countDocuments()
db.orders.countDocuments()
db.reviews.countDocuments()

# Sample data
db.users.findOne({ primaryRole: 'FARMER' })
db.products.findOne({})
db.orders.findOne({ status: 'delivered' })
```

## 📌 Notes

- All wallet addresses are randomly generated (40-character hex strings)
- All transaction hashes are randomly generated (64-character hex strings)
- Dates are distributed over the past 1-2 years
- 70% of users are verified
- 90% of products are active
- 60% of delivered orders have reviews
- Indian cities and states are used for realistic locations
- Prices are in INR (Indian Rupees)

## 🐛 Troubleshooting

### MongoDB Connection Error
Make sure MongoDB is running and the connection string in `.env` is correct:
```bash
MONGODB_URI=mongodb://localhost:27017/farmchain
```

### Out of Memory
For large datasets (--count > 5), you may need to increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run seed:large
```

### Duplicate Key Error
Use `--clear` flag to clear existing data before seeding:
```bash
npm run seed:clear
```

## 📚 Additional Resources

- [Faker.js Documentation](https://fakerjs.dev/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)

---

**Generated with ❤️ for FarmChain Development**
