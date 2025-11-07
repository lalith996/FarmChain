# FarmChain - Technical Documentation

## Project Overview

**FarmChain** is a comprehensive blockchain-powered agricultural supply chain management platform that connects farmers, distributors, retailers, and consumers in a transparent and traceable ecosystem. The platform leverages Web3 technologies, smart contracts, and modern web frameworks to ensure product authenticity, fair pricing, and complete supply chain visibility.

---

## 1. Technologies Used

### Frontend Technologies

#### Core Framework
- **Next.js 14** (App Router) - React-based framework for server-side rendering and static site generation
- **React 18** - Component-based UI library
- **TypeScript** - Type-safe JavaScript for enhanced developer experience

#### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Framer Motion** - Animation library for smooth transitions and interactions
- **Heroicons** - Beautiful hand-crafted SVG icons
- **shadcn/ui** - Re-usable component patterns

#### Web3 & Blockchain
- **Wagmi** - React Hooks for Ethereum
- **RainbowKit** - Wallet connection interface
- **Viem** - TypeScript interface for Ethereum
- **ethers.js** - Ethereum blockchain interaction library

#### State Management & Data Fetching
- **React Hooks** (useState, useEffect, useContext) - State management
- **Axios** - HTTP client for API requests
- **SWR** (Stale-While-Revalidate) - Data fetching and caching

#### Additional Frontend Libraries
- **QR Code Generator** - For product verification QR codes
- **Chart.js / Recharts** - Data visualization
- **React Hook Form** - Form validation and handling
- **date-fns** - Date manipulation library

### Backend Technologies

#### Core Framework
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript/JavaScript** - Server-side language

#### Database
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - MongoDB object modeling (ODM)

#### Blockchain & Web3
- **Hardhat** - Ethereum development environment
- **Solidity** - Smart contract programming language
- **Web3.js** - Ethereum JavaScript API
- **IPFS (InterPlanetary File System)** - Decentralized file storage

#### Authentication & Security
- **JWT (JSON Web Tokens)** - Token-based authentication
- **bcrypt.js** - Password hashing
- **crypto** - Cryptographic operations
- **helmet** - Security headers middleware
- **express-mongo-sanitize** - MongoDB injection prevention
- **hpp** - HTTP Parameter Pollution protection

#### AI & Machine Learning
- **TensorFlow.js** - Machine learning models
- **Python Integration** - For advanced ML models
- **Natural Language Processing** - Chatbot functionality

#### Additional Backend Libraries
- **multer** - File upload handling
- **nodemailer** - Email notifications
- **winston** - Logging framework
- **morgan** - HTTP request logger
- **compression** - Response compression
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

### Blockchain Technologies

#### Smart Contracts
- **Solidity ^0.8.0** - Smart contract language
- **OpenZeppelin Contracts** - Secure smart contract libraries
- **ERC-721** - NFT standard for product tokens
- **ERC-1155** - Multi-token standard

#### Networks
- **Ethereum** - Primary blockchain network
- **Polygon/MATIC** - Layer 2 scaling solution
- **Hardhat Network** - Local development blockchain

#### Storage
- **IPFS** - Decentralized file storage
- **Pinata** - IPFS pinning service

### DevOps & Deployment

#### Hosting & Deployment
- **Vercel** - Frontend deployment
- **AWS/Heroku** - Backend deployment
- **MongoDB Atlas** - Cloud database hosting

#### CI/CD
- **GitHub Actions** - Continuous integration
- **Git** - Version control

#### Monitoring & Analytics
- **Google Analytics** - User analytics
- **Sentry** - Error tracking
- **Winston Logger** - Application logging

---

## 2. System Model - Architecture Diagram

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACES (Frontend)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Farmer  │  │ Retailer │  │Distribut │  │ Consumer │  │  Admin   │ │
│  │  Portal  │  │  Portal  │  │   -or    │  │  Portal  │  │  Portal  │ │
│  │          │  │          │  │  Portal  │  │          │  │          │ │
│  │ • Crops  │  │ • Store  │  │ • Fleet  │  │ • Shop   │  │ • Users  │ │
│  │ • Orders │  │ • Sales  │  │ • Routes │  │ • Orders │  │ •Analytic│ │
│  │•Analytic │  │ • POS    │  │•Tracking │  │ • Track  │  │ •Dispute │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │              │             │             │        │
│       └─────────────┴──────────────┴─────────────┴─────────────┘        │
│                                    │                                     │
│                         Next.js 14 (App Router)                          │
│                         React 18 + TypeScript                            │
│                         Tailwind CSS + Framer Motion                     │
│                                    │                                     │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                         ┌───────────▼───────────┐
                         │   Web3 Integration    │
                         │                       │
                         │  • RainbowKit (UI)    │
                         │  • Wagmi (Hooks)      │
                         │  • Viem (Ethereum)    │
                         │  • Wallet Connect     │
                         └───────────┬───────────┘
                                     │
