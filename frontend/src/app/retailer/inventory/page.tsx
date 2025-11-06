'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  TruckIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { Bar, Line } from 'react-chartjs-2';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  unitCost: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon';
  movement: number; // units per week
}

interface StockMovement {
  id: string;
  item: string;
  type: 'In' | 'Out' | 'Adjustment' | 'Return';
  quantity: number;
  date: string;
  reason: string;
  user: string;
}

interface Supplier {
  id: string;
  name: string;
  products: number;
  avgLeadTime: number;
  reliability: number;
  totalOrders: number;
}

export default function RetailerInventoryPage() {
  const theme = getRoleTheme('RETAILER');
  const [activeTab, setActiveTab] = useState<'items' | 'movements' | 'suppliers' | 'analytics'>('items');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Vegetables' | 'Fruits' | 'Dairy' | 'Grains'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon'>('all');

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  const inventory: InventoryItem[] = [
    {
      id: 'INV-001',
      name: 'Organic Tomatoes',
      sku: 'VEG-TOM-001',
      category: 'Vegetables',
      currentStock: 45,
      reorderPoint: 50,
      maxStock: 200,
      unitCost: 2.50,
      unitPrice: 3.99,
      supplier: 'Fresh Farms Distributor',
      lastRestocked: '2025-11-05',
      expiryDate: '2025-11-15',
      status: 'Low Stock',
      movement: 65,
    },
    {
      id: 'INV-002',
      name: 'Fresh Lettuce',
      sku: 'VEG-LET-001',
      category: 'Vegetables',
      currentStock: 120,
      reorderPoint: 40,
      maxStock: 150,
      unitCost: 1.20,
      unitPrice: 2.49,
      supplier: 'Green Valley Supply',
      lastRestocked: '2025-11-06',
      expiryDate: '2025-11-10',
      status: 'Expiring Soon',
      movement: 58,
    },
    {
      id: 'INV-003',
      name: 'Red Apples',
      sku: 'FRT-APP-001',
      category: 'Fruits',
      currentStock: 180,
      reorderPoint: 60,
      maxStock: 250,
      unitCost: 1.80,
      unitPrice: 2.99,
      supplier: 'Orchard Direct',
      lastRestocked: '2025-11-04',
      expiryDate: '2025-11-25',
      status: 'In Stock',
      movement: 72,
    },
    {
      id: 'INV-004',
      name: 'Carrots',
      sku: 'VEG-CAR-001',
      category: 'Vegetables',
      currentStock: 0,
      reorderPoint: 50,
      maxStock: 200,
      unitCost: 0.90,
      unitPrice: 1.99,
      supplier: 'Farm Fresh Network',
      lastRestocked: '2025-10-28',
      expiryDate: '2025-11-20',
      status: 'Out of Stock',
      movement: 45,
    },
    {
      id: 'INV-005',
      name: 'Bananas',
      sku: 'FRT-BAN-001',
      category: 'Fruits',
      currentStock: 220,
      reorderPoint: 80,
      maxStock: 300,
      unitCost: 0.60,
      unitPrice: 1.29,
      supplier: 'Tropical Imports Co.',
      lastRestocked: '2025-11-06',
      expiryDate: '2025-11-12',
      status: 'In Stock',
      movement: 95,
    },
  ];

  const movements: StockMovement[] = [
    {
      id: 'MOV-001',
      item: 'Organic Tomatoes',
      type: 'Out',
      quantity: 25,
      date: '2025-11-06 14:30',
      reason: 'Customer sales',
      user: 'Sarah Johnson',
    },
    {
      id: 'MOV-002',
      item: 'Fresh Lettuce',
      type: 'In',
      quantity: 60,
      date: '2025-11-06 09:15',
      reason: 'Supplier delivery',
      user: 'Mike Davis',
    },
    {
      id: 'MOV-003',
      item: 'Red Apples',
      type: 'Out',
      quantity: 35,
      date: '2025-11-06 11:20',
      reason: 'Customer sales',
      user: 'Emily Wilson',
    },
    {
      id: 'MOV-004',
      item: 'Bananas',
      type: 'Adjustment',
      quantity: -5,
      date: '2025-11-06 08:45',
      reason: 'Damaged/Spoiled',
      user: 'John Smith',
    },
    {
      id: 'MOV-005',
      item: 'Carrots',
      type: 'Out',
      quantity: 20,
      date: '2025-11-05 16:10',
      reason: 'Customer sales',
      user: 'Sarah Johnson',
    },
  ];

  const suppliers: Supplier[] = [
    {
      id: 'SUP-001',
      name: 'Fresh Farms Distributor',
      products: 12,
      avgLeadTime: 2,
      reliability: 98,
      totalOrders: 145,
    },
    {
      id: 'SUP-002',
      name: 'Green Valley Supply',
      products: 8,
      avgLeadTime: 1,
      reliability: 95,
      totalOrders: 98,
    },
    {
      id: 'SUP-003',
      name: 'Orchard Direct',
      products: 6,
      avgLeadTime: 3,
      reliability: 92,
      totalOrders: 67,
    },
    {
      id: 'SUP-004',
      name: 'Farm Fresh Network',
      products: 10,
      avgLeadTime: 2,
      reliability: 97,
      totalOrders: 112,
    },
  ];

  let filteredInventory = inventory;
  if (selectedCategory !== 'all') {
    filteredInventory = filteredInventory.filter(item => item.category === selectedCategory);
  }
  if (statusFilter !== 'all') {
    filteredInventory = filteredInventory.filter(item => item.status === statusFilter);
  }

  const inventoryColumns: Column<InventoryItem>[] = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-gray-900">{item.name}</div>
          <div className="text-xs text-gray-500">{item.sku}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
    },
    {
      key: 'currentStock',
      label: 'Stock',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-gray-900">{item.currentStock} units</div>
          <div className="mt-1 h-2 w-20 rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full ${
                item.currentStock === 0
                  ? 'bg-red-500'
                  : item.currentStock <= item.reorderPoint
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => {
        const statusColors = {
          'In Stock': 'bg-green-100 text-green-800',
          'Low Stock': 'bg-yellow-100 text-yellow-800',
          'Out of Stock': 'bg-red-100 text-red-800',
          'Expiring Soon': 'bg-orange-100 text-orange-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[item.status]}`}>
            {item.status}
          </span>
        );
      },
    },
    {
      key: 'reorderPoint',
      label: 'Reorder Point',
      sortable: true,
      render: (item) => (
        <span className="text-gray-700">{item.reorderPoint}</span>
      ),
    },
    {
      key: 'unitCost',
      label: 'Cost',
      sortable: true,
      render: (item) => (
        <span className="text-gray-700">${item.unitCost.toFixed(2)}</span>
      ),
    },
    {
      key: 'unitPrice',
      label: 'Price',
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-gray-900">${item.unitPrice.toFixed(2)}</span>
      ),
    },
    {
      key: 'movement',
      label: 'Movement/Week',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1">
          {item.movement > 60 ? (
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4 text-gray-600" />
          )}
          <span className="text-gray-700">{item.movement}</span>
        </div>
      ),
    },
    {
      key: 'expiryDate',
      label: 'Expires',
      sortable: true,
      render: (item) => {
        const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <span className={`text-sm ${daysUntilExpiry <= 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
            {new Date(item.expiryDate).toLocaleDateString()}
          </span>
        );
      },
    },
  ];

  const movementColumns: Column<StockMovement>[] = [
    {
      key: 'item',
      label: 'Item',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (mov) => {
        const typeColors = {
          'In': 'bg-green-100 text-green-800',
          'Out': 'bg-blue-100 text-blue-800',
          'Adjustment': 'bg-yellow-100 text-yellow-800',
          'Return': 'bg-purple-100 text-purple-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${typeColors[mov.type]}`}>
            {mov.type}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (mov) => (
        <span className={`font-semibold ${mov.quantity < 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {mov.quantity > 0 ? '+' : ''}{mov.quantity}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (mov) => (
        <span className="text-sm text-gray-700">{mov.reason}</span>
      ),
    },
    {
      key: 'user',
      label: 'User',
      sortable: true,
    },
    {
      key: 'date',
      label: 'Date/Time',
      sortable: true,
      render: (mov) => (
        <span className="text-sm text-gray-700">{mov.date}</span>
      ),
    },
  ];

  const supplierColumns: Column<Supplier>[] = [
    {
      key: 'name',
      label: 'Supplier',
      sortable: true,
    },
    {
      key: 'products',
      label: 'Products',
      sortable: true,
      render: (sup) => (
        <span className="text-gray-700">{sup.products} items</span>
      ),
    },
    {
      key: 'avgLeadTime',
      label: 'Lead Time',
      sortable: true,
      render: (sup) => (
        <span className="text-gray-700">{sup.avgLeadTime} days</span>
      ),
    },
    {
      key: 'reliability',
      label: 'Reliability',
      sortable: true,
      render: (sup) => (
        <div>
          <span className={`font-semibold ${sup.reliability >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
            {sup.reliability}%
          </span>
          <div className="mt-1 h-2 w-20 rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full ${sup.reliability >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${sup.reliability}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'totalOrders',
      label: 'Total Orders',
      sortable: true,
      render: (sup) => (
        <span className="text-gray-700">{sup.totalOrders}</span>
      ),
    },
  ];

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
  const expiringItems = inventory.filter(i => i.status === 'Expiring Soon').length;
  const totalValue = inventory.reduce((sum, i) => sum + (i.currentStock * i.unitCost), 0);

  const stockLevelsData = {
    labels: inventory.map(i => i.name),
    datasets: [
      {
        label: 'Current Stock',
        data: inventory.map(i => i.currentStock),
        backgroundColor: theme.colors.primary,
      },
      {
        label: 'Reorder Point',
        data: inventory.map(i => i.reorderPoint),
        backgroundColor: '#EF4444',
      },
    ],
  };

  const movementTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Stock In',
        data: [350, 420, 380, 490],
        borderColor: '#10B981',
        backgroundColor: '#10B98140',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Stock Out',
        data: [280, 310, 295, 340],
        borderColor: '#EF4444',
        backgroundColor: '#EF444440',
        fill: true,
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
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track stock levels, movements, and supplier performance
            </p>
          </div>
          <button
            onClick={() => setShowAddItemModal(true)}
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <PlusIcon className="mb-1 inline h-5 w-5" /> Add Item
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Items"
            value={totalItems}
            subtitle="Unique products"
            icon={CubeIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Low Stock Alerts"
            value={lowStockItems}
            subtitle="Need reordering"
            icon={ExclamationTriangleIcon}
            gradient="from-red-500 to-orange-500"
          />
          <AdvancedStatCard
            title="Expiring Soon"
            value={expiringItems}
            subtitle="Within 5 days"
            icon={ClockIcon}
            gradient="from-yellow-500 to-amber-500"
          />
          <AdvancedStatCard
            title="Total Value"
            value={`$${totalValue.toLocaleString()}`}
            subtitle="Inventory valuation"
            icon={ChartBarIcon}
            gradient="from-green-500 to-emerald-500"
          />
        </StatCardsGrid>

        {/* Alert Cards */}
        {(lowStockItems > 0 || expiringItems > 0) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {lowStockItems > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-900">Low Stock Alert</h3>
                    <p className="text-sm text-red-700">
                      {lowStockItems} items need immediate reordering
                    </p>
                  </div>
                </div>
              </div>
            )}
            {expiringItems > 0 && (
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-900">Expiry Alert</h3>
                    <p className="text-sm text-orange-700">
                      {expiringItems} items expiring within 5 days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'items', label: 'Inventory Items', count: inventory.length },
            { id: 'movements', label: 'Stock Movements', count: movements.length },
            { id: 'suppliers', label: 'Suppliers', count: suppliers.length },
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

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-2">
                <span className="text-sm font-medium text-gray-700 self-center">Category:</span>
                {['all', 'Vegetables', 'Fruits', 'Dairy', 'Grains'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as any)}
                    className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 ml-4">
                <span className="text-sm font-medium text-gray-700 self-center">Status:</span>
                {['all', 'In Stock', 'Low Stock', 'Out of Stock', 'Expiring Soon'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as any)}
                    className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Table */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <AdvancedDataTable
                data={filteredInventory}
                columns={inventoryColumns}
                searchPlaceholder="Search by product name, SKU..."
              />
            </div>
          </div>
        )}

        {/* Movements Tab */}
        {activeTab === 'movements' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Stock In</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                      +{movements.filter(m => m.type === 'In').reduce((sum, m) => sum + m.quantity, 0)}
                    </p>
                  </div>
                  <ArrowTrendingUpIcon className="h-12 w-12 text-green-500 opacity-20" />
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Stock Out</p>
                    <p className="mt-2 text-3xl font-bold text-blue-600">
                      -{movements.filter(m => m.type === 'Out').reduce((sum, m) => sum + m.quantity, 0)}
                    </p>
                  </div>
                  <ArrowTrendingDownIcon className="h-12 w-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Adjustments</p>
                    <p className="mt-2 text-3xl font-bold text-yellow-600">
                      {movements.filter(m => m.type === 'Adjustment').length}
                    </p>
                  </div>
                  <ArrowPathIcon className="h-12 w-12 text-yellow-500 opacity-20" />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Stock Movements</h2>
              <AdvancedDataTable
                data={movements}
                columns={movementColumns}
                searchPlaceholder="Search movements..."
              />
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-center gap-3">
                <TruckIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Supplier Performance</h3>
                  <p className="text-sm text-blue-700">
                    Average reliability: {(suppliers.reduce((sum, s) => sum + s.reliability, 0) / suppliers.length).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <AdvancedDataTable
                data={suppliers}
                columns={supplierColumns}
                searchPlaceholder="Search suppliers..."
              />
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Stock Levels vs Reorder Points</h2>
                <div className="h-64">
                  <Bar data={stockLevelsData} options={chartOptions} />
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Stock Movement Trend</h2>
                <div className="h-64">
                  <Line data={movementTrendData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Inventory Insights */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Inventory Insights</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-medium text-gray-900">Turnover Rate</h3>
                  <div className="space-y-2">
                    {inventory.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.name}</span>
                        <span className="font-semibold text-amber-600">{item.movement}/week</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-medium text-gray-900">Value by Category</h3>
                  <div className="space-y-2">
                    {['Vegetables', 'Fruits'].map((cat) => {
                      const value = inventory
                        .filter(i => i.category === cat)
                        .reduce((sum, i) => sum + (i.currentStock * i.unitCost), 0);
                      return (
                        <div key={cat} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{cat}</span>
                          <span className="font-semibold text-green-600">${value.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add Inventory Item</h2>
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                      <option>Vegetables</option>
                      <option>Fruits</option>
                      <option>Dairy</option>
                      <option>Grains</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Supplier</label>
                    <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                      {suppliers.map(sup => (
                        <option key={sup.id}>{sup.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Stock</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reorder Point</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Stock</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddItemModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600">
                    Add Item
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
