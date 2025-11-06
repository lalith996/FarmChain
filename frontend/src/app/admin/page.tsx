'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { adminAPI } from '@/lib/api';
import { QuickAnalytics } from '@/components/shared/QuickAnalytics';
import { BlockchainStatus } from '@/components/shared/BlockchainStatus';
import toast from 'react-hot-toast';

interface AdminStats {
  users: {
    total: Array<{ count: number }>;
    active: Array<{ count: number }>;
    verified: Array<{ count: number }>;
    byRole: Array<{ _id: string; count: number }>;
  };
  products: {
    total: Array<{ count: number }>;
    active: Array<{ count: number }>;
    byCategory: Array<{ _id: string; count: number }>;
    byStatus: Array<{ _id: string; count: number }>;
  };
  orders: {
    total: Array<{ count: number }>;
    byStatus: Array<{ _id: string; count: number }>;
    byPaymentStatus: Array<{ _id: string; count: number }>;
    disputed: Array<{ count: number }>;
  };
  revenue: {
    totalRevenue: number;
    averageOrderValue: number;
    count: number;
  };
}

interface RecentActivity {
  _id: string;
  type: 'user_registered' | 'product_added' | 'order_placed' | 'kyc_pending';
  description: string;
  timestamp: string;
  user?: {
    name: string;
    walletAddress: string;
    role: string;
  };
  product?: {
    id: string;
    name: string;
    farmer: string;
  };
  order?: {
    id: string;
    status: string;
    amount: number;
    buyer: string;
    seller: string;
    product: string;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    fetchAdminData();
  }, [isAuthenticated, user, router]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Real API calls - always fetch from database
      const [statsResponse, activityResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getRecentActivity({ limit: 20 }),
      ]);

      console.log('📊 Stats from database:', statsResponse.data);
      console.log('📋 Activities from database:', activityResponse.data);

      // Handle stats response
      if (statsResponse.data) {
        setStats(statsResponse.data.data || statsResponse.data);
      }

      // Handle activity response with proper null checks
      if (activityResponse.data) {
        const activities = activityResponse.data.data?.activities || 
                          activityResponse.data.activities || 
                          [];
        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UsersIcon className="w-5 h-5 text-blue-600" />;
      case 'product_added':
        return <ShoppingBagIcon className="w-5 h-5 text-green-600" />;
      case 'order_placed':
        return <TruckIcon className="w-5 h-5 text-purple-600" />;
      case 'kyc_pending':
        return <ShieldCheckIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ChartBarIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  // Helper functions to extract counts from stats with safe null checks
  const getUserCount = (key: 'total' | 'active' | 'verified') => {
    if (!stats?.users) return 0;
    const data = stats.users[key];
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.count || 0;
    }
    return 0;
  };

  const getUsersByRole = (role: string) => {
    if (!stats?.users?.byRole || !Array.isArray(stats.users.byRole)) return 0;
    return stats.users.byRole.find((r: any) => r._id === role)?.count || 0;
  };

  const getProductCount = (key: 'total' | 'active') => {
    if (!stats?.products) return 0;
    const data = stats.products[key];
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.count || 0;
    }
    return 0;
  };

  const getProductsByStatus = (status: string) => {
    if (!stats?.products?.byStatus || !Array.isArray(stats.products.byStatus)) return 0;
    return stats.products.byStatus.find((s: any) => s._id === status)?.count || 0;
  };

  const getOrderCount = () => {
    if (!stats?.orders?.total) return 0;
    const data = stats.orders.total;
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.count || 0;
    }
    return 0;
  };

  const getOrdersByStatus = (status: string) => {
    if (!stats?.orders?.byStatus || !Array.isArray(stats.orders.byStatus)) return 0;
    return stats.orders.byStatus.find((s: any) => s._id === status)?.count || 0;
  };

  const getPendingKYC = () => {
    const total = getUserCount('total');
    const verified = getUserCount('verified');
    return Math.max(0, total - verified);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and management</p>
        </div>

        {/* Quick Analytics */}
        <div className="mb-8">
          <QuickAnalytics role="admin" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">
                +{getPendingKYC()} pending
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{getUserCount('total')}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
            <div className="mt-4 flex items-center space-x-4 text-xs text-gray-600">
              <span>{getUsersByRole('farmer')} Farmers</span>
              <span>{getUsersByRole('consumer')} Consumers</span>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingBagIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-yellow-600 font-medium">
                {getProductsByStatus('pending')} pending
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{getProductCount('total')}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Products</p>
            <div className="mt-4 flex items-center space-x-4 text-xs text-gray-600">
              <span>{getProductCount('active')} Active</span>
              <span>{getProductsByStatus('rejected')} Rejected</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TruckIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-blue-600 font-medium">
                {getOrdersByStatus('pending')} pending
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{getOrderCount()}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Orders</p>
            <div className="mt-4 flex items-center space-x-4 text-xs text-gray-600">
              <span>{getOrdersByStatus('delivered')} Delivered</span>
              <span>{getOrdersByStatus('cancelled')} Cancelled</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">
                {stats?.revenue?.count || 0} orders
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ₹{((stats?.revenue?.totalRevenue || 0) / 1000).toFixed(1)}K
            </h3>
            <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
            <div className="mt-4 flex items-center space-x-4 text-xs text-gray-600">
              <span>Avg: ₹{(stats?.revenue?.averageOrderValue || 0).toFixed(0)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <ClockIcon className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{getOrdersByStatus('pending')}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircleIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{getOrdersByStatus('confirmed')}</p>
                    <p className="text-sm text-gray-600">Confirmed</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <TruckIcon className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{getOrdersByStatus('shipped')}</p>
                    <p className="text-sm text-gray-600">Shipped</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{getOrdersByStatus('delivered')}</p>
                    <p className="text-sm text-gray-600">Delivered</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                  <XCircleIcon className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{getOrdersByStatus('cancelled')}</p>
                    <p className="text-sm text-gray-600">Cancelled</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity._id}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        {activity.user && (
                          <p className="text-xs text-gray-600 mt-1">
                            {activity.user.name} ({activity.user.role})
                          </p>
                        )}
                        {activity.order && (
                          <p className="text-xs text-gray-600 mt-1">
                            Order #{activity.order.id} - ₹{activity.order.amount}
                          </p>
                        )}
                        {activity.product && (
                          <p className="text-xs text-gray-600 mt-1">
                            {activity.product.name} by {activity.product.farmer}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {activity._id.slice(-8)} • {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <UsersIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Manage Users</span>
                  </div>
                  {getPendingKYC() > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                      {getPendingKYC()}
                    </span>
                  )}
                </Link>

                <Link
                  href="/admin/products"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Manage Products</span>
                  </div>
                  {getProductsByStatus('pending') > 0 && (
                    <span className="bg-yellow-100 text-yellow-600 text-xs font-medium px-2 py-1 rounded-full">
                      {getProductsByStatus('pending')}
                    </span>
                  )}
                </Link>

                <Link
                  href="/admin/orders"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <TruckIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Manage Orders</span>
                  </div>
                  {getOrdersByStatus('pending') > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
                      {getOrdersByStatus('pending')}
                    </span>
                  )}
                </Link>

                <Link
                  href="/admin/analytics"
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChartBarIcon className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">View Analytics</span>
                </Link>
              </div>
            </div>

            {/* Blockchain Status */}
            <BlockchainStatus compact={false} />

            {/* Pending Actions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-yellow-900 mb-3">Pending Actions</h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• {getPendingKYC()} KYC verifications pending</li>
                <li>• {getProductsByStatus('pending')} products awaiting approval</li>
                <li>• {getOrdersByStatus('pending')} orders need processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