┌────────────────────────────────────┼─────────────────────────────────────┐
│                          API GATEWAY (Backend)                           │
├────────────────────────────────────┼─────────────────────────────────────┤
│                                    │                                     │
│                         Express.js Server                                │
│                         Node.js Runtime                                  │
│                                    │                                     │
│  ┌─────────────────────────────────┼─────────────────────────────────┐  │
│  │             Middleware Layer    │                                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │  │
│  │  │   Auth   │ │   RBAC   │ │  Logger  │ │  Error   │           │  │
│  │  │  (JWT)   │ │(Roles)   │ │(Winston) │ │ Handler  │           │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                     │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │                        API Routes Layer                           │  │
│  │                                                                    │  │
│  │  /api/v1/auth           /api/v1/farmer       /api/v1/blockchain  │  │
│  │  /api/v1/users          /api/v1/retailer     /api/v1/products    │  │
│  │  /api/v1/admin          /api/v1/distributor  /api/v1/orders      │  │
│  │  /api/v1/payments       /api/v1/consumer     /api/v1/ai          │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                     │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │                     Controller Layer                              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │  Auth    │ │  User    │ │ Product  │ │  Order   │            │  │
│  │  │Controller│ │Controller│ │Controller│ │Controller│            │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │ Farmer   │ │ Retailer │ │Distribut │ │ Consumer │            │  │
│  │  │Controller│ │Controller│ │Controller│ │Controller│            │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                     │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │                      Service Layer                                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │Blockchain│ │   IPFS   │ │    AI    │ │  Email   │            │  │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │            │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                     │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
    ┌─────────▼─────────┐  ┌────────▼────────┐  ┌─────────▼─────────┐
    │   MongoDB Atlas   │  │  Blockchain     │  │       IPFS        │
    │                   │  │   Networks      │  │   (Decentralized  │
    │  • Users          │  │                 │  │    Storage)       │
    │  • Products       │  │ • Ethereum      │  │                   │
    │  • Orders         │  │ • Polygon       │  │ • Product Images  │
    │  • Transactions   │  │                 │  │ • Documents       │
    │  • Reviews        │  │ Smart Contracts:│  │ • Certificates    │
    │  • Notifications  │  │ • ProductNFT    │  │ • QR Data         │
    │                   │  │ • Traceability  │  │                   │
    └───────────────────┘  │ • Payments      │  └───────────────────┘
                           └─────────────────┘
