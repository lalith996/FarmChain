'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  MegaphoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
  CalendarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';

interface Campaign {
  id: string;
  name: string;
  type: 'Email' | 'Social' | 'SMS' | 'Push';
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  reach: number;
  clicks: number;
  conversions: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  roi: number;
}

export default function RetailerMarketingPage() {
  const theme = getRoleTheme('RETAILER');
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [selectedCampaignType, setSelectedCampaignType] = useState<'all' | 'Email' | 'Social' | 'SMS' | 'Push'>('all');

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  const campaigns: Campaign[] = [
    {
      id: 'CAMP-001',
      name: 'Spring Sale 2025',
      type: 'Email',
      status: 'Active',
      reach: 15420,
      clicks: 3240,
      conversions: 580,
      budget: 1500,
      spent: 890,
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      roi: 245,
    },
    {
      id: 'CAMP-002',
      name: 'New Customer Welcome',
      type: 'Email',
      status: 'Active',
      reach: 2340,
      clicks: 890,
      conversions: 156,
      budget: 500,
      spent: 320,
      startDate: '2025-10-15',
      endDate: '2025-12-31',
      roi: 189,
    },
    {
      id: 'CAMP-003',
      name: 'Instagram Product Launch',
      type: 'Social',
      status: 'Active',
      reach: 28500,
      clicks: 5670,
      conversions: 890,
      budget: 2000,
      spent: 1450,
      startDate: '2025-11-05',
      endDate: '2025-11-20',
      roi: 312,
    },
    {
      id: 'CAMP-004',
      name: 'Black Friday Countdown',
      type: 'SMS',
      status: 'Draft',
      reach: 0,
      clicks: 0,
      conversions: 0,
      budget: 800,
      spent: 0,
      startDate: '2025-11-25',
      endDate: '2025-11-29',
      roi: 0,
    },
    {
      id: 'CAMP-005',
      name: 'Weekly Deals Alert',
      type: 'Push',
      status: 'Active',
      reach: 8920,
      clicks: 2340,
      conversions: 445,
      budget: 600,
      spent: 380,
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      roi: 278,
    },
  ];

  const filteredCampaigns = selectedCampaignType === 'all'
    ? campaigns
    : campaigns.filter(c => c.type === selectedCampaignType);

  const columns: Column<Campaign>[] = [
    {
      key: 'name',
      label: 'Campaign',
      sortable: true,
      render: (campaign) => (
        <div>
          <div className="font-semibold text-gray-900">{campaign.name}</div>
          <div className="text-xs text-gray-500">{campaign.id}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (campaign) => {
        const typeColors = {
          Email: 'bg-blue-100 text-blue-800',
          Social: 'bg-purple-100 text-purple-800',
          SMS: 'bg-green-100 text-green-800',
          Push: 'bg-orange-100 text-orange-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${typeColors[campaign.type]}`}>
            {campaign.type}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (campaign) => {
        const statusColors = {
          Draft: 'bg-gray-100 text-gray-800',
          Active: 'bg-green-100 text-green-800',
          Paused: 'bg-yellow-100 text-yellow-800',
          Completed: 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[campaign.status]}`}>
            {campaign.status}
          </span>
        );
      },
    },
    {
      key: 'reach',
      label: 'Reach',
      sortable: true,
      render: (campaign) => (
        <span className="font-semibold text-gray-900">{campaign.reach.toLocaleString()}</span>
      ),
    },
    {
      key: 'clicks',
      label: 'Clicks',
      sortable: true,
      render: (campaign) => (
        <div>
          <div className="font-semibold text-gray-900">{campaign.clicks.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            {campaign.reach > 0 ? ((campaign.clicks / campaign.reach) * 100).toFixed(1) : 0}% CTR
          </div>
        </div>
      ),
    },
    {
      key: 'conversions',
      label: 'Conversions',
      sortable: true,
      render: (campaign) => (
        <div>
          <div className="font-semibold text-green-600">{campaign.conversions.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            {campaign.clicks > 0 ? ((campaign.conversions / campaign.clicks) * 100).toFixed(1) : 0}% CVR
          </div>
        </div>
      ),
    },
    {
      key: 'budget',
      label: 'Budget',
      sortable: true,
      render: (campaign) => (
        <div>
          <div className="text-sm text-gray-900">${campaign.spent.toFixed(0)} / ${campaign.budget.toFixed(0)}</div>
          <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
              style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'roi',
      label: 'ROI',
      sortable: true,
      render: (campaign) => (
        <span className={`font-semibold ${campaign.roi > 200 ? 'text-green-600' : campaign.roi > 100 ? 'text-blue-600' : 'text-gray-600'}`}>
          {campaign.roi > 0 ? `${campaign.roi}%` : '-'}
        </span>
      ),
    },
  ];

  const performanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Reach',
        data: [12000, 18000, 22000, 28000],
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}40`,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Conversions',
        data: [450, 680, 820, 1050],
        borderColor: theme.colors.accent,
        backgroundColor: `${theme.colors.accent}40`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const channelData = {
    labels: ['Email', 'Social Media', 'SMS', 'Push Notifications'],
    datasets: [
      {
        label: 'Conversions by Channel',
        data: [736, 890, 234, 445],
        backgroundColor: [
          '#3B82F6',
          '#8B5CF6',
          '#10B981',
          '#F97316',
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
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing Campaigns</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage multi-channel marketing campaigns
            </p>
          </div>
          <button
            onClick={() => setShowNewCampaignModal(true)}
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <PlusIcon className="mb-1 inline h-5 w-5" /> New Campaign
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Reach"
            value={campaigns.reduce((sum, c) => sum + c.reach, 0).toLocaleString()}
            subtitle="Across all campaigns"
            icon={UserGroupIcon}
            trend={{ direction: 'up', value: '18%', label: 'vs last month' }}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Total Clicks"
            value={campaigns.reduce((sum, c) => sum + c.clicks, 0).toLocaleString()}
            subtitle="Click-through rate: 19.2%"
            icon={CursorArrowRaysIcon}
            trend={{ direction: 'up', value: '12%', label: 'vs last month' }}
            gradient="from-blue-500 to-indigo-500"
          />
          <AdvancedStatCard
            title="Conversions"
            value={campaigns.reduce((sum, c) => sum + c.conversions, 0).toLocaleString()}
            subtitle="Conversion rate: 16.8%"
            icon={ChartBarIcon}
            trend={{ direction: 'up', value: '23%', label: 'vs last month' }}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Avg ROI"
            value={`${Math.round(campaigns.filter(c => c.roi > 0).reduce((sum, c) => sum + c.roi, 0) / campaigns.filter(c => c.roi > 0).length)}%`}
            subtitle="Return on investment"
            icon={MegaphoneIcon}
            trend={{ direction: 'up', value: '15%', label: 'vs last month' }}
            gradient="from-purple-500 to-pink-500"
          />
        </StatCardsGrid>

        {/* Campaign Type Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'Email', 'Social', 'SMS', 'Push'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedCampaignType(type as any)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedCampaignType === type
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type === 'all' ? 'All Campaigns' : type}
              {type !== 'all' && (
                <span className="ml-2 rounded-full bg-white bg-opacity-30 px-2 py-0.5 text-xs">
                  {campaigns.filter(c => c.type === type).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Campaign Performance</h2>
            <div className="h-64">
              <Line data={performanceData} options={chartOptions} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Conversions by Channel</h2>
            <div className="h-64">
              <Bar data={channelData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Active Campaigns Quick View */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.filter(c => c.status === 'Active').map((campaign) => (
            <div key={campaign.id} className="rounded-lg border-2 border-amber-200 bg-white p-6 shadow">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-500">{campaign.type} Campaign</p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <EyeIcon className="h-4 w-4" /> Reach
                  </span>
                  <span className="font-semibold text-gray-900">{campaign.reach.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <CursorArrowRaysIcon className="h-4 w-4" /> Clicks
                  </span>
                  <span className="font-semibold text-blue-600">{campaign.clicks.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <ChartBarIcon className="h-4 w-4" /> Conversions
                  </span>
                  <span className="font-semibold text-green-600">{campaign.conversions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ROI</span>
                  <span className="font-semibold text-purple-600">{campaign.roi}%</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                  <span>Budget</span>
                  <span>${campaign.spent} / ${campaign.budget}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <button className="mt-4 w-full rounded-lg border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50">
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Campaigns Table */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">All Campaigns</h2>
          <AdvancedDataTable
            data={filteredCampaigns}
            columns={columns}
            searchPlaceholder="Search campaigns by name, type..."
          />
        </div>

        {/* New Campaign Modal */}
        {showNewCampaignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
                <button
                  onClick={() => setShowNewCampaignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Holiday Sale 2025"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Campaign Type</label>
                  <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option>Email Marketing</option>
                    <option>Social Media</option>
                    <option>SMS Campaign</option>
                    <option>Push Notifications</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget ($)</label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                  <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option>All Customers</option>
                    <option>VIP Customers</option>
                    <option>New Customers</option>
                    <option>Inactive Customers</option>
                    <option>Custom Segment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Enter your campaign message..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewCampaignModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600">
                    Create Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
