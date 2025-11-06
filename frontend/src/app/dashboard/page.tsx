'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import { DashboardStats } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if using fake authentication
      const authToken = localStorage.getItem('authToken');
      const isFakeAuth = authToken?.startsWith('fake-jwt-token-');
      
      if (isFakeAuth) {
        console.log('🔧 Using fake dashboard data for dev mode - Role:', user?.role);
        
        // Generate role-specific fake data
        const fakeDashboardData = {
          totalOrders: user?.role === 'farmer' ? 45 : user?.role === 'consumer' ? 28 : 67,
          pendingOrders: user?.role === 'farmer' ? 8 : user?.role === 'consumer' ? 3 : 12,
          completedOrders: user?.role === 'farmer' ? 37 : user?.role === 'consumer' ? 25 : 55,
          activeProducts: user?.role === 'farmer' ? 12 : user?.role === 'distributor' ? 89 : 0,
          totalRevenue: user?.role === 'farmer' ? 45600 : user?.role === 'distributor' ? 125000 : 0,
          recentActivity: [
            {
              id: '1',
              type: user?.role === 'farmer' ? 'product' : 'order',
              message: user?.role === 'farmer' ? 'New product "Organic Tomatoes" listed' : 'New order placed - #ORD-2024-001',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              status: 'success'
            },
            {
              id: '2',
              type: 'order',
              message: user?.role === 'farmer' ? 'Order #ORD-2024-002 confirmed' : 'Order #ORD-2024-002 delivered',
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              status: 'success'
            },
            {
              id: '3',
              type: user?.role === 'farmer' ? 'product' : 'order',
              message: user?.role === 'farmer' ? 'Product "Fresh Strawberries" approved' : 'Order #ORD-2024-003 in transit',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              status: 'pending'
            }
          ]
        };
        
        setStats(fakeDashboardData as any);
      } else {
        // Real API call
        const response = await userAPI.getDashboard();
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getRoleSpecificGreeting = () => {
    switch (user?.role) {
      case 'farmer':
        return 'Manage your products and track sales';
      case 'distributor':
        return 'Monitor your distribution network';
      case 'retailer':
        return 'Track your inventory and orders';
      case 'consumer':
        return 'Browse products and manage orders';
      case 'admin':
        return 'Oversee platform operations';
      default:
        return 'Welcome to your dashboard';
    }
  };

  const getQuickActions = () => {
    switch (user?.role) {
      case 'farmer':
        return [
          { label: 'Register New Product', href: '/products/register', icon: ShoppingBagIcon },
          { label: 'View My Products', href: '/products?filter=mine', icon: ShoppingBagIcon },
          { label: 'Manage Orders', href: '/orders', icon: ShoppingBagIcon },
        ];
      case 'distributor':
      case 'retailer':
      case 'consumer':
        return [
          { label: 'Browse Products', href: '/products', icon: ShoppingBagIcon },
          { label: 'My Orders', href: '/orders', icon: ShoppingBagIcon },
          { label: 'My Profile', href: '/profile', icon: UserGroupIcon },
        ];
      case 'admin':
        return [
          { label: 'Platform Analytics', href: '/admin/analytics', icon: ChartBarIcon },
          { label: 'Manage Users', href: '/admin/users', icon: UserGroupIcon },
          { label: 'View All Orders', href: '/admin/orders', icon: ShoppingBagIcon },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.profile?.name || 'User'}! 👋
          </h1>
          <p className="text-gray-600">{getRoleSpecificGreeting()}</p>
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">+12% from last month</span>
              </div>
            </div>

            {/* Revenue/Spending */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {user?.role === 'farmer' ? 'Revenue' : 'Spending'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{stats.totalRevenue?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">+8% from last month</span>
              </div>
            </div>

            {/* Active Products (Farmers) / Pending Orders (Others) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {user?.role === 'farmer' ? 'Active Products' : 'Pending Orders'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.activeProducts || 0}
                    </p>
                  </div>
                </div>
              </div>
              <Link href={user?.role === 'farmer' ? '/products?filter=mine' : '/orders?status=pending'} className="text-sm text-purple-600 hover:text-purple-700">
                View all →
              </Link>
            </div>

            {/* Rating */}
            {user?.rating && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Your Rating</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.rating.average.toFixed(1)} ⭐
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{user.rating.count} reviews</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getQuickActions().map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <Icon className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity</p>
            <p className="text-sm text-gray-500 mt-2">
              Your recent transactions and updates will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
