'use client';

import React from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';

export default function RetailerSalesPage() {
  const theme = getRoleTheme('RETAILER');

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [45000, 52000, 48000, 61000, 58000, 67000],
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}20`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const categoryData = {
    labels: ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Others'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          theme.colors.primary,
          theme.colors.secondary,
          theme.colors.accent,
          '#10B981',
          '#6366F1',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and analyze your sales performance
          </p>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Revenue"
            value="$67,245"
            subtitle="This month"
            icon={CurrencyDollarIcon}
            trend={{ direction: 'up', value: '15%', label: 'vs last month' }}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Orders"
            value={1234}
            subtitle="This month"
            icon={ShoppingBagIcon}
            trend={{ direction: 'up', value: '8%', label: 'vs last month' }}
            gradient={theme.gradients.secondary}
          />
          <AdvancedStatCard
            title="Avg Order Value"
            value="$54.50"
            subtitle="Per transaction"
            icon={ChartBarIcon}
            trend={{ direction: 'up', value: '5%', label: 'vs last month' }}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Growth Rate"
            value="23%"
            subtitle="Year over year"
            icon={TrendingUpIcon}
            trend={{ direction: 'up', value: '3%', label: 'vs last year' }}
            gradient="from-purple-500 to-pink-500"
          />
        </StatCardsGrid>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Monthly Sales Trend</h2>
            <div className="h-64">
              <Line data={salesData} options={chartOptions} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Sales by Category</h2>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={categoryData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Top Selling Products</h2>
          <div className="space-y-3">
            {[
              { name: 'Organic Tomatoes', sales: '$12,450', units: 450, trend: 12 },
              { name: 'Fresh Lettuce', sales: '$8,920', units: 380, trend: 8 },
              { name: 'Red Apples', sales: '$7,650', units: 320, trend: -3 },
              { name: 'Carrots', sales: '$6,230', units: 290, trend: 15 },
              { name: 'Bananas', sales: '$5,890', units: 275, trend: 5 },
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${theme.gradients.primary}`}>
                    <span className="text-lg font-bold text-white">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.units} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{product.sales}</p>
                  <p className={`text-sm ${product.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.trend > 0 ? '↑' : '↓'} {Math.abs(product.trend)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
