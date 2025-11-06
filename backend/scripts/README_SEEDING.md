# Product Database Seeding

This directory contains scripts to seed the MongoDB database with realistic synthetic product data.

## Overview

The seeding script (`seedProducts.js`) generates comprehensive, realistic product data for the FarmChain platform including:

- **150+ Products** across 6 categories
- **Realistic farmer profiles** with location data
- **Complete product details** including certifications, quality metrics, and blockchain data
- **Supply chain information** with status tracking
- **Pricing and inventory** data

## Product Categories

1. **Grains** - Rice, Wheat, Corn, Millet, Sorghum
2. **Vegetables** - Tomato, Potato, Onion, Carrot, Cabbage, etc.
3. **Fruits** - Mango, Apple, Banana, Orange, Grapes, etc.
4. **Dairy** - Milk, Paneer, Ghee, Yogurt
5. **Pulses** - Chickpeas, Lentils, Green Gram, Black Gram, etc.
6. **Spices** - Turmeric, Cumin, Coriander, Black Pepper, Cardamom

## Running the Seeder

### Prerequisites

1. MongoDB must be running
2. Backend environment variables must be configured (`.env` file)
3. Node.js dependencies must be installed

### Execute Seeding

```bash
# From the backend directory
cd backend
node scripts/seedProducts.js
```

Or from the root directory:

```bash
node backend/scripts/seedProducts.js
```

### What Gets Created

The script will:

1. **Check for existing farmers** - If no farmers exist, it creates 8 sample farmers
2. **Generate products** - Creates 2-5 products per product type from different farmers
3. **Populate all fields** - Including:
   - Basic info (name, category, description, images, certifications)
   - Farm details (location, dates, farming methods, inputs used)
   - Quantity and pricing information
   - Quality metrics and reports
   - Supply chain status and location
   - Blockchain registration data
   - Analytics (views, orders, revenue)

### Sample Output

```
🌱 Starting product seeding...
✅ Connected to MongoDB
📊 Found 8 farmers

📦 Generating grains products...
📦 Generating vegetables products...
📦 Generating fruits products...
📦 Generating dairy products...
📦 Generating pulses products...
📦 Generating spices products...

💾 Inserting 156 products into database...

✅ Successfully seeded 156 products!

📊 Summary by Category:
   grains: 25 products
   vegetables: 40 products
   fruits: 35 products
   dairy: 20 products
   pulses: 25 products
   spices: 25 products

🎉 Seeding completed successfully!
🔌 Database connection closed
```

## Data Characteristics

### Realistic Features

- **Indian locations** - Products from 10 major agricultural regions
- **Seasonal dates** - Realistic sowing and harvest dates
- **Varied pricing** - Category-appropriate price ranges
- **Quality grades** - A, B, C grades with quality scores
- **Certifications** - Organic, FSSAI, ISO, GlobalGAP, etc.
- **Farming methods** - Organic, conventional, hydroponic, greenhouse
- **Supply chain status** - Harvested, in transit, at warehouse
- **Blockchain data** - Mock transaction hashes and contract addresses

### Data Ranges

- **Grains**: 50-500 quintals, ₹2000-5000/quintal
- **Vegetables**: 100-2000 kg, ₹20-80/kg
- **Fruits**: 100-2000 kg, ₹40-150/kg
- **Dairy**: 100-1000 liters, ₹50-100/liter
- **Pulses**: 100-2000 kg, ₹80-200/kg
- **Spices**: 100-2000 kg, ₹200-800/kg

## Viewing Seeded Data

After seeding, products will be visible in:

1. **Marketplace** (`/marketplace`) - All products with filters
2. **Farmer Inventory** (`/farmer/inventory`) - Products by farmer
3. **Admin Dashboard** (`/admin/products`) - All products management
4. **Retailer/Distributor** - Product sourcing pages

## Customization

To modify the seeding data:

1. **Edit product templates** - Modify `productTemplates` object
2. **Adjust quantities** - Change `numProducts` variable
3. **Update locations** - Modify `locations` array
4. **Change certifications** - Update `certifications` array
5. **Modify price ranges** - Adjust pricing logic in generation loop

## Clearing Data

To clear existing products before seeding, uncomment this line in the script:

```javascript
await Product.deleteMany({});
```

**Warning**: This will delete ALL products in the database!

## Troubleshooting

### Connection Issues

If you see connection errors:
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env` file
- Ensure network connectivity

### Duplicate Key Errors

If you see duplicate key errors:
- Products with same `productId` already exist
- Either clear existing data or modify the ID generation logic

### No Farmers Found

If no farmers exist:
- The script automatically creates 8 sample farmers
- You can also manually create farmers first

## Integration with Frontend

The seeded products are automatically available through the API:

```typescript
// Fetch all products
const response = await productAPI.getAll({ page: 1, limit: 20 });

// Filter by category
const response = await productAPI.getAll({ category: 'vegetables' });

// Search products
const response = await productAPI.search({ q: 'tomato' });
```

## Notes

- Products are created with `isActive: true` by default
- Each product has a unique `productId` in format `PROD-XXXX`
- Blockchain data is mocked for development purposes
- Images use placeholder URLs (update with real images in production)
- All dates are randomized within realistic ranges