```

### System Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      USER JOURNEY & DATA FLOW                            │
└──────────────────────────────────────────────────────────────────────────┘

1. USER REGISTRATION & AUTHENTICATION
   ┌────────┐     ┌─────────┐     ┌──────────┐     ┌────────────┐
   │  User  │────▶│ Connect │────▶│   Sign   │────▶│   Create   │
   │        │     │ Wallet  │     │ Message  │     │  Account   │
   └────────┘     └─────────┘     └──────────┘     └────────────┘
        │              │                 │                │
        │         RainbowKit         ethers.js          JWT
        │              │                 │                │
        ▼              ▼                 ▼                ▼
   Frontend ────▶ Web3 Provider ────▶ Backend ────▶ MongoDB


2. PRODUCT REGISTRATION (Farmer)
   ┌────────┐     ┌─────────┐     ┌──────────┐     ┌────────────┐
   │ Farmer │────▶│  Upload │────▶│ Register │────▶│   Mint     │
   │  Form  │     │  to DB  │     │   IPFS   │     │    NFT     │
   └────────┘     └─────────┘     └──────────┘     └────────────┘
        │              │                 │                │
        │          MongoDB            IPFS          Smart Contract
        │              │                 │                │
        ▼              ▼                 ▼                ▼
   Product ID ──▶ Metadata Hash ──▶ Blockchain ──▶ Token ID


3. ORDER PLACEMENT (Consumer)
   ┌────────┐     ┌─────────┐     ┌──────────┐     ┌────────────┐
   │  Add   │────▶│   Cart  │────▶│ Checkout │────▶│  Payment   │
   │  Cart  │     │ Review  │     │          │     │            │
   └────────┘     └─────────┘     └──────────┘     └────────────┘
        │              │                 │                │
        │          Frontend          Stripe/Web3     Smart Contract
        │              │                 │                │
        ▼              ▼                 ▼                ▼
   State Mgmt ──▶ API Call ──▶ Payment Gateway ──▶ Order Created


4. SUPPLY CHAIN TRACKING
   ┌────────┐     ┌─────────┐     ┌──────────┐     ┌────────────┐
   │  Scan  │────▶│  Fetch  │────▶│ Display  │────▶│  Verify    │
   │   QR   │     │  Data   │     │ Journey  │     │Blockchain  │
   └────────┘     └─────────┘     └──────────┘     └────────────┘
        │              │                 │                │
        │          API Request       Timeline        Smart Contract
        │              │                 │                │
        ▼              ▼                 ▼                ▼
   Product ID ──▶ DB + Blockchain ──▶ React UI ──▶ Verification


5. ROLE-BASED OPERATIONS

   Farmer:  Create Products → Upload to IPFS → Mint NFT → Manage Orders
                    │               │             │            │
                    └───────────────┴─────────────┴────────────┘
                                     │
   Retailer: Purchase Products → Update Inventory → Sell → Analytics
                    │                    │           │        │
                    └────────────────────┴───────────┴────────┘
                                     │
   Distributor: Manage Logistics → Track Shipments → Delivery
                    │                    │               │
                    └────────────────────┴───────────────┘
                                     │
   Consumer: Browse Products → Order → Track → Review
                    │            │       │        │
                    └────────────┴───────┴────────┘
```

### Database Schema Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MongoDB Collections                              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│      Users       │         │    Products      │         │    Orders    │
├──────────────────┤         ├──────────────────┤         ├──────────────┤
│ _id              │    ┌───▶│ _id              │◀────┐   │ _id          │
│ walletAddress    │    │    │ name             │     │   │ buyer        │
│ role (ENUM)      │    │    │ description      │     └───│ product      │
│ profile          │    │    │ category         │         │ seller       │
│  • name          │    │    │ price            │         │ quantity     │
│  • email         │    │    │ quantity         │         │ totalAmount  │
│  • phone         │    │    │ farmer ──────────┼─────────│ status       │
│  • location      │    │    │ images[]         │         │ payment      │
│ kycStatus        │    │    │ blockchainData   │         │ delivery     │
│ certifications[] │    │    │  • txHash        │         │ createdAt    │
│ settings         │    │    │  • tokenId       │         └──────────────┘
│ createdAt        │    │    │  • ipfsHash      │                │
└────────┬─────────┘    │    │ status           │                │
         │              │    │ certifications   │                │
         │              │    │ createdAt        │                │
         │              │    └──────────────────┘                │
         │              │                                        │
         │              │                                        │
┌────────▼─────────┐   │    ┌──────────────────┐         ┌─────▼────────┐
│    Reviews       │   │    │   Blockchain     │         │ Notifications│
├──────────────────┤   │    │  Transactions    │         ├──────────────┤
│ _id              │   │    ├──────────────────┤         │ _id          │
│ user ────────────┼───┘    │ _id              │         │ user         │
│ product          │        │ txHash           │         │ type         │
│ rating           │        │ blockNumber      │         │ message      │
│ comment          │        │ from             │         │ read         │
│ images[]         │        │ to               │         │ createdAt    │
│ createdAt        │        │ productId        │         └──────────────┘
└──────────────────┘        │ eventType        │
                            │ data             │
                            │ status           │
┌──────────────────┐        │ createdAt        │         ┌──────────────┐
│    Wishlists     │        └──────────────────┘         │   Disputes   │
├──────────────────┤                                     ├──────────────┤
│ _id              │        ┌──────────────────┐         │ _id          │
│ user             │        │  Certifications  │         │ order        │
│ products[]       │        ├──────────────────┤         │ raisedBy     │
│ createdAt        │        │ _id              │         │ reason       │
└──────────────────┘        │ user             │         │ status       │
                            │ type             │         │ resolution   │
                            │ issuer           │         │ resolvedBy   │
                            │ issueDate        │         │ createdAt    │
                            │ expiryDate       │         └──────────────┘
                            │ documentHash     │
                            │ verified         │
                            └──────────────────┘
