#!/bin/bash

# FarmChain Stop Script
# This script stops all running FarmChain services

echo "============================================================"
echo "🛑 Stopping FarmChain Platform"
echo "============================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop services by PID files
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    echo -e "${YELLOW}Stopping Frontend (PID: $FRONTEND_PID)...${NC}"
    kill $FRONTEND_PID 2>/dev/null && echo -e "${GREEN}✓ Frontend stopped${NC}" || echo -e "${RED}✗ Frontend not running${NC}"
    rm logs/frontend.pid
fi

if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    echo -e "${YELLOW}Stopping Backend (PID: $BACKEND_PID)...${NC}"
    kill $BACKEND_PID 2>/dev/null && echo -e "${GREEN}✓ Backend stopped${NC}" || echo -e "${RED}✗ Backend not running${NC}"
    rm logs/backend.pid
fi

if [ -f "logs/ml-service.pid" ]; then
    ML_PID=$(cat logs/ml-service.pid)
    echo -e "${YELLOW}Stopping ML Service (PID: $ML_PID)...${NC}"
    kill $ML_PID 2>/dev/null && echo -e "${GREEN}✓ ML Service stopped${NC}" || echo -e "${RED}✗ ML Service not running${NC}"
    rm logs/ml-service.pid
fi

# Force kill any remaining processes on our ports
echo ""
echo -e "${YELLOW}Cleaning up any remaining processes...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Port 3000 cleared${NC}" || true
lsof -ti:5000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Port 5000 cleared${NC}" || true
lsof -ti:5001 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Port 5001 cleared${NC}" || true

echo ""
echo "============================================================"
echo "✅ All FarmChain services stopped"
echo "============================================================"
