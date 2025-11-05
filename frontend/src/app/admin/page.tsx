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
import toast from 'react-hot-toast';

interface AdminStats {
  users: {
    total: number;
    farmers: number;
    consumers: number;
    verified: number;
    pendingKYC: number;
  };
  products: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
  };
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user' | 'product' | 'order' | 'kyc';
  message: string;
  timestamp: string;
  status?: string;
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
      const [statsResponse, activityResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getRecentActivity({ limit: 10 }),
      ]);

      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <UsersIcon className="w-5 h-5 text-blue-600" />;
      case 'product':
        return <ShoppingBagIcon className="w-5 h-5 text-green-600" />;
      case 'order':
        return <TruckIcon className="w-5 h-5 text-purple-600" />;
      case 'kyc':
        return <ShieldCheckIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ChartBarIcon className="w-5 h-5 text-gray-600" />;
    }
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">
                +{stats.users.pendingKYC} pending
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.users.total}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
            <div className="mt-4 flex items-center space-x-4 text-xs text-gray-600">
              <span>{stats.users.farmers} Farmers</span>
              <span>{stats.users.consumers} Consumers</span>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingBagIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-yellow-600 font-medium">
                {stats.products.pending} pending
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.products.total}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Products</p>
            <div className="mt-4 flex items-center space-x-4 text-xs text-gray-600">
              <span>{stats.products.active} Active</span>
              <span>{stats.products.rejected} Rejected</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TruckIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-blue-600 font-medium">
                {stats.orders.pending} pending
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.orders.total}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Orders</p>
            <div className="mt-4 flex items-center space-x-4 text-xs text-gray-600">
              <span>{stats.orders.delivered} Delivered</span>
              <span>{stats.orders.cancelled} Cancelled</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">
                +{stats.revenue.growth}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ₹{(stats.revenue.total / 1000).toFixed(1)}K
            </h3>
            <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
            <div className="mt-4 flex items-center space-x-4 text-xs text-gray-600">
              <span>This Month: ₹{(stats.revenue.thisMonth / 1000).toFixed(1)}K</span>
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
                    <p className="text-2xl font-bold text-gray-900">{stats.orders.pending}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircleIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.orders.confirmed}</p>
                    <p className="text-sm text-gray-600">Confirmed</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <TruckIcon className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.orders.shipped}</p>
                    <p className="text-sm text-gray-600">Shipped</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.orders.delivered}</p>
                    <p className="text-sm text-gray-600">Delivered</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                  <XCircleIcon className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.orders.cancelled}</p>
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
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(activity.timestamp)}
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
                  {stats.users.pendingKYC > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                      {stats.users.pendingKYC}
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
                  {stats.products.pending > 0 && (
                    <span className="bg-yellow-100 text-yellow-600 text-xs font-medium px-2 py-1 rounded-full">
                      {stats.products.pending}
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
                  {stats.orders.pending > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
                      {stats.orders.pending}
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

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <span className="flex items-center text-sm text-green-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="flex items-center text-sm text-green-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Blockchain</span>
                  <span className="flex items-center text-sm text-green-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    Synced
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="text-sm text-gray-900">78% Used</span>
                </div>
              </div>
            </div>

            {/* Pending Actions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-yellow-900 mb-3">Pending Actions</h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• {stats.users.pendingKYC} KYC verifications pending</li>
                <li>• {stats.products.pending} products awaiting approval</li>
                <li>• {stats.orders.pending} orders need processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
