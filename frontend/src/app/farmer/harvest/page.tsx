'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import { SparklesIcon, TruckIcon, ScaleIcon, CheckCircleIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';

interface HarvestRecord {
  id: string;
  crop: string;
  field: string;
  date: string;
  quantity: number; // tons
  quality: 'Premium' | 'Grade A' | 'Grade B' | 'Standard';
  marketValue: number;
  destination: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Sold';
}

export default function HarvestPage() {
  const theme = getRoleTheme('FARMER');
  const user = { name: 'John Farmer', email: 'john.farmer@example.com' };
  const [activeTab, setActiveTab] = useState<'schedule' | 'records' | 'quality' | 'analytics'>('schedule');

  const harvests: HarvestRecord[] = [
    { id: 'HRV-001', crop: 'Strawberries', field: 'Field D', date: '2025-11-10', quantity: 4.2, quality: 'Premium', marketValue: 21000, destination: 'Retailer Network', status: 'In Progress' },
    { id: 'HRV-002', crop: 'Sweet Corn', field: 'Field B', date: '2025-11-15', quantity: 12.5, quality: 'Grade A', marketValue: 37500, destination: 'Distributor Hub', status: 'Scheduled' },
    { id: 'HRV-003', crop: 'Organic Tomatoes', field: 'Field A', date: '2025-12-20', quantity: 8.3, quality: 'Premium', marketValue: 49800, destination: 'Organic Market', status: 'Scheduled' },
    { id: 'HRV-004', crop: 'Organic Lettuce', field: 'Field C', date: '2025-11-25', quantity: 3.1, quality: 'Grade A', marketValue: 15500, destination: 'Local Grocery', status: 'Scheduled' },
  ];

  const pastHarvests = [
    { id: 'HRV-P01', crop: 'Red Apples', field: 'Field E', date: '2025-10-15', quantity: 15.2, quality: 'Premium', marketValue: 76000, destination: 'Export', status: 'Sold' },
    { id: 'HRV-P02', crop: 'Carrots', field: 'Field C', date: '2025-09-20', quantity: 6.8, quality: 'Grade A', marketValue: 20400, destination: 'Distributor Hub', status: 'Sold' },
  ];

  const columns: Column<HarvestRecord>[] = [
    { key: 'crop', label: 'Crop', sortable: true, render: (h) => <span className="font-semibold text-gray-900">{h.crop}</span> },
    { key: 'field', label: 'Field', sortable: true },
    { key: 'date', label: 'Harvest Date', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true, render: (h) => <span>{h.quantity} tons</span> },
    {
      key: 'quality',
      label: 'Quality',
      sortable: true,
      render: (h) => {
        const colors = {
          Premium: 'bg-purple-100 text-purple-800',
          'Grade A': 'bg-green-100 text-green-800',
          'Grade B': 'bg-yellow-100 text-yellow-800',
          Standard: 'bg-gray-100 text-gray-800',
        };
        return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colors[h.quality]}`}>{h.quality}</span>;
      },
    },
    { key: 'marketValue', label: 'Market Value', sortable: true, render: (h) => <span className="font-semibold text-emerald-600">${h.marketValue.toLocaleString()}</span> },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (h) => {
        const colors = {
          Scheduled: 'bg-blue-100 text-blue-800',
          'In Progress': 'bg-yellow-100 text-yellow-800',
          Completed: 'bg-green-100 text-green-800',
          Sold: 'bg-purple-100 text-purple-800',
        };
        return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colors[h.status]}`}>{h.status}</span>;
      },
    },
  ];

  const totalQuantity = harvests.reduce((sum, h) => sum + h.quantity, 0);
  const totalValue = harvests.reduce((sum, h) => sum + h.marketValue, 0);
  const premiumPercent = Math.round((harvests.filter(h => h.quality === 'Premium').length / harvests.length) * 100);

  const yieldTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Harvest Yield (tons)',
      data: [0, 0, 12, 18, 25, 32, 28, 35, 22, 30, 28, 0],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
    }],
  };

  const qualityDistData = {
    labels: ['Premium', 'Grade A', 'Grade B', 'Standard'],
    datasets: [{
      label: 'Quality Distribution (%)',
      data: [35, 45, 15, 5],
      backgroundColor: ['rgba(139, 92, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(156, 163, 175, 0.5)'],
    }],
  };

  return (
    <RoleBasedLayout role="FARMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Harvest Management</h1>

        <StatCardsGrid>
          <AdvancedStatCard title="Upcoming Harvests" value={harvests.length} subtitle="Scheduled this season" icon={CalendarIcon} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="Total Yield" value={`${totalQuantity.toFixed(1)}t`} subtitle="Expected this season" icon={ScaleIcon} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="Market Value" value={`$${(totalValue / 1000).toFixed(0)}K`} subtitle="Projected revenue" icon={TruckIcon} gradient="from-blue-500 to-cyan-500" />
          <AdvancedStatCard title="Premium Quality" value={`${premiumPercent}%`} subtitle="Top grade produce" icon={CheckCircleIcon} gradient="from-purple-500 to-pink-500" />
        </StatCardsGrid>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'schedule', label: 'Harvest Schedule', count: harvests.length },
            { id: 'records', label: 'Past Harvests', count: pastHarvests.length },
            { id: 'quality', label: 'Quality Control' },
            { id: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-600'}`}
            >
              {tab.label}
              {tab.count && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-600" />}
            </button>
          ))}
        </div>

        {activeTab === 'schedule' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Upcoming Harvests</h2>
              <AdvancedDataTable data={harvests} columns={columns} searchPlaceholder="Search harvests..." />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {harvests.map((harvest) => (
                <div key={harvest.id} className="rounded-xl bg-white p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{harvest.crop}</h3>
                      <p className="text-sm text-gray-600">{harvest.field} • {harvest.date}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      harvest.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {harvest.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Expected Yield</span><span className="font-semibold">{harvest.quantity} tons</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Quality Grade</span><span className="font-semibold">{harvest.quality}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Market Value</span><span className="font-semibold text-emerald-600">${harvest.marketValue.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Destination</span><span className="font-semibold">{harvest.destination}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'records' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Past Harvest Records</h2>
            <AdvancedDataTable data={pastHarvests} columns={columns} searchPlaceholder="Search past harvests..." />
          </div>
        )}

        {activeTab === 'quality' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Quality Distribution</h2>
              <Bar data={qualityDistData} options={{ responsive: true }} />
            </div>
            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">🎯 Quality Standards</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Premium: Perfect size, color, no defects - Top 10% market price</li>
                <li>• Grade A: Excellent quality, minor cosmetic variations - Standard market price</li>
                <li>• Grade B: Good quality, some visual imperfections - 80% market price</li>
                <li>• Standard: Acceptable quality for processing - 60% market price</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Harvest Yield Trends</h2>
            <Line data={yieldTrendsData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
