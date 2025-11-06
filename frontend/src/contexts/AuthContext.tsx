'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Types
export interface User {
  id: string;
  walletAddress: string;
  roles: string[];
  primaryRole: string;
  permissions: string[];
  profile: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    businessName?: string;
    businessType?: string;
  };
  verification: {
    isVerified: boolean;
    kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
    verificationLevel: number;
  };
  status: {
    isActive: boolean;
    isSuspended: boolean;
  };
  createdAt: string;
  lastLogin?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (walletAddress: string, signature: string, message: string, nonce: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permissions: string | string[]) => boolean;
  checkPermission: (permission: string) => boolean;
  isVerified: () => boolean;
  requiresKYC: () => boolean;
  updateUser: (userData: Partial<User>) => void;
}

export interface RegisterData {
  walletAddress: string;
  role: string;
  profile: {
    name: string;
    email: string;
    phone?: string;
    businessName?: string;
    businessType?: string;
  };
  signature?: string;
  message?: string;
  nonce?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Configure axios defaults
  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

        if (storedAccessToken && storedUser) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid by fetching current user
          fetchCurrentUser(storedAccessToken);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        clearAuthState();
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Fetch current user from API
  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data.user) {
        setUser(response.data.data.user);
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  // Clear auth state
  const clearAuthState = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Save auth state to localStorage
  const saveAuthState = (token: string, refresh: string, userData: User) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setAccessToken(token);
    setRefreshToken(refresh);
    setUser(userData);
  };

  // Register new user
  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data);

      if (response.data.success && response.data.data) {
        const { user: userData, accessToken: token, refreshToken: refresh } = response.data.data;
        saveAuthState(token, refresh, userData);
        router.push('/dashboard');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  // Login user
  const login = async (
    walletAddress: string,
    signature: string,
    message: string,
    nonce: string
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        walletAddress,
        signature,
        message,
        nonce
      });

      if (response.data.success && response.data.data) {
        const { user: userData, accessToken: token, refreshToken: refresh } = response.data.data;
        saveAuthState(token, refresh, userData);
        router.push('/dashboard');
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  // Logout user
  const logout = async () => {
    try {
      if (accessToken) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {
          refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
      router.push('/');
    }
  };

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      clearAuthState();
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken
      });

      if (response.data.success && response.data.data) {
        const { accessToken: newToken, refreshToken: newRefresh } = response.data.data;
        
        localStorage.setItem('accessToken', newToken);
        if (newRefresh) {
          localStorage.setItem('refreshToken', newRefresh);
          setRefreshToken(newRefresh);
        }
        
        setAccessToken(newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthState();
      router.push('/auth/login');
    }
  }, [refreshToken, router]);

  // Setup axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await refreshAccessToken();
            
            // Retry original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshAccessToken, accessToken]);

  // Check if user has specific role(s)
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.some(role => user.roles.includes(role));
  };

  // Check if user has specific permission(s)
  const hasPermission = (permissions: string | string[]): boolean => {
    if (!user) return false;
    
    const permArray = Array.isArray(permissions) ? permissions : [permissions];
    return permArray.every(perm => checkPermission(perm));
  };

  // Check single permission with wildcard support
  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Check for wildcard permission (admin has all)
    if (user.permissions.includes('*')) return true;
    
    // Check exact match
    if (user.permissions.includes(permission)) return true;
    
    // Check category wildcard (e.g., "product_management:*")
    const [category] = permission.split(':');
    if (user.permissions.includes(`${category}:*`)) return true;
    
    return false;
  };

  // Check if user is verified
  const isVerified = (): boolean => {
    return user?.verification?.isVerified ?? false;
  };

  // Check if user requires KYC
  const requiresKYC = (): boolean => {
    if (!user) return false;
    
    const kycRequiredRoles = ['FARMER', 'DISTRIBUTOR'];
    return kycRequiredRoles.includes(user.primaryRole) && 
           user.verification.kycStatus !== 'approved';
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && !!accessToken,
    accessToken,
    refreshToken,
    login,
    register,
    logout,
    refreshAccessToken,
    hasRole,
    hasPermission,
    checkPermission,
    isVerified,
    requiresKYC,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