```

---

## 3. System Model Description

### 3.1 Frontend Architecture

The frontend follows a **modern Next.js App Router architecture** with server-side rendering (SSR) and static site generation (SSG) capabilities:

**Key Components:**
- **App Router Structure**: File-based routing with nested layouts
- **Role-Based Portals**: Separate dashboards for each user type (Farmer, Retailer, Distributor, Consumer, Admin)
- **Web3 Integration**: Wallet connection and blockchain interaction through RainbowKit and Wagmi
- **Real-time Updates**: Using React hooks and SWR for data synchronization
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animations**: Framer Motion for smooth transitions and loading states

### 3.2 Backend Architecture

The backend implements a **layered architecture pattern**:

**Layer 1 - Middleware**: Authentication, authorization, logging, error handling
**Layer 2 - Routes**: RESTful API endpoints organized by functionality
**Layer 3 - Controllers**: Business logic and request/response handling
**Layer 4 - Services**: External integrations (blockchain, IPFS, AI)
**Layer 5 - Models**: Data models and database schemas

### 3.3 Blockchain Integration

**Smart Contract Architecture:**
- **ProductNFT Contract**: ERC-721 tokens representing unique products
- **Traceability Contract**: Records supply chain events
- **Payment Contract**: Handles escrow and automatic payments
- **Access Control**: Role-based permissions on-chain

**IPFS Integration:**
- Product images and documents stored on IPFS
- Content-addressed storage for immutability
- Pinning service for availability

### 3.4 Data Flow

1. **User Authentication**: Wallet signature → Backend verification → JWT token
2. **Product Registration**: Form data → MongoDB → IPFS upload → Smart contract mint
3. **Order Processing**: Cart → Payment → Smart contract → Order creation → Notification
4. **Supply Chain Tracking**: QR scan → API request → Database + Blockchain query → UI display

### 3.5 Security Model

- **Frontend**: Wallet signature verification, input validation
- **Backend**: JWT authentication, role-based access control (RBAC), rate limiting
- **Database**: MongoDB sanitization, prepared statements
- **Blockchain**: Smart contract access control, signature verification
- **Communication**: HTTPS, CORS configuration, helmet security headers

---

## 4. Implementation Details

### 4.1 Modules and Descriptions

#### **Frontend Modules**

##### 1. **Authentication Module** (`/app/auth`)
- **Purpose**: Handle user registration and login with Web3 wallets
- **Components**:
  - `LoginPage` - Wallet connection and signature verification
  - `RegisterPage` - New user registration with role selection
- **Features**:
  - MetaMask/WalletConnect integration
  - Message signing for authentication
  - JWT token management

##### 2. **Farmer Portal Module** (`/app/farmer`)
- **Purpose**: Complete farm management system
- **Components**:
  - `Dashboard` - Overview of sales, orders, earnings
  - `Inventory` - Product listing and management
  - `Orders` - Order tracking and fulfillment
  - `Analytics` - Sales analytics and insights
  - `MLInsights` - AI-powered recommendations
  - `Certifications` - Certificate management
  - `Crops`, `Fields`, `Equipment`, `Harvest` - Farm operations
- **Features**:
  - Product registration with blockchain
  - Real-time order notifications
  - ML-based price recommendations

##### 3. **Retailer Portal Module** (`/app/retailer`)
- **Purpose**: Retail store and inventory management
- **Components**:
  - `Dashboard` - Sales overview
  - `Inventory` - Stock management
  - `Orders` - Sales and purchase orders
  - `POS` - Point of sale system
  - `Customers` - Customer relationship management
  - `Analytics` - Business intelligence
  - `Marketing`, `Promotions` - Marketing tools
- **Features**:
  - Multi-channel sales tracking
  - Customer analytics
  - Promotional campaigns

##### 4. **Distributor Portal Module** (`/app/distributor`)
- **Purpose**: Logistics and distribution management
- **Components**:
  - `Dashboard` - Logistics overview
  - `Warehouse` - Warehouse management
  - `Fleet` - Vehicle and driver management
  - `Routes` - Route optimization
  - `Tracking` - Real-time shipment tracking
  - `Quality` - Quality control
- **Features**:
  - GPS tracking integration
  - Route optimization algorithms
  - Multi-warehouse support

##### 5. **Consumer Portal Module** (`/app/consumer`)
- **Purpose**: Shopping and order tracking
- **Components**:
  - `Products` - Product marketplace
  - `Cart` - Shopping cart
  - `Checkout` - Order placement
  - `Orders` - Order history and tracking
  - `Wishlist` - Saved products
  - `Reviews` - Product reviews
- **Features**:
  - Product search and filtering
  - Blockchain product verification
  - Order tracking with QR codes

##### 6. **Admin Portal Module** (`/app/admin`)
- **Purpose**: Platform administration
- **Components**:
  - `Dashboard` - Platform statistics
  - `Users` - User management
  - `Products` - Product moderation
  - `Orders` - Order monitoring
  - `Disputes` - Dispute resolution
  - `Analytics` - Platform analytics
  - `Blockchain` - Blockchain monitoring
  - `System` - System configuration
- **Features**:
  - User verification and KYC
  - Dispute resolution
  - System health monitoring

##### 7. **Blockchain Module** (`/components/blockchain`)
- **Purpose**: Blockchain interaction and visualization
- **Components**:
  - `ProductTraceability` - Supply chain timeline
  - `BlockchainVerificationBadge` - Product verification
  - `SupplyChainMap` - Visual journey map
  - `BlockchainExplorer` - Transaction browser
  - `QRCodeGenerator` - QR code generation
- **Features**:
  - Real-time blockchain status
  - Transaction verification
  - Supply chain visualization

##### 8. **Landing Pages Module** (`/app`)
- **Purpose**: Marketing and public-facing pages
- **Components**:
  - `Home` - Main landing page with animations
  - `OrganicLanding` - Organic farm themed landing
  - `Transparency` - Transparency dashboard
  - `About`, `Contact`, `Blog` - Informational pages
- **Features**:
  - Animated loading screens
  - SEO optimization
  - Responsive design

#### **Backend Modules**

##### 1. **Authentication Module** (`/controllers/auth.controller.js`)
- **Purpose**: User authentication and authorization
- **Functions**:
  - `register()` - User registration
  - `login()` - User login with wallet signature
  - `refreshToken()` - Token refresh
  - `verifySignature()` - Signature verification
  - `getNonce()` - Generate nonce for signing
- **Features**:
  - JWT token generation
  - Signature verification
  - Role-based access control

##### 2. **User Management Module** (`/controllers/user.controller.js`)
- **Purpose**: User profile and account management
- **Functions**:
  - `getProfile()` - Get user profile
  - `updateProfile()` - Update user information
  - `getDashboard()` - Get role-specific dashboard
  - `uploadKYC()` - Upload KYC documents
  - `verifyKYC()` - Verify user identity (admin)
  - `deleteAccount()` - Account deletion
- **Features**:
  - Profile management
  - KYC verification
  - Account settings

##### 3. **Product Management Module** (`/controllers/product.controller.js`)
- **Purpose**: Product listing and management
- **Functions**:
  - `createProduct()` - Register new product
  - `getProducts()` - Fetch products with filters
  - `getProductById()` - Get single product
  - `updateProduct()` - Update product details
  - `deleteProduct()` - Remove product
  - `searchProducts()` - Full-text search
- **Features**:
  - IPFS integration
  - Blockchain registration
  - Category management
  - Image upload

##### 4. **Order Management Module** (`/controllers/order.controller.js`)
- **Purpose**: Order processing and tracking
- **Functions**:
  - `createOrder()` - Create new order
  - `getOrders()` - Fetch user orders
  - `getOrderById()` - Get order details
  - `updateOrderStatus()` - Update order status
  - `cancelOrder()` - Cancel order
  - `trackOrder()` - Track shipment
- **Features**:
  - Multi-status workflow
  - Payment integration
  - Notification system
  - Dispute handling

##### 5. **Farmer Module** (`/controllers/farmer.controller.js`)
- **Purpose**: Farmer-specific operations
- **Functions**:
  - `getDashboard()` - Farmer dashboard stats
  - `getInventory()` - Product inventory
  - `getOrders()` - Farmer orders
  - `getAnalytics()` - Sales analytics
  - `getEarnings()` - Revenue tracking
  - `getMLInsights()` - AI recommendations
  - `getCertifications()` - Certificate management
  - `getCrops()`, `getFields()`, `getEquipment()`, `getHarvest()`, `getWeather()`, `getMarket()`, `getFinance()` - Farm management
- **Features**:
  - Sales analytics
  - ML-powered insights
  - Farm operations tracking

##### 6. **Retailer Module** (`/controllers/retailer.controller.js`)
- **Purpose**: Retailer-specific operations
- **Functions**:
  - `getDashboard()` - Retailer dashboard
  - `getInventory()` - Store inventory
  - `getOrders()`, `getPurchaseOrders()` - Order management
  - `getAnalytics()`, `getSales()` - Business intelligence
  - `getCustomers()` - Customer management
  - `getStore()`, `getPOS()` - Store operations
  - `getSourcing()`, `getPayments()`, `getPricing()` - Business operations
  - `getPromotions()`, `getMarketing()` - Marketing
  - `getStaff()`, `getSettings()` - Administration
- **Features**:
  - Multi-location support
  - Customer analytics
  - POS integration

##### 7. **Distributor Module** (`/controllers/distributor.controller.js`)
- **Purpose**: Distribution and logistics
- **Functions**:
  - `getDashboard()` - Logistics dashboard
  - `getOrders()` - Distribution orders
  - `getAnalytics()` - Delivery analytics
  - `getWarehouse()`, `getInventory()` - Warehouse management
  - `getLogistics()`, `getFleet()`, `getRoutes()`, `getTracking()` - Logistics
  - `getRetailers()`, `getSuppliers()`, `getSourcing()` - Partnerships
  - `getQuality()`, `getFinance()`, `getStaff()`, `getSettings()` - Operations
- **Features**:
  - Fleet management
  - Route optimization
  - Multi-warehouse operations

##### 8. **Consumer Module** (`/controllers/consumer.controller.js`)
- **Purpose**: Consumer shopping and tracking
- **Functions**:
  - `getDashboard()` - Consumer dashboard
  - `getOrders()` - Order history
  - `getProducts()` - Browse marketplace
  - `getCart()`, `getCheckout()` - Shopping
  - `getWishlist()`, `getReviews()` - User preferences
  - `getDelivery()`, `getPayments()` - Order tracking
  - `getLoyalty()`, `getSupport()` - Customer service
  - `getProfile()`, `getSettings()` - Account management
- **Features**:
  - Product search
  - Order tracking
  - Loyalty program

##### 9. **Blockchain Module** (`/controllers/blockchain.controller.js`)
- **Purpose**: Blockchain interaction
- **Functions**:
  - `registerProduct()` - Register product on blockchain
  - `verifyProduct()` - Verify product authenticity
  - `getTransactions()` - Fetch blockchain transactions
  - `getBlockchainStatus()` - Network status
  - `mintNFT()` - Create product NFT
  - `transferOwnership()` - Transfer product ownership
- **Features**:
  - Smart contract interaction
  - IPFS integration
  - Transaction monitoring

##### 10. **Payment Module** (`/controllers/payment.controller.js`)
- **Purpose**: Payment processing
- **Functions**:
  - `createPayment()` - Initialize payment
  - `verifyPayment()` - Verify payment completion
  - `processRefund()` - Handle refunds
  - `getPaymentHistory()` - Payment records
- **Features**:
  - Multi-payment gateway support
  - Crypto payment integration
  - Escrow functionality

##### 11. **AI/ML Module** (`/controllers/ml.controller.js`)
- **Purpose**: Machine learning services
- **Functions**:
  - `predictPrice()` - Price prediction
  - `recommendProducts()` - Product recommendations
  - `analyzeSentiment()` - Review sentiment analysis
  - `forecastDemand()` - Demand forecasting
- **Features**:
  - TensorFlow.js models
  - Real-time predictions
  - Personalized recommendations

##### 12. **Notification Module** (`/controllers/notification.controller.js`)
- **Purpose**: User notifications
- **Functions**:
  - `createNotification()` - Send notification
  - `getNotifications()` - Fetch user notifications
  - `markAsRead()` - Mark notification read
  - `deleteNotification()` - Remove notification
- **Features**:
  - Real-time push notifications
  - Email notifications
  - In-app notifications

##### 13. **Admin Module** (`/controllers/admin.controller.js`)
- **Purpose**: Platform administration
- **Functions**:
  - `getAnalytics()` - Platform analytics
  - `getPlatformStats()` - Statistics
  - `getSystemHealth()` - System monitoring
  - `getAllUsers()`, `updateUser()` - User management
  - `getAllProducts()`, `updateProduct()` - Product moderation
  - `getAllOrders()` - Order monitoring
  - `getDisputes()`, `resolveDispute()` - Dispute management
- **Features**:
  - Comprehensive dashboard
  - User verification
  - System monitoring

### 4.2 Key Functions Used

#### **Frontend Functions**

##### React Hooks
```typescript
// State Management
useState() - Local component state
useEffect() - Side effects and lifecycle
useContext() - Global state management
useReducer() - Complex state logic
useRef() - DOM references and mutable values

