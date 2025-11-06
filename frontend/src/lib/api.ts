/**
 * API Client for FarmChain Backend
 * Centralized axios instance with interceptors and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const API_TIMEOUT = 10000; // 10 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Error Handler
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    // Network error (no response)
    if (!axiosError.response) {
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
        status: 0,
      };
    }

    // Server error response
    const data = axiosError.response.data;
    return {
      message: data?.message || data?.error || 'An error occurred',
      code: data?.code || 'UNKNOWN_ERROR',
      status: axiosError.response.status,
      errors: data?.errors,
    };
  }

  // Handle Web3/Wagmi errors (which have {code, message} structure)
  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as any;
    return {
      message: err.message || 'An unexpected error occurred',
      code: err.code || 'UNKNOWN_ERROR',
    };
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred',
    code: 'UNEXPECTED_ERROR',
  };
};

// Web3/Wallet Error Handler
// Handles Wagmi/Web3 errors that have different structure than API errors
export const handleWeb3Error = (error: unknown): string => {
  if (!error) return 'An unknown error occurred';

  // Handle error object with message property
  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // User rejected the request
    if (err.code === 4001 || err.code === 'ACTION_REJECTED' || err.message?.includes('User rejected')) {
      return 'Transaction rejected. Please try again.';
    }

    // Wallet not connected
    if (err.code === 'CONNECTOR_NOT_FOUND' || err.message?.includes('Connector not found')) {
      return 'Please connect your wallet first.';
    }

    // Network error
    if (err.code === 'NETWORK_ERROR') {
      return 'Network error. Please check your connection.';
    }

    // Generic error with message
    if (err.message) {
      return String(err.message);
    }

    // API error structure
    if (err.response?.data?.message) {
      return String(err.response.data.message);
    }

    if (err.response?.data?.error) {
      return String(err.response.data.error);
    }
  }

  // Fallback: convert to string
  return String(error);
};

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  // Request nonce for wallet authentication
  requestNonce: async (walletAddress: string) => {
    const response = await apiClient.post('/auth/request-nonce', { walletAddress });
    return response.data;
  },

  // Verify signature and login
  login: async (walletAddress: string, signature: string, message: string, nonce: string) => {
    const response = await apiClient.post('/auth/login', {
      walletAddress,
      signature,
      message,
      nonce,
    });
    return response.data;
  },

  // Register new user
  register: async (userData: {
    walletAddress: string;
    signature: string;
    message: string;
    nonce: string;
    role: string;
    profile: {
      name: string;
      email: string;
      phone?: string;
      location?: {
        address?: string;
        city: string;
        state: string;
        country: string;
      };
    };
  }) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Refresh access token
  refresh: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  // Get user by ID
  getById: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: any) => {
    const response = await apiClient.put(`/users/${userId}`, updates);
    return response.data;
  },

  // Get user's products
  getUserProducts: async (userId: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/users/${userId}/products`, { params });
    return response.data;
  },

  // Get user's orders
  getUserOrders: async (userId: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/users/${userId}/orders`, { params });
    return response.data;
  },
};

// ============================================================================
// PRODUCT API
// ============================================================================

export const productAPI = {
  // Get all products
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
  }) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  getById: async (productId: string) => {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  },

  // Create product
  create: async (productData: any) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  // Update product
  update: async (productId: string, updates: any) => {
    const response = await apiClient.put(`/products/${productId}`, updates);
    return response.data;
  },

  // Delete product
  delete: async (productId: string) => {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  },

  // Get product reviews
  getReviews: async (productId: string) => {
    const response = await apiClient.get(`/products/${productId}/reviews`);
    return response.data;
  },
};

// ============================================================================
// ORDER API
// ============================================================================

export const orderAPI = {
  // Get all orders
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  // Get order by ID
  getById: async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Create order
  create: async (orderData: any) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  // Update order status
  updateStatus: async (orderId: string, status: string) => {
    const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancel: async (orderId: string, reason: string) => {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },
};

// ============================================================================
// PAYMENT API
// ============================================================================

export const paymentAPI = {
  // Create payment
  create: async (paymentData: any) => {
    const response = await apiClient.post('/payments', paymentData);
    return response.data;
  },

  // Get payment by order ID
  getByOrderId: async (orderId: string) => {
    const response = await apiClient.get(`/payments/order/${orderId}`);
    return response.data;
  },

  // Release payment
  release: async (paymentId: string) => {
    const response = await apiClient.post(`/payments/${paymentId}/release`);
    return response.data;
  },

  // Request refund
  requestRefund: async (paymentId: string, reason: string) => {
    const response = await apiClient.post(`/payments/${paymentId}/refund`, { reason });
    return response.data;
  },
};

// ============================================================================
// BLOCKCHAIN API
// ============================================================================

export const blockchainAPI = {
  // Register product on blockchain
  registerProduct: async (productData: any) => {
    const response = await apiClient.post('/blockchain/register-product', productData);
    return response.data;
  },

  // Transfer product ownership
  transferOwnership: async (productId: string, toAddress: string, price: number) => {
    const response = await apiClient.post('/blockchain/transfer-ownership', {
      productId,
      toAddress,
      price,
    });
    return response.data;
  },

  // Get product blockchain history
  getProductHistory: async (blockchainId: string) => {
    const response = await apiClient.get(`/blockchain/product-history/${blockchainId}`);
    return response.data;
  },

  // Verify product authenticity
  verifyProduct: async (blockchainId: string) => {
    const response = await apiClient.get(`/blockchain/verify/${blockchainId}`);
    return response.data;
  },
};

// ============================================================================
// ML API
// ============================================================================

export const mlAPI = {
  // Predict crop yield
  predictYield: async (data: {
    Area: string;
    Item: string;
    Year: number;
    average_rain_fall_mm_per_year: number;
    pesticides_tonnes: number;
    avg_temp: number;
  }) => {
    const response = await apiClient.post('/ml/predict-yield', data);
    return response.data;
  },

  // Recommend crop
  recommendCrop: async (data: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  }) => {
    const response = await apiClient.post('/ml/recommend-crop', data);
    return response.data;
  },
};

// ============================================================================
// ADMIN API
// ============================================================================

export const adminAPI = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard-stats');
    return response.data;
  },

  // Get all users
  getAllUsers: async (params?: { page?: number; limit?: number; role?: string }) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId: string, isActive: boolean) => {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  // Verify user
  verifyUser: async (userId: string) => {
    const response = await apiClient.post(`/admin/users/${userId}/verify`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (period: string) => {
    const response = await apiClient.get('/admin/analytics', { params: { period } });
    return response.data;
  },
};

// Export the configured axios instance as default
export default apiClient;
