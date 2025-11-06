'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import { ChartBarIcon, TruckIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

export default function AnalyticsReportsPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const user = { name: 'Analytics Manager', email: 'analytics@distribution.com' };

  const deliveryTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{ label: 'Deliveries', data: [245, 298, 315, 342], borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}40`, fill: true, tension: 0.4 }],
  };

  const routeEfficiencyData = {
    labels: ['North', 'South', 'East', 'West'],
    datasets: [{ label: 'Efficiency %', data: [92, 88, 85, 95], backgroundColor: theme.colors.primary }],
  };

  const orderDistributionData = {
    labels: ['Completed', 'In Transit', 'Pending', 'Cancelled'],
    datasets: [{ data: [745, 123, 45, 12], backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'] }],
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' as const } } };

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <button key={range} onClick={() => setTimeRange(range as any)} className={`rounded-lg px-4 py-2 text-sm font-medium ${timeRange === range ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-white text-gray-700'}`}>{range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}</button>
            ))}
          </div>
        </div>

        <StatCardsGrid>
          <AdvancedStatCard title="Total Deliveries" value="1,245" subtitle="This month" icon={TruckIcon} trend={{ direction: 'up', value: '12%', label: 'vs last month' }} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="Revenue" value="$342,500" subtitle="This month" icon={CurrencyDollarIcon} trend={{ direction: 'up', value: '18%', label: 'vs last month' }} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="Avg Delivery Time" value="2.3hrs" subtitle="This month" icon={ClockIcon} trend={{ direction: 'down', value: '8%', label: 'improvement' }} gradient="from-purple-500 to-indigo-500" />
          <AdvancedStatCard title="Efficiency Score" value="91%" subtitle="Overall performance" icon={ChartBarIcon} trend={{ direction: 'up', value: '5%', label: 'vs last month' }} gradient="from-amber-500 to-orange-500" />
        </StatCardsGrid>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-lg"><h2 className="mb-4 text-lg font-semibold text-gray-900">Delivery Trend</h2><div className="h-64"><Line data={deliveryTrendData} options={chartOptions} /></div></div>
          <div className="rounded-lg bg-white p-6 shadow-lg"><h2 className="mb-4 text-lg font-semibold text-gray-900">Route Efficiency</h2><div className="h-64"><Bar data={routeEfficiencyData} options={chartOptions} /></div></div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-lg"><h2 className="mb-4 text-lg font-semibold text-gray-900">Order Distribution</h2><div className="h-64 flex items-center justify-center"><Doughnut data={orderDistributionData} options={chartOptions} /></div></div>
          <div className="rounded-lg bg-white p-6 shadow-lg"><h2 className="mb-4 text-lg font-semibold text-gray-900">Key Insights</h2><div className="space-y-3"><div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-3"><p className="text-sm font-medium text-green-900">On-Time Delivery Rate</p><p className="text-2xl font-bold text-green-600">94.5%</p></div><div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3"><p className="text-sm font-medium text-blue-900">Customer Satisfaction</p><p className="text-2xl font-bold text-blue-600">4.7/5.0</p></div></div></div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
