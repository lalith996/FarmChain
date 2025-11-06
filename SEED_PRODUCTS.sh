#!/bin/bash

# FarmChain Product Database Seeding Script
# This script seeds the MongoDB database with realistic synthetic product data

echo "🌱 FarmChain Product Database Seeding"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Run the seeding script
echo "🚀 Starting product seeding..."
echo ""
node scripts/seedProducts.js

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Product seeding completed successfully!${NC}"
    echo ""
    echo "📊 You can now view the products in:"
    echo "   • Marketplace: http://localhost:3000/marketplace"
    echo "   • Farmer Inventory: http://localhost:3000/farmer/inventory"
    echo "   • Admin Dashboard: http://localhost:3000/admin/products"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Product seeding failed${NC}"
    echo "   Check the error messages above for details"
    exit 1
fi

cd ..
