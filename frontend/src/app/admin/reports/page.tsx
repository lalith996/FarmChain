'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { ChartBarIcon, UserGroupIcon, ShoppingBagIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const stats = {
    totalUsers: 10245,
    totalProducts: 52340,
    totalOrders: 8956,
    totalRevenue: 12500000,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="System Reports" description="System-wide analytics and reports" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center space-x-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  timeRange === range ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Last Year'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={<UserGroupIcon className="h-6 w-6" />} color="blue" trend={{ value: '+12%', isPositive: true }} />
          <StatCard title="Total Products" value={stats.totalProducts.toLocaleString()} icon={<ShoppingBagIcon className="h-6 w-6" />} color="green" trend={{ value: '+8%', isPositive: true }} />
          <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString()} icon={<ChartBarIcon className="h-6 w-6" />} color="purple" trend={{ value: '+15%', isPositive: true }} />
          <StatCard title="Total Revenue" value={`₹${(stats.totalRevenue / 10000000).toFixed(1)}Cr`} icon={<CurrencyDollarIcon className="h-6 w-6" />} color="yellow" trend={{ value: '+20%', isPositive: true }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {[65, 75, 80, 85, 90, 95, 100].map((height, i) => (
                <div key={i} className="flex-1 bg-blue-600 rounded-t hover:bg-blue-700 transition cursor-pointer" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {[70, 65, 80, 75, 85, 90, 100].map((height, i) => (
                <div key={i} className="flex-1 bg-green-600 rounded-t hover:bg-green-700 transition cursor-pointer" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
