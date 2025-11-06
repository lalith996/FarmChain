'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

export default function RetailerAnalyticsPage() {
  const theme = getRoleTheme('RETAILER');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [compareMode, setCompareMode] = useState(false);

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  // Sample data - in real app, this would come from API
  const salesTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Current Period',
        data: [12000, 15000, 18000, 22000],
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}40`,
        fill: true,
        tension: 0.4,
      },
      ...(compareMode ? [{
        label: 'Previous Period',
        data: [10000, 13000, 15000, 18000],
        borderColor: '#94A3B8',
        backgroundColor: '#94A3B840',
        fill: true,
        tension: 0.4,
      }] : []),
    ],
  };

  const categorySalesData = {
    labels: ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Others'],
    datasets: [
      {
        label: 'Sales by Category',
        data: [35000, 28000, 22000, 18000, 8000],
        backgroundColor: [
          '#F59E0B',
          '#10B981',
          '#3B82F6',
          '#8B5CF6',
          '#6B7280',
        ],
      },
    ],
  };

  const hourlyTrafficData = {
    labels: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'],
    datasets: [
      {
        label: 'Customers',
        data: [12, 25, 45, 68, 95, 110, 85, 75, 92, 120, 105, 78],
        backgroundColor: theme.colors.primary,
      },
    ],
  };

  const performanceRadarData = {
    labels: ['Sales', 'Customer Satisfaction', 'Inventory Turnover', 'Profit Margin', 'Marketing ROI'],
    datasets: [
      {
        label: 'Current',
        data: [85, 92, 78, 88, 75],
        backgroundColor: `${theme.colors.primary}40`,
        borderColor: theme.colors.primary,
        borderWidth: 2,
      },
      {
        label: 'Target',
        data: [90, 90, 85, 90, 80],
        backgroundColor: '#94A3B840',
        borderColor: '#94A3B8',
        borderWidth: 2,
      },
    ],
  };

  const topProductsData = [
    { name: 'Organic Tomatoes', sales: 450, revenue: 1795.50, growth: 12 },
    { name: 'Fresh Lettuce', sales: 380, revenue: 946.20, growth: 8 },
    { name: 'Red Apples', sales: 520, revenue: 1554.80, growth: -3 },
    { name: 'Carrots', sales: 290, revenue: 577.10, growth: 15 },
    { name: 'Bananas', sales: 675, revenue: 870.75, growth: 5 },
  ];

  const customerMetrics = [
    { metric: 'New Customers', value: 145, change: 23, changeType: 'up' as const },
    { metric: 'Returning Customers', value: 892, change: 12, changeType: 'up' as const },
    { metric: 'Customer Lifetime Value', value: '$1,245', change: 8, changeType: 'up' as const },
    { metric: 'Churn Rate', value: '3.2%', change: 1.5, changeType: 'down' as const },
    { metric: 'Avg Order Value', value: '$54.50', change: 5, changeType: 'up' as const },
    { metric: 'Orders per Customer', value: 4.2, change: 0.3, changeType: 'up' as const },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
  };

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive insights into your business performance
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                compareMode
                  ? 'bg-amber-500 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Compare Periods
            </button>
            <button className="rounded-lg border-2 border-amber-500 px-6 py-2 font-semibold text-amber-600 transition-colors hover:bg-amber-50">
              Export Report
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' },
            { value: '90d', label: 'Last 90 Days' },
            { value: '1y', label: 'Last Year' },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value as any)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Revenue"
            value="$67,245"
            subtitle="This period"
            icon={CurrencyDollarIcon}
            trend={{ direction: 'up', value: '15%', label: 'vs last period' }}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Total Orders"
            value={1234}
            subtitle="This period"
            icon={ShoppingBagIcon}
            trend={{ direction: 'up', value: '8%', label: 'vs last period' }}
            gradient="from-blue-500 to-indigo-500"
          />
          <AdvancedStatCard
            title="Active Customers"
            value={892}
            subtitle="This period"
            icon={UserGroupIcon}
            trend={{ direction: 'up', value: '12%', label: 'vs last period' }}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Avg Order Value"
            value="$54.50"
            subtitle="Per transaction"
            icon={ChartBarIcon}
            trend={{ direction: 'up', value: '5%', label: 'vs last period' }}
            gradient="from-purple-500 to-pink-500"
          />
        </StatCardsGrid>

        {/* Main Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sales Trend */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <Line data={salesTrendData} options={chartOptions} />
            </div>
          </div>

          {/* Category Sales */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Sales by Category</h2>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={categorySalesData} options={chartOptions} />
            </div>
          </div>

          {/* Hourly Traffic */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Customer Traffic by Hour</h2>
              <ClockIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <Bar data={hourlyTrafficData} options={chartOptions} />
            </div>
          </div>

          {/* Performance Radar */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center">
              <Radar data={performanceRadarData} options={radarOptions} />
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Top Performing Products</h2>
          <div className="space-y-3">
            {topProductsData.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${theme.gradients.primary}`}>
                    <span className="text-lg font-bold text-white">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.sales} units sold</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {product.growth > 0 ? (
                      <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(product.growth)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Customer Metrics</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {customerMetrics.map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-600">{item.metric}</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <div className="flex items-center gap-1">
                    {item.changeType === 'up' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${item.changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-lg">
            <h3 className="mb-2 text-sm font-medium opacity-90">Peak Hours</h3>
            <p className="text-3xl font-bold">5-7 PM</p>
            <p className="mt-2 text-sm opacity-75">Highest customer traffic</p>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white shadow-lg">
            <h3 className="mb-2 text-sm font-medium opacity-90">Best Day</h3>
            <p className="text-3xl font-bold">Saturday</p>
            <p className="mt-2 text-sm opacity-75">Highest sales volume</p>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-6 text-white shadow-lg">
            <h3 className="mb-2 text-sm font-medium opacity-90">Top Category</h3>
            <p className="text-3xl font-bold">Vegetables</p>
            <p className="mt-2 text-sm opacity-75">35% of total sales</p>
          </div>
        </div>

        {/* Export Options */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Export Detailed Reports</h3>
              <p className="mt-1 text-sm text-gray-600">
                Download comprehensive analytics in various formats
              </p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                CSV
              </button>
              <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Excel
              </button>
              <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
                PDF Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
