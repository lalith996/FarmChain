'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  TagIcon,
  GiftIcon,
  SparklesIcon,
  TicketIcon,
  PlusIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface Promotion {
  id: string;
  name: string;
  code: string;
  type: 'Percentage' | 'Fixed Amount' | 'BOGO' | 'Free Shipping';
  value: number;
  status: 'Active' | 'Scheduled' | 'Expired' | 'Draft';
  uses: number;
  maxUses: number;
  minPurchase: number;
  startDate: string;
  endDate: string;
  revenue: number;
}

export default function RetailerPromotionsPage() {
  const theme = getRoleTheme('RETAILER');
  const [showNewPromoModal, setShowNewPromoModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'Percentage' | 'Fixed Amount' | 'BOGO' | 'Free Shipping'>('all');

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  const promotions: Promotion[] = [
    {
      id: 'PROMO-001',
      name: 'Spring Sale',
      code: 'SPRING25',
      type: 'Percentage',
      value: 25,
      status: 'Active',
      uses: 456,
      maxUses: 1000,
      minPurchase: 50,
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      revenue: 12450,
    },
    {
      id: 'PROMO-002',
      name: 'New Customer Discount',
      code: 'WELCOME10',
      type: 'Fixed Amount',
      value: 10,
      status: 'Active',
      uses: 234,
      maxUses: 500,
      minPurchase: 30,
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      revenue: 5670,
    },
    {
      id: 'PROMO-003',
      name: 'Buy One Get One',
      code: 'BOGO50',
      type: 'BOGO',
      value: 50,
      status: 'Active',
      uses: 189,
      maxUses: 300,
      minPurchase: 0,
      startDate: '2025-11-05',
      endDate: '2025-11-20',
      revenue: 8920,
    },
    {
      id: 'PROMO-004',
      name: 'Free Delivery Weekend',
      code: 'FREESHIP',
      type: 'Free Shipping',
      value: 0,
      status: 'Active',
      uses: 567,
      maxUses: 1000,
      minPurchase: 25,
      startDate: '2025-11-06',
      endDate: '2025-11-07',
      revenue: 15230,
    },
    {
      id: 'PROMO-005',
      name: 'Black Friday Sale',
      code: 'BFRIDAY40',
      type: 'Percentage',
      value: 40,
      status: 'Scheduled',
      uses: 0,
      maxUses: 2000,
      minPurchase: 100,
      startDate: '2025-11-29',
      endDate: '2025-11-29',
      revenue: 0,
    },
    {
      id: 'PROMO-006',
      name: 'October Special',
      code: 'OCT15',
      type: 'Percentage',
      value: 15,
      status: 'Expired',
      uses: 890,
      maxUses: 1000,
      minPurchase: 40,
      startDate: '2025-10-01',
      endDate: '2025-10-31',
      revenue: 18670,
    },
  ];

  const filteredPromotions = selectedType === 'all'
    ? promotions
    : promotions.filter(p => p.type === selectedType);

  const columns: Column<Promotion>[] = [
    {
      key: 'name',
      label: 'Promotion',
      sortable: true,
      render: (promo) => (
        <div>
          <div className="font-semibold text-gray-900">{promo.name}</div>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded bg-amber-100 px-2 py-0.5 text-xs font-mono font-semibold text-amber-700">
              {promo.code}
            </code>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (promo) => {
        const typeConfig = {
          'Percentage': { icon: TagIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
          'Fixed Amount': { icon: CurrencyDollarIcon, color: 'text-green-600', bg: 'bg-green-100' },
          'BOGO': { icon: GiftIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
          'Free Shipping': { icon: SparklesIcon, color: 'text-orange-600', bg: 'bg-orange-100' },
        };
        const config = typeConfig[promo.type];
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={`rounded p-1 ${config.bg}`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <span className="text-sm text-gray-700">{promo.type}</span>
          </div>
        );
      },
    },
    {
      key: 'value',
      label: 'Discount',
      sortable: true,
      render: (promo) => (
        <span className="font-semibold text-gray-900">
          {promo.type === 'Percentage' || promo.type === 'BOGO'
            ? `${promo.value}%`
            : promo.type === 'Fixed Amount'
            ? `$${promo.value}`
            : 'Free'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (promo) => {
        const statusColors = {
          Active: 'bg-green-100 text-green-800',
          Scheduled: 'bg-blue-100 text-blue-800',
          Expired: 'bg-gray-100 text-gray-800',
          Draft: 'bg-yellow-100 text-yellow-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[promo.status]}`}>
            {promo.status}
          </span>
        );
      },
    },
    {
      key: 'uses',
      label: 'Usage',
      sortable: true,
      render: (promo) => (
        <div>
          <div className="text-sm text-gray-900">
            {promo.uses} / {promo.maxUses === -1 ? '∞' : promo.maxUses}
          </div>
          <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
              style={{ width: `${Math.min((promo.uses / promo.maxUses) * 100, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'minPurchase',
      label: 'Min Purchase',
      sortable: true,
      render: (promo) => (
        <span className="text-gray-700">{promo.minPurchase > 0 ? `$${promo.minPurchase}` : 'None'}</span>
      ),
    },
    {
      key: 'endDate',
      label: 'Valid Until',
      sortable: true,
      render: (promo) => (
        <span className="text-gray-700">{new Date(promo.endDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'revenue',
      label: 'Revenue',
      sortable: true,
      render: (promo) => (
        <span className="font-semibold text-green-600">${promo.revenue.toLocaleString()}</span>
      ),
    },
  ];

  const activePromotions = promotions.filter(p => p.status === 'Active');
  const totalRevenue = promotions.reduce((sum, p) => sum + p.revenue, 0);
  const totalUses = promotions.reduce((sum, p) => sum + p.uses, 0);
  const avgDiscount = promotions.filter(p => p.type === 'Percentage').reduce((sum, p) => sum + p.value, 0) / promotions.filter(p => p.type === 'Percentage').length;

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promotions & Discounts</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage coupons, discounts, and special offers
            </p>
          </div>
          <button
            onClick={() => setShowNewPromoModal(true)}
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <PlusIcon className="mb-1 inline h-5 w-5" /> New Promotion
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Active Promotions"
            value={activePromotions.length}
            subtitle={`${promotions.filter(p => p.status === 'Scheduled').length} scheduled`}
            icon={TagIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Total Uses"
            value={totalUses.toLocaleString()}
            subtitle="Across all promotions"
            icon={ClipboardDocumentCheckIcon}
            trend={{ direction: 'up', value: '28%', label: 'vs last month' }}
            gradient="from-blue-500 to-indigo-500"
          />
          <AdvancedStatCard
            title="Promo Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            subtitle="From promotional sales"
            icon={CurrencyDollarIcon}
            trend={{ direction: 'up', value: '15%', label: 'vs last month' }}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Avg Discount"
            value={`${Math.round(avgDiscount)}%`}
            subtitle="Percentage discounts"
            icon={SparklesIcon}
            gradient="from-purple-500 to-pink-500"
          />
        </StatCardsGrid>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'Percentage', 'Fixed Amount', 'BOGO', 'Free Shipping'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type as any)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type === 'all' ? 'All Types' : type}
              {type !== 'all' && (
                <span className="ml-2 rounded-full bg-white bg-opacity-30 px-2 py-0.5 text-xs">
                  {promotions.filter(p => p.type === type).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Promotions Cards */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Active Promotions</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activePromotions.map((promo) => (
              <div
                key={promo.id}
                className="overflow-hidden rounded-lg border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg"
              >
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{promo.name}</h3>
                      <p className="mt-1 text-sm opacity-90">{promo.type}</p>
                    </div>
                    {promo.type === 'Percentage' && (
                      <div className="rounded-full bg-white px-3 py-1 text-2xl font-bold text-amber-600">
                        {promo.value}%
                      </div>
                    )}
                    {promo.type === 'Fixed Amount' && (
                      <div className="rounded-full bg-white px-3 py-1 text-2xl font-bold text-green-600">
                        ${promo.value}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-3 flex items-center justify-center">
                    <div className="rounded-lg border-2 border-dashed border-amber-300 bg-white px-6 py-3">
                      <code className="text-xl font-bold text-amber-600">{promo.code}</code>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Uses</span>
                      <span className="font-semibold text-gray-900">
                        {promo.uses} / {promo.maxUses}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                        style={{ width: `${Math.min((promo.uses / promo.maxUses) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Revenue</span>
                      <span className="font-semibold text-green-600">${promo.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Valid Until</span>
                      <span className="text-gray-900">{new Date(promo.endDate).toLocaleDateString()}</span>
                    </div>
                    {promo.minPurchase > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Min Purchase</span>
                        <span className="text-gray-900">${promo.minPurchase}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 rounded-lg border border-amber-500 px-3 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50">
                      Edit
                    </button>
                    <button className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Promotions Table */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">All Promotions</h2>
          <AdvancedDataTable
            data={filteredPromotions}
            columns={columns}
            searchPlaceholder="Search promotions by name, code..."
          />
        </div>

        {/* New Promotion Modal */}
        {showNewPromoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Promotion</h2>
                <button
                  onClick={() => setShowNewPromoModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Promotion Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Sale 2025"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Promo Code</label>
                  <input
                    type="text"
                    placeholder="e.g., SUMMER20"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 font-mono uppercase focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                  <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option>Percentage Discount</option>
                    <option>Fixed Amount Discount</option>
                    <option>Buy One Get One (BOGO)</option>
                    <option>Free Shipping</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Value</label>
                    <input
                      type="number"
                      placeholder="20"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Purchase ($)</label>
                    <input
                      type="number"
                      placeholder="50"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700">Max Uses</label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave blank for unlimited uses</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the promotion terms and conditions..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewPromoModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600">
                    Create Promotion
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
