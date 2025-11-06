'use client';

import { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function FarmerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        totalRevenue: 125000,
        totalOrders: 48,
        totalProducts: 12,
        averageOrderValue: 2604,
        topProducts: [
          { name: 'Organic Rice', sales: 15, revenue: 45000 },
          { name: 'Fresh Tomatoes', sales: 12, revenue: 24000 },
          { name: 'Wheat Flour', sales: 10, revenue: 30000 },
        ],
        revenueByMonth: [
          { month: 'Jan', revenue: 20000 },
          { month: 'Feb', revenue: 25000 },
          { month: 'Mar', revenue: 30000 },
          { month: 'Apr', revenue: 28000 },
          { month: 'May', revenue: 22000 },
        ],
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Sales Analytics"
        description="Track your sales performance and insights"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center space-x-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  timeRange === range
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' :
                 range === '30d' ? 'Last 30 Days' :
                 range === '90d' ? 'Last 90 Days' : 'Last Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`₹${analytics?.totalRevenue.toLocaleString()}`}
            icon={<CurrencyDollarIcon className="h-6 w-6" />}
            color="green"
            trend={{ value: '+15%', isPositive: true }}
          />
          <StatCard
            title="Total Orders"
            value={analytics?.totalOrders || 0}
            icon={<ShoppingBagIcon className="h-6 w-6" />}
            color="blue"
            trend={{ value: '+8%', isPositive: true }}
          />
          <StatCard
            title="Active Products"
            value={analytics?.totalProducts || 0}
            icon={<ChartBarIcon className="h-6 w-6" />}
            color="purple"
          />
          <StatCard
            title="Avg Order Value"
            value={`₹${analytics?.averageOrderValue.toLocaleString()}`}
            icon={<TrendingUpIcon className="h-6 w-6" />}
            color="yellow"
            trend={{ value: '+12%', isPositive: true }}
          />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics?.revenueByMonth.map((data, index) => {
              const maxRevenue = Math.max(...analytics.revenueByMonth.map(d => d.revenue));
              const height = (data.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-green-600 rounded-t hover:bg-green-700 transition-all cursor-pointer relative group"
                       style={{ height: `${height}%` }}>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{data.revenue.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{data.month}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {analytics?.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">₹{product.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
