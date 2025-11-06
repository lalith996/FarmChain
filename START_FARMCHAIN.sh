#!/bin/bash

# FarmChain Complete Startup Script
# This script starts all services needed for the FarmChain platform

echo "============================================================"
echo "🚀 Starting FarmChain Platform"
echo "============================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Function to wait for service
wait_for_service() {
    local port=$1
    local service=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}⏳ Waiting for $service on port $port...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if check_port $port; then
            echo -e "${GREEN}✓ $service is ready!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo -e "${RED}✗ $service failed to start${NC}"
    return 1
}

# Check prerequisites
echo ""
echo "============================================================"
echo "📋 Checking Prerequisites"
echo "============================================================"

# Check Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check MongoDB
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB installed${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB not found. Make sure it's installed and running${NC}"
fi

# Check Python
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓ Python installed: $(python3 --version)${NC}"
else
    echo -e "${RED}✗ Python not found. Please install Python 3.8+${NC}"
    exit 1
fi

# Check Redis (optional)
if command -v redis-server &> /dev/null; then
    echo -e "${GREEN}✓ Redis installed${NC}"
else
    echo -e "${YELLOW}⚠ Redis not found (optional for caching)${NC}"
fi

echo ""
echo "============================================================"
echo "🔧 Setting Up Environment"
echo "============================================================"

# Setup backend .env if not exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env from example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠ Please update backend/.env with your configuration${NC}"
else
    echo -e "${GREEN}✓ backend/.env exists${NC}"
fi

# Setup ML service .env if not exists
if [ ! -f "ml-service/.env" ]; then
    echo -e "${YELLOW}Creating ml-service/.env...${NC}"
    echo "ML_SERVICE_PORT=5001" > ml-service/.env
    echo -e "${GREEN}✓ Created ml-service/.env${NC}"
else
    echo -e "${GREEN}✓ ml-service/.env exists${NC}"
fi

echo ""
echo "============================================================"
echo "📦 Installing Dependencies"
echo "============================================================"

# Install backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

# Install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

# Check ML models
if [ ! -d "ml-service/models" ]; then
    echo -e "${YELLOW}⚠ ML models not found. Run 'python train_models.py' in ml-service directory${NC}"
else
    echo -e "${GREEN}✓ ML models found${NC}"
fi

echo ""
echo "============================================================"
echo "🚀 Starting Services"
echo "============================================================"

# Start MongoDB (if not running)
if ! check_port 27017; then
    echo -e "${YELLOW}Starting MongoDB...${NC}"
    mongod --fork --logpath /tmp/mongodb.log --dbpath ~/data/db 2>/dev/null || echo -e "${YELLOW}⚠ Start MongoDB manually: mongod${NC}"
else
    echo -e "${GREEN}✓ MongoDB already running${NC}"
fi

# Start Redis (if available and not running)
if command -v redis-server &> /dev/null && ! check_port 6379; then
    echo -e "${YELLOW}Starting Redis...${NC}"
    redis-server --daemonize yes 2>/dev/null || echo -e "${YELLOW}⚠ Start Redis manually: redis-server${NC}"
else
    echo -e "${GREEN}✓ Redis already running or not installed${NC}"
fi

echo ""
echo "============================================================"
echo "🎯 Starting Application Services"
echo "============================================================"

# Kill existing processes on our ports
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

sleep 2

# Start ML Service
echo ""
echo -e "${YELLOW}1️⃣  Starting ML Service (Port 5001)...${NC}"
cd ml-service
python3 app.py > ../logs/ml-service.log 2>&1 &
ML_PID=$!
cd ..
echo -e "   PID: $ML_PID"

# Start Backend
echo ""
echo -e "${YELLOW}2️⃣  Starting Backend API (Port 5000)...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "   PID: $BACKEND_PID"

# Wait for backend to be ready
sleep 5

# Start Frontend
echo ""
echo -e "${YELLOW}3️⃣  Starting Frontend (Port 3000)...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "   PID: $FRONTEND_PID"

# Create logs directory if not exists
mkdir -p logs

# Save PIDs for later cleanup
echo "$ML_PID" > logs/ml-service.pid
echo "$BACKEND_PID" > logs/backend.pid
echo "$FRONTEND_PID" > logs/frontend.pid

echo ""
echo "============================================================"
echo "⏳ Waiting for Services to Start"
echo "============================================================"

sleep 3

# Check services
wait_for_service 5001 "ML Service"
wait_for_service 5000 "Backend API"
wait_for_service 3000 "Frontend"

echo ""
echo "============================================================"
echo "✅ FarmChain Platform is Running!"
echo "============================================================"
echo ""
echo "🌐 Access your application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"
echo "   ML API:    http://localhost:5001"
echo ""
echo "📊 Service Status:"
echo "   ML Service PID:  $ML_PID"
echo "   Backend PID:     $BACKEND_PID"
echo "   Frontend PID:    $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   ML Service:  tail -f logs/ml-service.log"
echo "   Backend:     tail -f logs/backend.log"
echo "   Frontend:    tail -f logs/frontend.log"
echo ""
echo "🛑 To stop all services, run: ./STOP_FARMCHAIN.sh"
echo "============================================================"
echo ""
