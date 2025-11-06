'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byMonth: Array<{ month: string; revenue: number }>;
  };
  users: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byMonth: Array<{ month: string; users: number }>;
    byRole: Record<string, number>;
  };
  orders: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byStatus: Record<string, number>;
  };
  topProducts: Array<{
    _id: string;
    name: string;
    category: string;
    totalSold: number;
    revenue: number;
  }>;
  topFarmers: Array<{
    _id: string;
    name: string;
    totalOrders: number;
    revenue: number;
    rating: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0,
      byMonth: []
    },
    users: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0,
      byMonth: [],
      byRole: {}
    },
    orders: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0,
      byStatus: {}
    },
    topProducts: [],
    topFarmers: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (currentUser?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUser, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Check if using development authentication
      const authToken = localStorage.getItem('authToken');
      const isDevAuth = authToken?.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.');
      
      if (isDevAuth) {
        console.log('� Loading analytics data');
        // Use development analytics
        setAnalytics({
          revenue: {
            total: 125000,
            growth: 25,
            data: [
              { date: '2025-11-01', amount: 20000 },
              { date: '2025-11-02', amount: 22000 },
              { date: '2025-11-03', amount: 25000 },
              { date: '2025-11-04', amount: 28000 },
              { date: '2025-11-05', amount: 30000 }
            ]
          },
          orders: {
            total: 456,
            growth: 15,
            data: [
              { date: '2025-11-01', count: 85 },
              { date: '2025-11-02', count: 90 },
              { date: '2025-11-03', count: 95 },
              { date: '2025-11-04', count: 92 },
              { date: '2025-11-05', count: 94 }
            ]
          },
          users: {
            total: 1234,
            growth: 10,
            data: [
              { date: '2025-11-01', count: 1200 },
              { date: '2025-11-02', count: 1210 },
              { date: '2025-11-03', count: 1220 },
              { date: '2025-11-04', count: 1228 },
              { date: '2025-11-05', count: 1234 }
            ]
          },
          products: {
            total: 89,
            growth: 8,
            data: [
              { date: '2025-11-01', count: 82 },
              { date: '2025-11-02', count: 84 },
              { date: '2025-11-03', count: 86 },
              { date: '2025-11-04', count: 88 },
              { date: '2025-11-05', count: 89 }
            ]
          }
        } as any);
      } else {
        // Real API call
        const response = await adminAPI.getAnalytics({ days: parseInt(dateRange) });
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount || isNaN(amount)) {
      return '₹0';
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span className={`inline-flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
        ) : (
          <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
        )}
        {Math.abs(growth).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">Platform insights and performance metrics</p>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Date range"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              {formatGrowth(analytics.revenue.growth)}
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrency(analytics.revenue.total)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This month: {formatCurrency(analytics.revenue.thisMonth)}
            </p>
          </div>

          {/* Users Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              {formatGrowth(analytics.users.growth)}
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {analytics.users.total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              New this month: {analytics.users.thisMonth}
            </p>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBagIcon className="w-6 h-6 text-purple-600" />
              </div>
              {formatGrowth(analytics.orders.growth)}
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {analytics.orders.total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This month: {analytics.orders.thisMonth}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue by Month */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
            <div className="space-y-4">
              {analytics.revenue.byMonth && analytics.revenue.byMonth.length > 0 ? (
                analytics.revenue.byMonth.slice(-6).map((item, index) => {
                  const revenues = analytics.revenue.byMonth.map((m) => m.revenue);
                  const maxRevenue = revenues.length > 0 ? Math.max(...revenues) : 1;
                  const width = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.month}</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.revenue)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No revenue data available</p>
              )}
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
            <div className="space-y-4">
              {analytics.users.byMonth && analytics.users.byMonth.length > 0 ? (
                analytics.users.byMonth.slice(-6).map((item, index) => {
                  const userCounts = analytics.users.byMonth.map((m) => m.users);
                  const maxUsers = userCounts.length > 0 ? Math.max(...userCounts) : 1;
                  const width = maxUsers > 0 ? (item.users / maxUsers) * 100 : 0;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.month}</span>
                        <span className="font-semibold text-gray-900">
                          {item.users} users
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No user data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Users by Role */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h2>
            <div className="space-y-3">
              {analytics.users.byRole && Object.keys(analytics.users.byRole).length > 0 ? (
                Object.entries(analytics.users.byRole).map(([role, count]) => {
                  const percentage = analytics.users.total > 0 ? (count / analytics.users.total) * 100 : 0;
                  const roleColors: Record<string, string> = {
                    farmer: 'bg-green-600',
                    distributor: 'bg-blue-600',
                    retailer: 'bg-purple-600',
                    consumer: 'bg-orange-600',
                    admin: 'bg-red-600',
                  };
                  return (
                    <div key={role}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 capitalize">{role}</span>
                        <span className="font-semibold text-gray-900">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${roleColors[role] || 'bg-gray-600'} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No user role data available</p>
              )}
            </div>
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
            <div className="space-y-3">
              {analytics.orders.byStatus && Object.keys(analytics.orders.byStatus).length > 0 ? (
                Object.entries(analytics.orders.byStatus).map(([status, count]) => {
                  const percentage = analytics.orders.total > 0 ? (count / analytics.orders.total) * 100 : 0;
                  const statusColors: Record<string, string> = {
                    pending: 'bg-yellow-600',
                    confirmed: 'bg-blue-600',
                    shipped: 'bg-purple-600',
                    delivered: 'bg-green-600',
                    cancelled: 'bg-red-600',
                    disputed: 'bg-orange-600',
                  };
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 capitalize">{status}</span>
                        <span className="font-semibold text-gray-900">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${statusColors[status] || 'bg-gray-600'} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No order status data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.topProducts && analytics.topProducts.length > 0 ? (
                    analytics.topProducts.map((product, index) => (
                      <tr key={product._id} className={index < 3 ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.totalSold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(product.revenue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                        No product data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Farmers */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Top Farmers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Farmer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.topFarmers && analytics.topFarmers.length > 0 ? (
                    analytics.topFarmers.map((farmer, index) => (
                      <tr key={farmer._id} className={index < 3 ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{farmer.name}</div>
                          <div className="text-xs text-gray-500">⭐ {farmer.rating.toFixed(1)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {farmer.totalOrders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(farmer.revenue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                        No farmer data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
