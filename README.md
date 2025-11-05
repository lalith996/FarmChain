# AgriChain - Agricultural Supply Chain Blockchain Application

A transparent, secure, and efficient agricultural supply chain platform that connects farmers, distributors, retailers, and consumers using blockchain technology and AI.

## 🌟 Features

- **Blockchain Integration**: Immutable product tracking on Polygon network
- **AI/ML Services**: Yield prediction, quality assessment, and price forecasting
- **Multi-Role Support**: Farmers, Distributors, Retailers, Consumers, Admins
- **Secure Payments**: Cryptocurrency escrow system
- **Complete Traceability**: Track products from farm to consumer
- **Quality Assurance**: AI-powered quality grading

## 🏗️ Architecture

```
├── contracts/          # Smart contracts (Solidity)
├── backend/           # Node.js/Express API server
├── frontend/          # React.js web application
├── ai-service/        # Python FastAPI ML service
├── mobile/            # React Native mobile app (future)
└── docs/              # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB 6+
- Redis 7+
- MetaMask wallet

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd FARM_CHAIN
```

2. **Install dependencies**
```bash
# Install contract dependencies
cd contracts
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install AI service dependencies
cd ../ai-service
pip install -r requirements.txt
```

3. **Configure environment variables**
```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp contracts/.env.example contracts/.env
```

4. **Start development servers**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start

# Terminal 3: Start AI service
cd ai-service
uvicorn main:app --reload

# Terminal 4: Start local blockchain (optional)
cd contracts
npx hardhat node
```

## 📚 Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [Smart Contracts](docs/SMART_CONTRACTS.md)
- [API Documentation](docs/API.md)
- [Frontend Guide](docs/FRONTEND.md)
- [AI/ML Services](docs/AI_SERVICES.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🛠️ Technology Stack

### Blockchain
- Solidity ^0.8.0
- Hardhat/Truffle
- Polygon Mumbai (Testnet)
- ethers.js

### Backend
- Node.js 18+
- Express.js
- MongoDB
- Redis
- JWT Authentication

### Frontend
- React.js 18+
- Redux Toolkit
- Material-UI
- ethers.js
- Recharts

### AI/ML
- Python 3.10+
- FastAPI
- TensorFlow/PyTorch
- scikit-learn
- OpenCV

## 🔐 Security

- Smart contract audits
- JWT authentication
- Wallet signature verification
- Input validation and sanitization
- Rate limiting
- CORS protection

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team

AgriChain Development Team

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📞 Support

For support, email support@agrichain.com or join our Discord community.