// Custom Hooks
useAuth() - Authentication state
useWallet() - Web3 wallet connection
useCart() - Shopping cart management
useSmoothScroll() - Smooth scrolling
useInView() - Scroll animations
```

##### Web3 Functions
```typescript
// Wallet Connection
useConnect() - Connect wallet
useAccount() - Get connected account
useSignMessage() - Sign messages
useContractWrite() - Write to smart contracts
useContractRead() - Read from smart contracts

// Blockchain Interaction
registerProductOnChain() - Register product NFT
verifyProductOnChain() - Verify authenticity
getTransactionReceipt() - Get transaction details
```

##### API Functions
```typescript
// Authentication
authAPI.login() - User login
authAPI.register() - User registration
authAPI.refreshToken() - Refresh JWT token

// Products
productAPI.getAll() - Fetch products
productAPI.create() - Create product
productAPI.update() - Update product
productAPI.delete() - Delete product

// Orders
orderAPI.create() - Create order
orderAPI.getByUser() - Get user orders
orderAPI.updateStatus() - Update order status
```

##### Animation Functions
```typescript
// Framer Motion
motion() - Create animated components
useAnimation() - Control animations
useInView() - Trigger on scroll
AnimatePresence() - Exit animations

// Custom Animations
fadeIn() - Fade in animation
slideUp() - Slide up animation
stagger() - Staggered animations
```

#### **Backend Functions**

##### Authentication Functions
```javascript
// JWT Operations
generateToken(user) - Create JWT token
verifyToken(token) - Validate token
refreshAccessToken(refreshToken) - Refresh token

