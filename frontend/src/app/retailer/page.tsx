'use client';

import React from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  TruckIcon,
  StarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RetailerDashboard() {
  const theme = getRoleTheme('RETAILER');

  // Mock user data
  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
    avatar: '',
  };

  // Mock data for charts
  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}20`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const topProductsData = {
    labels: ['Organic Tomatoes', 'Fresh Lettuce', 'Carrots', 'Apples', 'Potatoes'],
    datasets: [
      {
        label: 'Units Sold',
        data: [245, 189, 167, 142, 138],
        backgroundColor: [
          theme.colors.primary,
          theme.colors.secondary,
          theme.colors.accent,
          '#F59E0B',
          '#EF4444',
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
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Recent orders mock data
  const recentOrders = [
    {
      id: '#ORD-001',
      customer: 'John Doe',
      items: 5,
      total: '$145.00',
      status: 'Delivered',
      time: '2 hours ago',
    },
    {
      id: '#ORD-002',
      customer: 'Jane Smith',
      items: 3,
      total: '$89.50',
      status: 'Processing',
      time: '3 hours ago',
    },
    {
      id: '#ORD-003',
      customer: 'Mike Johnson',
      items: 8,
      total: '$234.00',
      status: 'Shipped',
      time: '5 hours ago',
    },
    {
      id: '#ORD-004',
      customer: 'Sarah Wilson',
      items: 2,
      total: '$56.00',
      status: 'Pending',
      time: '6 hours ago',
    },
  ];

  // Low stock alerts
  const lowStockItems = [
    { name: 'Organic Tomatoes', stock: 12, threshold: 50 },
    { name: 'Fresh Milk', stock: 8, threshold: 30 },
    { name: 'Brown Eggs', stock: 15, threshold: 40 },
  ];

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Today's Revenue"
            value="$2,845"
            subtitle="Target: $3,000"
            icon={CurrencyDollarIcon}
            trend={{ direction: 'up', value: '12%', label: 'vs yesterday' }}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Orders Today"
            value={45}
            subtitle="32 completed, 13 pending"
            icon={ShoppingBagIcon}
            trend={{ direction: 'up', value: '8%', label: 'vs yesterday' }}
            gradient={theme.gradients.secondary}
          />
          <AdvancedStatCard
            title="Active Customers"
            value={234}
            subtitle="18 new this week"
            icon={UserGroupIcon}
            trend={{ direction: 'up', value: '15%', label: 'vs last week' }}
            gradient="from-purple-500 to-pink-500"
          />
          <AdvancedStatCard
            title="Avg Order Value"
            value="$63.22"
            subtitle="Target: $65"
            icon={ChartBarIcon}
            trend={{ direction: 'down', value: '3%', label: 'vs last week' }}
            gradient="from-green-500 to-emerald-500"
          />
        </StatCardsGrid>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sales Chart */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Weekly Sales</h2>
              <select className="rounded-md border-gray-300 text-sm">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
            </div>
            <div className="h-64">
              <Line data={salesData} options={chartOptions} />
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
              <button className="text-sm text-amber-600 hover:text-amber-700">
                View All
              </button>
            </div>
            <div className="h-64">
              <Bar data={topProductsData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Orders & Alerts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <button className="text-sm text-amber-600 hover:text-amber-700">
                View All Orders
              </button>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-amber-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-amber-100 p-2">
                      <ShoppingBagIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{order.id}</span>
                        <span className="text-sm text-gray-500">• {order.customer}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items} items • {order.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{order.total}</div>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        order.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'Shipped'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="space-y-6">
            {/* Low Stock Alert */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
              </div>
              <div className="space-y-3">
                {lowStockItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-red-200 bg-red-50 p-3"
                  >
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="mt-1 text-sm text-gray-600">
                      Only {item.stock} units left (min: {item.threshold})
                    </div>
                    <button className="mt-2 text-sm font-medium text-red-600 hover:text-red-700">
                      Reorder Now →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-left font-medium text-white transition-all hover:shadow-lg">
                  <ShoppingBagIcon className="mb-1 inline h-5 w-5" /> Process New Order
                </button>
                <button className="w-full rounded-lg border border-gray-300 px-4 py-3 text-left font-medium text-gray-700 transition-all hover:bg-gray-50">
                  <TruckIcon className="mb-1 inline h-5 w-5" /> Manage Deliveries
                </button>
                <button className="w-full rounded-lg border border-gray-300 px-4 py-3 text-left font-medium text-gray-700 transition-all hover:bg-gray-50">
                  <StarIcon className="mb-1 inline h-5 w-5" /> View Reviews
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Store Performance */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Customer Satisfaction</p>
                <p className="mt-2 text-3xl font-bold">4.8/5.0</p>
                <p className="mt-1 text-xs opacity-75">Based on 234 reviews</p>
              </div>
              <StarIcon className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Delivery Success</p>
                <p className="mt-2 text-3xl font-bold">98.5%</p>
                <p className="mt-1 text-xs opacity-75">Last 30 days</p>
              </div>
              <TruckIcon className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Repeat Customers</p>
                <p className="mt-2 text-3xl font-bold">67%</p>
                <p className="mt-1 text-xs opacity-75">Up from 62% last month</p>
              </div>
              <UserGroupIcon className="h-12 w-12 opacity-50" />
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Avg Response Time</p>
                <p className="mt-2 text-3xl font-bold">12m</p>
                <p className="mt-1 text-xs opacity-75">To customer inquiries</p>
              </div>
              <ClockIcon className="h-12 w-12 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
