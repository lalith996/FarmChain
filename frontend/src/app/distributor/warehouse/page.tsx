'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  CubeIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Bar } from 'react-chartjs-2';

interface WarehouseZone {
  id: string;
  name: string;
  type: 'Cold Storage' | 'Dry Storage' | 'Loading Dock' | 'Processing';
  capacity: number;
  occupied: number;
  temperature?: string;
  humidity?: string;
  status: 'Optimal' | 'Warning' | 'Critical';
}

interface InventoryItem {
  id: string;
  product: string;
  category: string;
  zone: string;
  quantity: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  lastUpdated: string;
}

export default function WarehouseManagementPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const [activeTab, setActiveTab] = useState<'zones' | 'inventory' | 'movements'>('zones');

  const user = {
    name: 'Warehouse Manager',
    email: 'warehouse@distribution.com',
  };

  const zones: WarehouseZone[] = [
    {
      id: 'ZONE-A1',
      name: 'Cold Storage - Vegetables',
      type: 'Cold Storage',
      capacity: 5000,
      occupied: 4200,
      temperature: '2-4°C',
      humidity: '85-90%',
      status: 'Warning',
    },
    {
      id: 'ZONE-A2',
      name: 'Cold Storage - Fruits',
      type: 'Cold Storage',
      capacity: 4500,
      occupied: 3100,
      temperature: '2-4°C',
      humidity: '85-90%',
      status: 'Optimal',
    },
    {
      id: 'ZONE-B1',
      name: 'Dry Storage - Grains',
      type: 'Dry Storage',
      capacity: 8000,
      occupied: 5600,
      temperature: '15-20°C',
      humidity: '60-70%',
      status: 'Optimal',
    },
    {
      id: 'ZONE-C1',
      name: 'Loading Dock North',
      type: 'Loading Dock',
      capacity: 20,
      occupied: 18,
      status: 'Critical',
    },
  ];

  const inventory: InventoryItem[] = [
    {
      id: 'INV-001',
      product: 'Organic Tomatoes',
      category: 'Vegetables',
      zone: 'ZONE-A1',
      quantity: 1200,
      reserved: 450,
      available: 750,
      reorderLevel: 500,
      lastUpdated: '2025-11-06 14:30',
    },
    {
      id: 'INV-002',
      product: 'Fresh Apples',
      category: 'Fruits',
      zone: 'ZONE-A2',
      quantity: 980,
      reserved: 320,
      available: 660,
      reorderLevel: 400,
      lastUpdated: '2025-11-06 13:15',
    },
    {
      id: 'INV-003',
      product: 'Rice',
      category: 'Grains',
      zone: 'ZONE-B1',
      quantity: 3500,
      reserved: 1200,
      available: 2300,
      reorderLevel: 1000,
      lastUpdated: '2025-11-06 10:00',
    },
  ];

  const zoneColumns: Column<WarehouseZone>[] = [
    {
      key: 'name',
      label: 'Zone',
      sortable: true,
      render: (zone) => (
        <div>
          <div className="font-semibold text-gray-900">{zone.name}</div>
          <div className="text-xs text-gray-500">{zone.id}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (zone) => (
        <span className="text-sm text-gray-700">{zone.type}</span>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      render: (zone) => (
        <div>
          <div className="text-sm text-gray-900">
            {zone.occupied.toLocaleString()} / {zone.capacity.toLocaleString()}
          </div>
          <div className="mt-1 h-2 w-32 rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full ${
                (zone.occupied / zone.capacity) * 100 > 90
                  ? 'bg-red-500'
                  : (zone.occupied / zone.capacity) * 100 > 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${(zone.occupied / zone.capacity) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'temperature',
      label: 'Temperature',
      render: (zone) => (
        <span className="text-sm text-gray-700">{zone.temperature || 'N/A'}</span>
      ),
    },
    {
      key: 'humidity',
      label: 'Humidity',
      render: (zone) => (
        <span className="text-sm text-gray-700">{zone.humidity || 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (zone) => {
        const statusColors = {
          'Optimal': 'bg-green-100 text-green-800',
          'Warning': 'bg-yellow-100 text-yellow-800',
          'Critical': 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[zone.status]}`}>
            {zone.status}
          </span>
        );
      },
    },
  ];

  const inventoryColumns: Column<InventoryItem>[] = [
    {
      key: 'product',
      label: 'Product',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-gray-900">{item.product}</div>
          <div className="text-xs text-gray-500">{item.category}</div>
        </div>
      ),
    },
    {
      key: 'zone',
      label: 'Zone',
      sortable: true,
    },
    {
      key: 'quantity',
      label: 'Total Quantity',
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-gray-900">{item.quantity.toLocaleString()}</span>
      ),
    },
    {
      key: 'reserved',
      label: 'Reserved',
      sortable: true,
      render: (item) => (
        <span className="text-blue-600">{item.reserved.toLocaleString()}</span>
      ),
    },
    {
      key: 'available',
      label: 'Available',
      sortable: true,
      render: (item) => (
        <span className={`font-semibold ${item.available < item.reorderLevel ? 'text-red-600' : 'text-green-600'}`}>
          {item.available.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'reorderLevel',
      label: 'Reorder Level',
      sortable: true,
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-600">{item.lastUpdated}</span>
      ),
    },
  ];

  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const totalOccupied = zones.reduce((sum, z) => sum + z.occupied, 0);
  const utilizationRate = ((totalOccupied / totalCapacity) * 100).toFixed(1);
  const criticalZones = zones.filter(z => z.status === 'Critical').length;
  const lowStockItems = inventory.filter(i => i.available < i.reorderLevel).length;

  const capacityData = {
    labels: zones.map(z => z.name),
    datasets: [
      {
        label: 'Occupied',
        data: zones.map(z => z.occupied),
        backgroundColor: theme.colors.primary,
      },
      {
        label: 'Available',
        data: zones.map(z => z.capacity - z.occupied),
        backgroundColor: '#E5E7EB',
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
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor zones, inventory, and warehouse operations
          </p>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Utilization Rate"
            value={`${utilizationRate}%`}
            subtitle={`${totalOccupied.toLocaleString()} / ${totalCapacity.toLocaleString()}`}
            icon={CubeIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Active Zones"
            value={zones.length}
            subtitle={`${criticalZones} critical alerts`}
            icon={BuildingOffice2Icon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Low Stock Items"
            value={lowStockItems}
            subtitle="Below reorder level"
            icon={ExclamationTriangleIcon}
            gradient="from-red-500 to-orange-500"
          />
          <AdvancedStatCard
            title="Total SKUs"
            value={inventory.length}
            subtitle="Unique products"
            icon={ChartBarIcon}
            gradient="from-purple-500 to-indigo-500"
          />
        </StatCardsGrid>

        {/* Alerts */}
        {criticalZones > 0 && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Critical Zones Alert</h3>
                <p className="text-sm text-red-700">
                  {criticalZones} zone(s) require immediate attention - capacity exceeded
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Capacity Chart */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Zone Capacity Overview</h2>
          <div className="h-64">
            <Bar data={capacityData} options={chartOptions} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'zones', label: 'Warehouse Zones', count: zones.length },
            { id: 'inventory', label: 'Inventory', count: inventory.length },
            { id: 'movements', label: 'Movements' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600'
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
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600" />
              )}
            </button>
          ))}
        </div>

        {/* Zones Tab */}
        {activeTab === 'zones' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <AdvancedDataTable
              data={zones}
              columns={zoneColumns}
              searchPlaceholder="Search zones..."
            />
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <AdvancedDataTable
              data={inventory}
              columns={inventoryColumns}
              searchPlaceholder="Search inventory..."
            />
          </div>
        )}

        {/* Movements Tab */}
        {activeTab === 'movements' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="text-center py-12">
              <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Stock Movements</h3>
              <p className="mt-2 text-sm text-gray-500">
                Track incoming and outgoing inventory movements
              </p>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
