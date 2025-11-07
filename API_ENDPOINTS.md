# FarmChain API Endpoints Documentation

Complete list of all available API endpoints organized by role and functionality.

**Base URL**: `/api/v1`

---

## Table of Contents
- [Authentication](#authentication)
- [Farmer Endpoints](#farmer-endpoints)
- [Retailer Endpoints](#retailer-endpoints)
- [Distributor Endpoints](#distributor-endpoints)
- [Consumer Endpoints](#consumer-endpoints)
- [General Endpoints](#general-endpoints)
- [Admin Endpoints](#admin-endpoints)

---

## Authentication

### Auth Routes (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user
- `POST /verify-signature` - Verify wallet signature
- `GET /nonce` - Get nonce for signing

---

## Farmer Endpoints

**Base**: `/api/v1/farmer`
**Required Role**: FARMER

### Dashboard & Analytics
- `GET /dashboard` - Get farmer dashboard with stats
- `GET /analytics` - Get sales analytics (supports `?period=7d|30d|90d|1y`)
- `GET /earnings` - Get earnings and transactions
- `GET /finance` - Get financial overview

### Products & Inventory
- `GET /inventory` - Get product inventory (supports pagination, status, category filters)
- `GET /listings` - Get all active listings

### Orders
- `GET /orders` - Get farmer's orders (supports pagination, status filter)

### ML & Insights
- `GET /ml-insights` - Get ML-powered insights (price recommendations, demand forecast)

### Certifications
- `GET /certifications` - Get farmer's certifications

### Farm Management
- `GET /crops` - Get crops data
- `GET /fields` - Get fields/land data
- `GET /equipment` - Get equipment inventory
- `GET /harvest` - Get harvest records
- `GET /weather` - Get weather data and forecasts

### Market
- `GET /market` - Get marketplace products

**Frontend Pages Supported**:
- `/farmer` (Dashboard)
- `/farmer/analytics`
- `/farmer/earnings`
- `/farmer/inventory`
- `/farmer/listings`
- `/farmer/orders`
- `/farmer/ml-insights`
- `/farmer/certifications`
- `/farmer/crops`
- `/farmer/fields`
- `/farmer/equipment`
- `/farmer/harvest`
- `/farmer/weather`
- `/farmer/market`
- `/farmer/finance`

---

## Retailer Endpoints

**Base**: `/api/v1/retailer`
**Required Role**: RETAILER

### Dashboard & Analytics
- `GET /dashboard` - Get retailer dashboard with stats
- `GET /analytics` - Get sales analytics (supports `?period=7d|30d`)
- `GET /sales` - Get sales history

### Inventory
- `GET /inventory` - Get product inventory (supports pagination, status filter)

### Orders
- `GET /orders` - Get sales orders (supports pagination, status filter)
- `GET /orders/purchase` - Get purchase orders from suppliers

### Customers
- `GET /customers` - Get customer list

### Store Management
- `GET /store` - Get store information
- `GET /pos` - Get POS data

### Sourcing
- `GET /sourcing` - Get available products for sourcing

### Payments & Pricing
- `GET /payments` - Get payment history
- `GET /pricing` - Get product pricing data

### Marketing
- `GET /promotions` - Get active promotions
- `GET /marketing` - Get marketing campaigns

### Staff & Settings
- `GET /staff` - Get staff members
- `GET /settings` - Get retailer settings

**Frontend Pages Supported**:
- `/retailer` (Dashboard)
- `/retailer/analytics`
- `/retailer/inventory`
- `/retailer/orders`
- `/retailer/orders/purchase`
- `/retailer/customers`
- `/retailer/sales`
- `/retailer/store`
- `/retailer/pos`
- `/retailer/sourcing`
- `/retailer/payments`
- `/retailer/pricing`
- `/retailer/promotions`
- `/retailer/marketing`
- `/retailer/staff`
- `/retailer/settings`

---

## Distributor Endpoints

**Base**: `/api/v1/distributor`
**Required Role**: DISTRIBUTOR

### Dashboard & Analytics
- `GET /dashboard` - Get distributor dashboard with stats
- `GET /analytics` - Get delivery analytics

### Orders
- `GET /orders` - Get distribution orders (supports pagination, status filter)

### Warehouse & Inventory
- `GET /warehouse` - Get warehouse data
- `GET /inventory` - Get inventory across warehouses

### Logistics
- `GET /logistics` - Get logistics data
- `GET /fleet` - Get fleet/vehicle information
- `GET /routes` - Get delivery routes
- `GET /tracking` - Get active shipment tracking

### Business Relationships
- `GET /retailers` - Get retailer partners
- `GET /suppliers` - Get supplier/farmer partners
- `GET /sourcing` - Get available products for sourcing

### Quality & Finance
- `GET /quality` - Get quality inspection data
- `GET /finance` - Get financial overview

### Staff & Settings
- `GET /staff` - Get staff members
- `GET /settings` - Get distributor settings

**Frontend Pages Supported**:
- `/distributor` (Dashboard)
- `/distributor/analytics`
- `/distributor/orders`
- `/distributor/warehouse`
- `/distributor/inventory`
- `/distributor/logistics`
- `/distributor/fleet`
- `/distributor/routes`
- `/distributor/tracking`
- `/distributor/retailers`
- `/distributor/suppliers`
- `/distributor/sourcing`
- `/distributor/quality`
- `/distributor/finance`
- `/distributor/staff`
- `/distributor/settings`

---

## Consumer Endpoints

**Base**: `/api/v1/consumer`
**Required Role**: CONSUMER

### Dashboard
- `GET /dashboard` - Get consumer dashboard with order stats

### Shopping
- `GET /products` - Get marketplace products (supports pagination, category, search)
- `GET /cart` - Get shopping cart
- `GET /checkout` - Get checkout data

### Orders
- `GET /orders` - Get consumer orders (supports pagination, status filter)

### Wishlist & Reviews
- `GET /wishlist` - Get wishlist items
- `GET /reviews` - Get user's product reviews

### Delivery & Payments
- `GET /delivery` - Get active deliveries
- `GET /payments` - Get payment history

### Loyalty & Support
- `GET /loyalty` - Get loyalty points and rewards
- `GET /support` - Get support tickets

### Profile & Settings
- `GET /profile` - Get consumer profile
- `GET /settings` - Get consumer settings

**Frontend Pages Supported**:
- `/consumer` (Dashboard)
- `/consumer/products`
- `/consumer/cart`
- `/consumer/checkout`
- `/consumer/orders`
- `/consumer/wishlist`
- `/consumer/reviews`
- `/consumer/delivery`
- `/consumer/payments`
- `/consumer/loyalty`
- `/consumer/support`
- `/consumer/profile`
- `/consumer/settings`

---

## General Endpoints

### Users (`/api/v1/users`)
- `GET /profile` - Get user profile (requires auth)
- `PUT /profile` - Update user profile (requires auth)
- `GET /dashboard` - Get user dashboard (requires auth)
- `DELETE /account` - Delete user account (requires auth)
- `POST /kyc/upload` - Upload KYC documents (requires auth)
- `PUT /:userId/verify` - Verify user KYC (admin only)
- `GET /search` - Search users (public)
- `GET /:userId` - Get user by ID (public)
- `GET /` - Get all users (admin only)
- `GET /stats/overview` - Get user stats (admin only)

### Products (`/api/v1/products`)
- `GET /` - Get all products
- `POST /` - Create product (requires auth)
- `GET /:id` - Get product by ID
- `PUT /:id` - Update product (requires auth)
- `DELETE /:id` - Delete product (requires auth)

### Orders (`/api/v1/orders`)
- `GET /` - Get orders (requires auth)
- `POST /` - Create order (requires auth)
- `GET /:id` - Get order by ID (requires auth)
- `PUT /:id` - Update order (requires auth)
- `DELETE /:id` - Cancel order (requires auth)

### Blockchain (`/api/v1/blockchain`)
- `GET /status` - Get blockchain status
- `POST /register-product` - Register product on blockchain
- `GET /verify/:productId` - Verify product on blockchain
- `GET /transactions` - Get blockchain transactions
- `GET /transaction/:txHash` - Get transaction details

### Payments (`/api/v1/payments`)
- `POST /create` - Create payment
- `GET /:id` - Get payment by ID
- `POST /verify` - Verify payment

### Notifications (`/api/v1/notifications`)
- `GET /` - Get user notifications (requires auth)
- `PUT /:id/read` - Mark notification as read (requires auth)
- `DELETE /:id` - Delete notification (requires auth)

### Wishlists (`/api/v1/wishlists`)
- `GET /` - Get user wishlist (requires auth)
- `POST /add` - Add to wishlist (requires auth)
- `DELETE /remove/:productId` - Remove from wishlist (requires auth)

### Reviews (`/api/v1/reviews`)
- `GET /product/:productId` - Get product reviews
- `POST /` - Create review (requires auth)
- `PUT /:id` - Update review (requires auth)
- `DELETE /:id` - Delete review (requires auth)

### AI & ML (`/api/v1/ai`)
- `POST /predict-price` - Get price prediction
- `POST /recommend` - Get product recommendations
- `POST /analyze` - Analyze data

### Chatbot (`/api/v1/chatbot`)
- `POST /message` - Send message to chatbot

### Delivery (`/api/v1/delivery`)
- `GET /track/:orderId` - Track delivery
- `POST /update-status` - Update delivery status (requires auth)

### IPFS (`/api/v1/ipfs`)
- `POST /upload` - Upload file to IPFS
- `GET /file/:hash` - Get file from IPFS

### QR Codes (`/api/v1/qr`)
- `POST /generate` - Generate QR code
- `GET /verify/:code` - Verify QR code

---

## Admin Endpoints

**Base**: `/api/v1/admin`
**Required Role**: ADMIN

### Analytics & Stats
- `GET /analytics` - Get platform analytics
- `GET /stats` - Get platform statistics
- `GET /health` - Get system health
- `GET /activity` - Get activity logs

### User Management
- `GET /users` - Get all users
- `PUT /users/:userId` - Update user

### Product Management
- `GET /products` - Get all products
- `PUT /products/:productId` - Update product

### Order Management
- `GET /orders` - Get all orders

### Dispute Management
- `GET /disputes` - Get all disputes
- `PUT /disputes/:orderId/resolve` - Resolve dispute

**Frontend Pages Supported**:
- `/admin` (Dashboard)
- `/admin/analytics`
- `/admin/users`
- `/admin/products`
- `/admin/orders`
- `/admin/disputes`
- `/admin/certifications`
- `/admin/blockchain`
- `/admin/payments`
- `/admin/reports`
- `/admin/verification`
- `/admin/system`

---

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "totalPages": 10,
    "currentPage": 1,
    "total": 100
  }
}
```

---

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Filtering
- `status` - Filter by status
- `category` - Filter by category
- `search` - Search query
- `period` - Time period (7d, 30d, 90d, 1y)

---

## Authentication

Most endpoints require authentication using JWT Bearer tokens:

```
Authorization: Bearer <access_token>
```

Get access token by calling `/api/v1/auth/login` endpoint.

---

## Total Endpoints Summary

- **Farmer**: 15 endpoints
- **Retailer**: 15 endpoints
- **Distributor**: 16 endpoints
- **Consumer**: 13 endpoints
- **General**: 40+ endpoints
- **Admin**: 10 endpoints

**Total Frontend Pages**: 110+
**Total Backend Endpoints**: 109+

All frontend pages now have corresponding backend API endpoints! ✅