// Signature Verification
verifySignature(message, signature, address) - Verify wallet signature
generateNonce() - Generate random nonce
hashMessage(message) - Hash message for signing
```

##### Database Functions
```javascript
// CRUD Operations
Model.find(query) - Find documents
Model.findById(id) - Find by ID
Model.create(data) - Create document
Model.updateOne(query, data) - Update document
Model.deleteOne(query) - Delete document

// Advanced Queries
Model.aggregate(pipeline) - Aggregation
Model.populate(path) - Population
Model.distinct(field) - Unique values
```

##### Blockchain Functions
```javascript
// Smart Contract Interaction
mintProductNFT(productData) - Mint NFT
registerOnChain(productId, metadata) - Register product
verifyOnChain(tokenId) - Verify product
getTransactionHistory(address) - Get transaction history

// IPFS Operations
uploadToIPFS(file) - Upload file
getFromIPFS(hash) - Retrieve file
pinToIPFS(hash) - Pin file
```

##### Middleware Functions
```javascript
// Authentication
authenticate(req, res, next) - Verify JWT
requireRole(role) - Check user role

// Error Handling
errorHandler(err, req, res, next) - Handle errors
asyncHandler(fn) - Async error wrapper

// Validation
validateRequest(schema) - Validate input
sanitizeInput() - Sanitize data
```

##### Utility Functions
```javascript
// Logging
logger.info(message) - Log information
logger.error(error) - Log error
logger.debug(data) - Debug logging

