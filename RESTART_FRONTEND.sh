#!/bin/bash

echo "🔄 Restarting Frontend to Apply Image Configuration..."
echo ""

# Kill existing Next.js dev server
echo "⏹️  Stopping existing frontend..."
pkill -f "next dev" 2>/dev/null
sleep 2

# Navigate to frontend directory
cd frontend || exit 1

echo "🚀 Starting frontend with image support..."
echo ""
echo "📸 Images will now load from Unsplash!"
echo "🌐 Open: http://localhost:3000/marketplace"
echo ""

# Start the dev server
npm run dev
