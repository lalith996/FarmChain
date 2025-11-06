'use client';

import React from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import {
  TruckIcon,
  CubeIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';

export default function DistributorDashboard() {
  const theme = getRoleTheme('DISTRIBUTOR');

  const user = {
    name: 'Distribution Manager',
    email: 'manager@distribution.com',
  };

  const recentOrders = [
    { id: 'ORD-5678', retailer: 'Fresh Market Store', items: 45, status: 'In Transit', eta: '2 hours', priority: 'High' },
    { id: 'ORD-5677', retailer: 'Green Grocers', items: 32, status: 'Loading', eta: '4 hours', priority: 'Medium' },
    { id: 'ORD-5676', retailer: 'Organic Foods Co.', items: 28, status: 'Delivered', eta: 'Completed', priority: 'Low' },
    { id: 'ORD-5675', retailer: 'City Market', items: 51, status: 'Pending', eta: '6 hours', priority: 'High' },
  ];

  const activeVehicles = [
    { id: 'TRK-101', driver: 'John Smith', route: 'North Route', stops: 5, completed: 2, status: 'On Time' },
    { id: 'TRK-102', driver: 'Sarah Johnson', route: 'South Route', stops: 4, completed: 3, status: 'On Time' },
    { id: 'TRK-103', driver: 'Mike Wilson', route: 'East Route', stops: 6, completed: 1, status: 'Delayed' },
  ];

  const alerts = [
    { type: 'warning', message: 'Vehicle TRK-103 is delayed by 30 minutes', time: '10 min ago' },
    { type: 'info', message: 'New order ORD-5678 requires immediate attention', time: '25 min ago' },
    { type: 'success', message: '15 deliveries completed successfully today', time: '1 hour ago' },
  ];

  const deliveryTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Deliveries',
        data: [45, 52, 48, 61, 58, 67, 54],
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}40`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const orderStatusData = {
    labels: ['Delivered', 'In Transit', 'Loading', 'Pending'],
    datasets: [
      {
        data: [145, 32, 18, 25],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B',
          '#6B7280',
        ],
      },
    ],
  };

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

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distribution Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time logistics and warehouse management overview
          </p>
        </div>

        {/* Key Metrics */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Active Deliveries"
            value={32}
            subtitle="Currently in transit"
            icon={TruckIcon}
            trend={{ direction: 'up', value: '8%', label: 'vs yesterday' }}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Warehouse Stock"
            value="8,450"
            subtitle="Total units"
            icon={CubeIcon}
            trend={{ direction: 'down', value: '3%', label: 'vs yesterday' }}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Avg Delivery Time"
            value="2.4hrs"
            subtitle="Last 24 hours"
            icon={ClockIcon}
            trend={{ direction: 'down', value: '12%', label: 'improvement' }}
            gradient="from-purple-500 to-indigo-500"
          />
          <AdvancedStatCard
            title="Revenue Today"
            value="$45,230"
            subtitle="From 67 deliveries"
            icon={CurrencyDollarIcon}
            trend={{ direction: 'up', value: '15%', label: 'vs yesterday' }}
            gradient="from-amber-500 to-orange-500"
          />
        </StatCardsGrid>

        {/* Alerts */}
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 font-semibold text-blue-900">Live Alerts</h3>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg bg-white p-3">
                <ExclamationTriangleIcon
                  className={`h-5 w-5 ${
                    alert.type === 'warning'
                      ? 'text-yellow-600'
                      : alert.type === 'info'
                      ? 'text-blue-600'
                      : 'text-green-600'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Delivery Trend (Last 7 Days)</h2>
            <div className="h-64">
              <Line data={deliveryTrendData} options={chartOptions} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Status Distribution</h2>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={orderStatusData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Retailer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ETA</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.retailer}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.items} items</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'In Transit'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Loading'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.eta}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          order.priority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : order.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Vehicles */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Active Vehicles</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">{vehicle.id}</span>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      vehicle.status === 'On Time'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver:</span>
                    <span className="font-medium text-gray-900">{vehicle.driver}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-medium text-gray-900">{vehicle.route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium text-gray-900">
                      {vehicle.completed}/{vehicle.stops} stops
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${(vehicle.completed / vehicle.stops) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center gap-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-left transition-colors hover:bg-blue-100">
            <TruckIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">New Delivery</h3>
              <p className="text-sm text-gray-600">Create shipment</p>
            </div>
          </button>

          <button className="flex items-center gap-3 rounded-lg border-2 border-green-200 bg-green-50 p-4 text-left transition-colors hover:bg-green-100">
            <MapPinIcon className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Optimize Routes</h3>
              <p className="text-sm text-gray-600">Plan deliveries</p>
            </div>
          </button>

          <button className="flex items-center gap-3 rounded-lg border-2 border-purple-200 bg-purple-50 p-4 text-left transition-colors hover:bg-purple-100">
            <CubeIcon className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Warehouse</h3>
              <p className="text-sm text-gray-600">Manage inventory</p>
            </div>
          </button>

          <button className="flex items-center gap-3 rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100">
            <ChartBarIcon className="h-8 w-8 text-amber-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">View reports</p>
            </div>
          </button>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
