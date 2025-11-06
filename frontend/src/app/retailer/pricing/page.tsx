'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  cost: number;
  price: number;
  suggestedPrice: number;
  margin: number;
  competitorPrice: number;
  priceStatus: 'Optimal' | 'Too High' | 'Too Low' | 'Updated';
  lastUpdated: string;
  sales: number;
}

interface PriceRule {
  id: string;
  name: string;
  type: 'Markup' | 'Markdown' | 'Dynamic' | 'Competitive';
  condition: string;
  value: number;
  status: 'Active' | 'Inactive' | 'Scheduled';
  appliedTo: number;
  startDate: string;
  endDate: string;
}

export default function RetailerPricingPage() {
  const theme = getRoleTheme('RETAILER');
  const [activeTab, setActiveTab] = useState<'products' | 'rules' | 'analytics'>('products');
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Vegetables' | 'Fruits' | 'Dairy' | 'Grains'>('all');

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  const products: Product[] = [
    {
      id: 'P-001',
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      sku: 'VEG-TOM-001',
      cost: 2.50,
      price: 3.99,
      suggestedPrice: 4.29,
      margin: 37.3,
      competitorPrice: 4.49,
      priceStatus: 'Optimal',
      lastUpdated: '2025-11-05',
      sales: 450,
    },
    {
      id: 'P-002',
      name: 'Fresh Lettuce',
      category: 'Vegetables',
      sku: 'VEG-LET-001',
      cost: 1.20,
      price: 2.49,
      suggestedPrice: 2.99,
      margin: 51.8,
      competitorPrice: 2.29,
      priceStatus: 'Too High',
      lastUpdated: '2025-11-04',
      sales: 380,
    },
    {
      id: 'P-003',
      name: 'Red Apples',
      category: 'Fruits',
      sku: 'FRT-APP-001',
      cost: 1.80,
      price: 2.99,
      suggestedPrice: 3.49,
      margin: 39.8,
      competitorPrice: 3.29,
      priceStatus: 'Too Low',
      lastUpdated: '2025-11-06',
      sales: 520,
    },
    {
      id: 'P-004',
      name: 'Carrots',
      category: 'Vegetables',
      sku: 'VEG-CAR-001',
      cost: 0.90,
      price: 1.99,
      suggestedPrice: 2.29,
      margin: 54.8,
      competitorPrice: 2.19,
      priceStatus: 'Optimal',
      lastUpdated: '2025-11-03',
      sales: 290,
    },
    {
      id: 'P-005',
      name: 'Bananas',
      category: 'Fruits',
      sku: 'FRT-BAN-001',
      cost: 0.60,
      price: 1.29,
      suggestedPrice: 1.49,
      margin: 53.5,
      competitorPrice: 1.39,
      priceStatus: 'Updated',
      lastUpdated: '2025-11-06',
      sales: 675,
    },
  ];

  const priceRules: PriceRule[] = [
    {
      id: 'RULE-001',
      name: 'Standard Markup',
      type: 'Markup',
      condition: 'All Products',
      value: 40,
      status: 'Active',
      appliedTo: 45,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    },
    {
      id: 'RULE-002',
      name: 'Weekend Discount',
      type: 'Markdown',
      condition: 'Vegetables Category - Weekends',
      value: 15,
      status: 'Active',
      appliedTo: 12,
      startDate: '2025-11-01',
      endDate: '2025-11-30',
    },
    {
      id: 'RULE-003',
      name: 'Competitor Match',
      type: 'Competitive',
      condition: 'Price 5% below competitor',
      value: 5,
      status: 'Active',
      appliedTo: 8,
      startDate: '2025-10-15',
      endDate: '2025-12-31',
    },
    {
      id: 'RULE-004',
      name: 'Dynamic Pricing',
      type: 'Dynamic',
      condition: 'Based on demand & inventory',
      value: 0,
      status: 'Active',
      appliedTo: 25,
      startDate: '2025-11-01',
      endDate: '2025-12-31',
    },
    {
      id: 'RULE-005',
      name: 'Black Friday Sale',
      type: 'Markdown',
      condition: 'All Products',
      value: 30,
      status: 'Scheduled',
      appliedTo: 0,
      startDate: '2025-11-29',
      endDate: '2025-11-29',
    },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const productColumns: Column<Product>[] = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (product) => (
        <div>
          <div className="font-semibold text-gray-900">{product.name}</div>
          <div className="text-xs text-gray-500">{product.sku}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (product) => (
        <span className="text-sm text-gray-700">{product.category}</span>
      ),
    },
    {
      key: 'cost',
      label: 'Cost',
      sortable: true,
      render: (product) => (
        <span className="text-gray-700">${product.cost.toFixed(2)}</span>
      ),
    },
    {
      key: 'price',
      label: 'Current Price',
      sortable: true,
      render: (product) => (
        <div>
          <div className="font-semibold text-gray-900">${product.price.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            {product.price > product.competitorPrice ? (
              <span className="text-red-600">↑ ${(product.price - product.competitorPrice).toFixed(2)}</span>
            ) : (
              <span className="text-green-600">↓ ${(product.competitorPrice - product.price).toFixed(2)}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'suggestedPrice',
      label: 'Suggested',
      sortable: true,
      render: (product) => (
        <span className="font-medium text-blue-600">${product.suggestedPrice.toFixed(2)}</span>
      ),
    },
    {
      key: 'margin',
      label: 'Margin',
      sortable: true,
      render: (product) => (
        <span className={`font-semibold ${product.margin > 50 ? 'text-green-600' : product.margin > 35 ? 'text-blue-600' : 'text-yellow-600'}`}>
          {product.margin.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'competitorPrice',
      label: 'Competitor',
      sortable: true,
      render: (product) => (
        <span className="text-gray-700">${product.competitorPrice.toFixed(2)}</span>
      ),
    },
    {
      key: 'priceStatus',
      label: 'Status',
      sortable: true,
      render: (product) => {
        const statusConfig = {
          'Optimal': 'bg-green-100 text-green-800',
          'Too High': 'bg-red-100 text-red-800',
          'Too Low': 'bg-yellow-100 text-yellow-800',
          'Updated': 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusConfig[product.priceStatus]}`}>
            {product.priceStatus}
          </span>
        );
      },
    },
  ];

  const ruleColumns: Column<PriceRule>[] = [
    {
      key: 'name',
      label: 'Rule Name',
      sortable: true,
      render: (rule) => (
        <div>
          <div className="font-semibold text-gray-900">{rule.name}</div>
          <div className="text-xs text-gray-500">{rule.id}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (rule) => {
        const typeColors = {
          'Markup': 'bg-green-100 text-green-800',
          'Markdown': 'bg-red-100 text-red-800',
          'Dynamic': 'bg-purple-100 text-purple-800',
          'Competitive': 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${typeColors[rule.type]}`}>
            {rule.type}
          </span>
        );
      },
    },
    {
      key: 'condition',
      label: 'Condition',
      render: (rule) => (
        <span className="text-sm text-gray-700">{rule.condition}</span>
      ),
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      render: (rule) => (
        <span className="font-semibold text-gray-900">
          {rule.value > 0 ? `${rule.value}%` : 'Variable'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (rule) => {
        const statusColors = {
          'Active': 'bg-green-100 text-green-800',
          'Inactive': 'bg-gray-100 text-gray-800',
          'Scheduled': 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[rule.status]}`}>
            {rule.status}
          </span>
        );
      },
    },
    {
      key: 'appliedTo',
      label: 'Applied To',
      sortable: true,
      render: (rule) => (
        <span className="text-gray-700">{rule.appliedTo} products</span>
      ),
    },
    {
      key: 'endDate',
      label: 'Valid Until',
      sortable: true,
      render: (rule) => (
        <span className="text-sm text-gray-700">{new Date(rule.endDate).toLocaleDateString()}</span>
      ),
    },
  ];

  const avgMargin = products.reduce((sum, p) => sum + p.margin, 0) / products.length;
  const optimalCount = products.filter(p => p.priceStatus === 'Optimal').length;
  const needsReview = products.filter(p => p.priceStatus === 'Too High' || p.priceStatus === 'Too Low').length;

  const priceHistoryData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Your Price',
        data: [3.99, 4.29, 3.99, 4.19],
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}40`,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Competitor Price',
        data: [4.49, 4.29, 4.39, 4.29],
        borderColor: '#6366F1',
        backgroundColor: '#6366F140',
        fill: false,
        tension: 0.4,
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
            <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage product prices, rules, and competitive positioning
            </p>
          </div>
          <button
            onClick={() => setShowNewRuleModal(true)}
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <PlusIcon className="mb-1 inline h-5 w-5" /> New Price Rule
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Average Margin"
            value={`${avgMargin.toFixed(1)}%`}
            subtitle="Across all products"
            icon={ChartBarIcon}
            trend={{ direction: 'up', value: '2.3%', label: 'vs last month' }}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Optimal Pricing"
            value={optimalCount}
            subtitle={`${((optimalCount / products.length) * 100).toFixed(0)}% of products`}
            icon={CheckCircleIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Needs Review"
            value={needsReview}
            subtitle="Pricing issues detected"
            icon={AdjustmentsHorizontalIcon}
            gradient="from-yellow-500 to-orange-500"
          />
          <AdvancedStatCard
            title="Active Rules"
            value={priceRules.filter(r => r.status === 'Active').length}
            subtitle={`${priceRules.length} total rules`}
            icon={CurrencyDollarIcon}
            gradient="from-blue-500 to-indigo-500"
          />
        </StatCardsGrid>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'products', label: 'Products', count: products.length },
            { id: 'rules', label: 'Price Rules', count: priceRules.length },
            { id: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-amber-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              )}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'Vegetables', 'Fruits', 'Dairy', 'Grains'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as any)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                  {category !== 'all' && (
                    <span className="ml-2 rounded-full bg-white bg-opacity-30 px-2 py-0.5 text-xs">
                      {products.filter(p => p.category === category).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button className="flex items-center gap-3 rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100">
                <ArrowTrendingUpIcon className="h-8 w-8 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Bulk Increase</h3>
                  <p className="text-sm text-gray-600">Increase prices by %</p>
                </div>
              </button>

              <button className="flex items-center gap-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-left transition-colors hover:bg-blue-100">
                <ArrowTrendingDownIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Bulk Decrease</h3>
                  <p className="text-sm text-gray-600">Decrease prices by %</p>
                </div>
              </button>

              <button className="flex items-center gap-3 rounded-lg border-2 border-green-200 bg-green-50 p-4 text-left transition-colors hover:bg-green-100">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Auto-Optimize</h3>
                  <p className="text-sm text-gray-600">Apply suggestions</p>
                </div>
              </button>
            </div>

            {/* Products Table */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <AdvancedDataTable
                data={filteredProducts}
                columns={productColumns}
                searchPlaceholder="Search products by name, SKU..."
              />
            </div>
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-center gap-3">
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Automated Pricing Rules</h3>
                  <p className="text-sm text-blue-700">
                    {priceRules.filter(r => r.status === 'Active').length} active rules managing {priceRules.filter(r => r.status === 'Active').reduce((sum, r) => sum + r.appliedTo, 0)} products
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <AdvancedDataTable
                data={priceRules}
                columns={ruleColumns}
                searchPlaceholder="Search rules by name, type..."
              />
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Price History Chart */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Price Comparison (Organic Tomatoes)</h2>
              <div className="h-64">
                <Line data={priceHistoryData} options={chartOptions} />
              </div>
            </div>

            {/* Pricing Insights */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 font-semibold text-gray-900">Price Status Distribution</h3>
                <div className="space-y-3">
                  {[
                    { status: 'Optimal', count: 2, color: 'bg-green-500' },
                    { status: 'Too High', count: 1, color: 'bg-red-500' },
                    { status: 'Too Low', count: 1, color: 'bg-yellow-500' },
                    { status: 'Updated', count: 1, color: 'bg-blue-500' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{item.status}</span>
                          <span className="text-sm text-gray-600">{item.count} products</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${(item.count / products.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 font-semibold text-gray-900">Margin Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">High Margin (&gt;50%)</span>
                    <span className="font-semibold text-green-600">
                      {products.filter(p => p.margin > 50).length} products
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Medium Margin (35-50%)</span>
                    <span className="font-semibold text-blue-600">
                      {products.filter(p => p.margin >= 35 && p.margin <= 50).length} products
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Margin (&lt;35%)</span>
                    <span className="font-semibold text-yellow-600">
                      {products.filter(p => p.margin < 35).length} products
                    </span>
                  </div>
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Average Margin</span>
                      <span className="text-xl font-bold text-amber-600">{avgMargin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Price Rule Modal */}
        {showNewRuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Price Rule</h2>
                <button
                  onClick={() => setShowNewRuleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rule Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Holiday Markup"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rule Type</label>
                  <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option>Markup (Increase Prices)</option>
                    <option>Markdown (Decrease Prices)</option>
                    <option>Dynamic Pricing</option>
                    <option>Competitive Pricing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Apply To</label>
                  <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option>All Products</option>
                    <option>Vegetables Category</option>
                    <option>Fruits Category</option>
                    <option>Dairy Category</option>
                    <option>Grains Category</option>
                    <option>Specific Products</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Value (%)</label>
                  <input
                    type="number"
                    placeholder="10"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
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
                  <label className="block text-sm font-medium text-gray-700">Conditions</label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Apply only when inventory > 100 units"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewRuleModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600">
                    Create Rule
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
