#!/bin/bash

# FarmChain Complete Database Seeding Script
# Seeds ALL collections: Users, Products, Orders, Reviews, Wishlists, etc.

echo "🌱 FarmChain Complete Database Seeding"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: MongoDB process not detected${NC}"
    echo "   Make sure MongoDB is running before proceeding"
    echo ""
fi

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Error: backend/.env file not found${NC}"
    echo "   Please create backend/.env with MONGODB_URI"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration found${NC}"
echo ""

# Navigate to backend directory
cd backend || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

echo -e "${BLUE}📊 This will seed the following collections:${NC}"
echo "   • Users (Farmers, Distributors, Retailers, Consumers)"
echo "   • Products (150+ items across 6 categories)"
echo "   • Orders (50-100 orders with various statuses)"
echo "   • Reviews (Product reviews and ratings)"
echo "   • Wishlists (User wishlists)"
echo "   • Bulk Pricing (Volume discount tiers)"
echo "   • Delivery Updates (Shipment tracking)"
echo ""

# Confirm before proceeding
read -p "Continue with seeding? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Seeding cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting comprehensive database seeding..."
echo ""

# Run the comprehensive seeding script
node scripts/seedAllData.js

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Complete database seeding successful!${NC}"
    echo ""
    echo -e "${BLUE}📊 You can now access:${NC}"
    echo "   • Marketplace: http://localhost:3000/marketplace"
    echo "   • Farmer Dashboard: http://localhost:3000/farmer/inventory"
    echo "   • Orders: http://localhost:3000/farmer/orders"
    echo "   • Admin Panel: http://localhost:3000/admin/products"
    echo "   • Wishlist: http://localhost:3000/wishlist"
    echo ""
    echo -e "${BLUE}🔍 Test API endpoints:${NC}"
    echo "   curl http://localhost:5000/api/v1/products"
    echo "   curl http://localhost:5000/api/v1/orders"
    echo "   curl http://localhost:5000/api/v1/users"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Database seeding failed${NC}"
    echo "   Check the error messages above for details"
    exit 1
fi

cd ..
