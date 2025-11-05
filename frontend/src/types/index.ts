export interface User {
  _id: string;
  walletAddress: string;
  role: 'farmer' | 'distributor' | 'retailer' | 'consumer' | 'admin';
  profile: {
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    location?: {
      address: string;
      city: string;
      state: string;
      country: string;
    };
  };
  verification: {
    isVerified: boolean;
    kycStatus: 'pending' | 'approved' | 'rejected';
  };
  rating: {
    average: number;
    count: number;
  };
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  _id: string;
  productId: string;
  farmer: User;
  farmerWallet: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  certifications: string[];
  quantityAvailable: number;
  quantitySold: number;
  unit: string;
  originalPrice: number;
  currentPrice: number;
  currency: string;
  qualityGrade: 'A' | 'B' | 'C';
  aiQualityScore?: number;
  harvestDate?: string;
  expiryDate?: string;
  storageType?: string;
  currentOwner: string;
  currentOwnerWallet: string;
  status: string;
  location?: string;
  lastUpdated: string;
  contractAddress?: string;
  registrationTxHash?: string;
  isActive: boolean;
  createdAt: string;
  // Keep nested structure for backward compatibility
  basicInfo?: {
    name: string;
    description: string;
    category: string;
    images: string[];
    certifications: string[];
  };
  quantity?: {
    available: number;
    sold: number;
    unit: string;
  };
  pricing?: {
    basePrice: number;
    currentPrice: number;
    currency: string;
  };
  quality?: {
    grade: 'A' | 'B' | 'C';
    aiQualityScore?: number;
  };
  supplyChain?: {
    currentOwner: string;
    currentOwnerWallet: string;
    status: string;
    location?: string;
    lastUpdated: string;
  };
  blockchain?: {
    contractAddress: string;
    registrationTxHash: string;
  };
}

export interface Order {
  _id: string;
  orderId: string;
  buyer: User;
  seller: User;
  product: Product;
  productSnapshot: {
    productId: string;
    name: string;
    category: string;
    images: string[];
    grade: string;
  };
  orderDetails: {
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalAmount: number;
    currency: string;
  };
  delivery: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    expectedDate?: string;
    actualDate?: string;
  };
  status: string;
  payment: {
    paymentId?: string;
    method: string;
    status: string;
    transactionHash?: string;
    paidAt?: string;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  rating?: {
    score: number;
    review?: string;
    ratedAt: string;
  };
  blockchainTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'payment' | 'product' | 'kyc';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface DashboardStats {
  totalProducts?: number;
  activeProducts?: number;
  totalOrders?: number;
  totalRevenue?: number;
  totalPurchases?: number;
  activeOrders?: number;
  totalSpent?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
