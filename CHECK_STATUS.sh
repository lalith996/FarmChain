#!/bin/bash

# FarmChain Status Checker
# Check if all services are running

echo "============================================================"
echo "📊 FarmChain Platform Status"
echo "============================================================"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    local port=$1
    local name=$2
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $name (Port $port) - RUNNING${NC}"
        return 0
    else
        echo -e "${RED}✗ $name (Port $port) - NOT RUNNING${NC}"
        return 1
    fi
}

echo ""
echo "Application Services:"
check_service 3000 "Frontend     "
check_service 5000 "Backend API  "
check_service 5001 "ML Service   "

echo ""
echo "Database Services:"
check_service 27017 "MongoDB      "
check_service 6379 "Redis        " || echo -e "${YELLOW}  (Optional)${NC}"

echo ""
echo "============================================================"

# Check if all main services are running
if lsof -i :3000 > /dev/null 2>&1 && \
   lsof -i :5000 > /dev/null 2>&1 && \
   lsof -i :5001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ All services are running!${NC}"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:5000"
    echo "   ML API:    http://localhost:5001"
else
    echo -e "${RED}⚠️  Some services are not running${NC}"
    echo ""
    echo "To start all services, run:"
    echo "   ./START_FARMCHAIN.sh"
fi

echo "============================================================"