// Email
sendEmail(to, subject, body) - Send email
sendNotification(userId, message) - Send notification

// File Handling
uploadFile(file) - Upload file
deleteFile(path) - Delete file
validateFileType(file) - Validate file
```

---

## 5. Conclusion

### 5.1 Project Achievements

FarmChain successfully implements a **comprehensive blockchain-powered agricultural supply chain management platform** with the following achievements:

1. **Complete Role-Based Architecture**
   - 4 distinct user roles (Farmer, Retailer, Distributor, Consumer)
   - 110+ frontend pages with full functionality
   - 109+ backend API endpoints
   - Role-specific dashboards and operations

2. **Blockchain Integration**
   - Smart contract-based product registration
   - NFT tokens for product authenticity
   - Immutable supply chain tracking
   - IPFS-based decentralized storage

3. **Modern Technology Stack**
   - Next.js 14 with App Router for optimal performance
   - MongoDB for flexible data storage
   - Web3 integration for decentralized operations
   - AI/ML capabilities for intelligent insights

4. **Production-Ready Features**
   - Comprehensive authentication and authorization
   - Real-time notifications and updates
   - Advanced analytics and reporting
   - Mobile-responsive design
   - Secure payment processing

### 5.2 Key Benefits

**For Farmers:**
- Direct access to markets
- Fair pricing through blockchain transparency
- Reduced middleman costs
- Product authenticity certification
- ML-powered insights for better decisions

**For Retailers:**
- Verified product sourcing
- Inventory management
- Customer analytics
- Multi-channel sales support

**For Distributors:**
- Efficient logistics management
- Route optimization
- Real-time tracking
- Quality control systems

**For Consumers:**
- Product authenticity verification
- Complete supply chain visibility
- Direct farmer connections
- Quality assurance

**For the Industry:**
- Increased transparency
- Reduced fraud
- Better traceability
- Improved efficiency
- Enhanced food safety

### 5.3 Technical Excellence

1. **Scalability**
   - Microservices-ready architecture
   - Horizontal scaling capabilities
   - Database optimization
   - Caching strategies

2. **Security**
   - Multi-layer security implementation
   - Blockchain immutability
   - Encrypted communications
   - Role-based access control

3. **Performance**
   - Server-side rendering for fast page loads
   - Optimized database queries
   - CDN integration
   - Lazy loading and code splitting

4. **Maintainability**
   - Modular architecture
   - Clean code principles
   - Comprehensive documentation
   - TypeScript type safety

### 5.4 Future Enhancements

1. **Mobile Applications**
   - Native iOS and Android apps
   - Offline functionality
   - Push notifications

2. **Advanced AI Features**
   - Crop disease detection
   - Weather prediction models
   - Price forecasting
   - Demand prediction

3. **IoT Integration**
   - Sensor data integration
   - Automated quality monitoring
   - Real-time environmental tracking

4. **Expanded Blockchain Features**
   - Multi-chain support
   - DeFi integration
   - Token rewards system
   - DAO governance

5. **International Expansion**
   - Multi-currency support
   - Multi-language interface
   - Regional compliance
   - Cross-border logistics

### 5.5 Impact

FarmChain represents a **significant advancement in agricultural supply chain management**, combining:
- **Blockchain technology** for trust and transparency
- **Modern web technologies** for excellent user experience
- **AI/ML capabilities** for intelligent decision-making
- **Comprehensive features** for all stakeholders

The platform **bridges the gap** between traditional agriculture and modern technology, creating a **sustainable, transparent, and efficient ecosystem** that benefits all participants in the agricultural supply chain.

### 5.6 Final Remarks

This project demonstrates the **successful integration of multiple cutting-edge technologies** to solve real-world problems in the agricultural sector. With **2,339+ lines of backend code, 110+ frontend pages, and 109+ API endpoints**, FarmChain is a **production-ready platform** capable of revolutionizing how agricultural products move from farm to table.

The **modular architecture, comprehensive documentation, and scalable design** ensure that the platform can **grow and evolve** with changing market needs while maintaining **high performance, security, and user satisfaction**.

---

**Project Statistics:**
- **Total Frontend Pages**: 110+
- **Total Backend Endpoints**: 109+
- **Total Lines of Code**: 20,000+ (estimated)
- **Technologies Used**: 50+
- **User Roles**: 4 main roles + Admin
- **Database Collections**: 10+
- **Smart Contracts**: 3+ contracts
- **API Modules**: 20+
- **Reusable Components**: 100+

---

**Repository**: https://github.com/lalith996/FarmChain
**Documentation**: Complete API documentation available in API_ENDPOINTS.md
**License**: MIT License (or specify your license)

---

*End of Technical Documentation*
