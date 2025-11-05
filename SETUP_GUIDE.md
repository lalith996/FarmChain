# AgriChain - Setup and Installation Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download](https://python.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Redis** (v7 or higher) - [Download](https://redis.io/download/)
- **Git** - [Download](https://git-scm.com/)
- **MetaMask** wallet extension - [Install](https://metamask.io/)

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd FARM_CHAIN
```

### 2. Smart Contracts Setup

```bash
cd contracts

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
# - Add your private key (for deployment)
# - Add Alchemy/Infura API key
# - Add Polygonscan API key
nano .env

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to local network (in a separate terminal)
npx hardhat node

# Deploy contracts (in another terminal)
npm run deploy:local

# For testnet deployment (Mumbai)
npm run deploy:mumbai
```

### 3. Backend Setup

```bash
cd ../backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file
nano .env

# Update the following:
# - MONGODB_URI
# - JWT_SECRET (generate a strong random string)
# - Blockchain contract addresses (from deployment)
# - RPC_URL (Alchemy/Infura)
# - PINATA_API_KEY (for IPFS)
# - Other configuration as needed

# Create logs directory
mkdir logs

# Start MongoDB (if not running as service)
# On macOS with Homebrew:
brew services start mongodb-community

# Start Redis (if not running as service)
# On macOS with Homebrew:
brew services start redis

# Run in development mode
npm run dev

# Or run in production mode
npm start
```

### 4. AI Service Setup (Optional)

```bash
cd ../ai-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with:
# - API URL
# - Contract addresses
# - Network configuration
nano .env

# Start development server
npm start

# The app will open at http://localhost:3000
```

## 🔧 Configuration Guide

### MongoDB Setup

If MongoDB is not installed, install it:

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Redis Setup

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### MetaMask Configuration

1. Install MetaMask browser extension
2. Create or import a wallet
3. Add Polygon Mumbai Testnet:
   - Network Name: Polygon Mumbai
   - RPC URL: https://rpc-mumbai.maticvigil.com
   - Chain ID: 80001
   - Currency Symbol: MATIC
   - Block Explorer: https://mumbai.polygonscan.com

4. Get test MATIC from faucet:
   - Visit: https://faucet.polygon.technology/
   - Select Mumbai Network
   - Enter your wallet address
   - Request tokens

### Alchemy/Infura Setup

1. Create account at [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
2. Create a new app for Polygon Mumbai
3. Copy the API key/endpoint
4. Add to backend `.env` file as `RPC_URL`

### Pinata (IPFS) Setup

1. Create account at [Pinata](https://pinata.cloud/)
2. Go to API Keys section
3. Create new API key
4. Copy API Key and Secret
5. Add to backend `.env` file

## 📝 Environment Variables Guide

### Backend .env

```bash
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/agrichain

# JWT - Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_generated_secret_here
JWT_EXPIRE=7d

# Blockchain
BLOCKCHAIN_NETWORK=mumbai
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
CHAIN_ID=80001
SUPPLY_CHAIN_CONTRACT_ADDRESS=0xYourContractAddress
PAYMENT_CONTRACT_ADDRESS=0xYourContractAddress
PRIVATE_KEY=your_private_key_without_0x_prefix

# IPFS
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Service
AI_SERVICE_URL=http://localhost:8000

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Contracts .env

```bash
PRIVATE_KEY=your_private_key_here
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
POLYGONSCAN_API_KEY=your_polygonscan_api_key
PLATFORM_WALLET_ADDRESS=0xYourWalletAddress
```

### Frontend .env

```bash
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_CHAIN_ID=80001
REACT_APP_NETWORK_NAME=mumbai
REACT_APP_SUPPLY_CHAIN_CONTRACT=0xYourContractAddress
REACT_APP_PAYMENT_CONTRACT=0xYourContractAddress
```

## 🧪 Testing

### Test Smart Contracts

```bash
cd contracts
npm test

# With gas reporting
REPORT_GAS=true npm test

# With coverage
npm run coverage
```

### Test Backend

```bash
cd backend
npm test

# Watch mode
npm run test:watch
```

## 🐳 Docker Setup (Optional)

```bash
# Build and run all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## 📚 Useful Commands

```bash
# Start local blockchain node
cd contracts && npx hardhat node

# Deploy contracts locally
cd contracts && npm run deploy:local

# Start backend dev server
cd backend && npm run dev

# Start frontend dev server
cd frontend && npm start

# Start AI service
cd ai-service && source venv/bin/activate && uvicorn main:app --reload
```

## 🔍 Verification

After setup, verify everything is working:

1. **Check Backend**: Visit http://localhost:5000/health
2. **Check Frontend**: Visit http://localhost:3000
3. **Check AI Service**: Visit http://localhost:8000/docs
4. **Check MongoDB**: Run `mongosh` and check connection
5. **Check Redis**: Run `redis-cli ping` (should return PONG)

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community
```

### Redis Connection Error

```bash
# Check if Redis is running
brew services list | grep redis

# Start Redis
brew services start redis
```

### Blockchain Connection Error

- Verify RPC_URL is correct
- Check if you have test MATIC in your wallet
- Ensure contract addresses are correct
- Check network configuration in MetaMask

## 📖 Next Steps

1. Read the [API Documentation](./API_DOCUMENTATION.md)
2. Review [Smart Contract Documentation](./SMART_CONTRACT_DOCS.md)
3. Check [Frontend Guide](./FRONTEND_GUIDE.md)
4. Explore [AI/ML Services](./AI_SERVICES.md)

## 💡 Tips

- Use separate wallets for development and production
- Never commit `.env` files to version control
- Keep your private keys secure
- Test on testnet before deploying to mainnet
- Monitor gas prices before transactions
- Regularly backup your database
- Use environment-specific configurations

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review logs in `backend/logs/`
3. Check contract events on Polygonscan
4. Verify all environment variables are set correctly

Happy coding! 🚀
