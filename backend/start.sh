#!/bin/bash

cd /Users/lalithmachavarapu/Downloads/FARM_CHAIN/backend

echo "🚀 Starting FarmChain Backend..."
echo "Port: 5001"
echo "MongoDB: mongodb://localhost:27017/farmchain"
echo ""

export NODE_ENV=development
export PORT=5001

node src/server.js
