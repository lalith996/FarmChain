'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import { CubeIcon, ExclamationTriangleIcon, BuildingOffice2Icon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface InventoryItem {
  id: string;
  product: string;
  category: string;
  quantity: number;
  reserved: number;
  available: number;
  zone: string;
  reorderLevel: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export default function InventoryManagementPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const [statusFilter, setStatusFilter] = useState<'all' | InventoryItem['status']>('all');
  const user = { name: 'Inventory Manager', email: 'inventory@distribution.com' };

  const inventory: InventoryItem[] = [
    { id: 'INV-001', product: 'Organic Tomatoes', category: 'Vegetables', quantity: 1200, reserved: 450, available: 750, zone: 'ZONE-A1', reorderLevel: 500, status: 'In Stock' },
    { id: 'INV-002', product: 'Fresh Apples', category: 'Fruits', quantity: 380, reserved: 320, available: 60, zone: 'ZONE-A2', reorderLevel: 400, status: 'Low Stock' },
    { id: 'INV-003', product: 'Rice', category: 'Grains', quantity: 3500, reserved: 1200, available: 2300, zone: 'ZONE-B1', reorderLevel: 1000, status: 'In Stock' },
    { id: 'INV-004', product: 'Carrots', category: 'Vegetables', quantity: 0, reserved: 0, available: 0, zone: 'ZONE-A1', reorderLevel: 500, status: 'Out of Stock' },
  ];

  const filteredInventory = statusFilter === 'all' ? inventory : inventory.filter(i => i.status === statusFilter);

  const columns: Column<InventoryItem>[] = [
    { key: 'product', label: 'Product', sortable: true, render: (i) => <div><div className="font-semibold text-gray-900">{i.product}</div><div className="text-xs text-gray-500">{i.category}</div></div> },
    { key: 'zone', label: 'Zone', sortable: true },
    { key: 'quantity', label: 'Total Quantity', sortable: true, render: (i) => <span className="font-semibold text-gray-900">{i.quantity.toLocaleString()}</span> },
    { key: 'reserved', label: 'Reserved', sortable: true, render: (i) => <span className="text-blue-600">{i.reserved.toLocaleString()}</span> },
    { key: 'available', label: 'Available', sortable: true, render: (i) => <span className={`font-semibold ${i.available < i.reorderLevel ? 'text-red-600' : 'text-green-600'}`}>{i.available.toLocaleString()}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (i) => <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${i.status === 'In Stock' ? 'bg-green-100 text-green-800' : i.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{i.status}</span> },
  ];

  const totalItems = inventory.length;
  const lowStock = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
  const totalQuantity = inventory.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>

        <StatCardsGrid>
          <AdvancedStatCard title="Total Items" value={totalItems} subtitle="Unique products" icon={CubeIcon} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="Total Quantity" value={totalQuantity.toLocaleString()} subtitle="Units in warehouse" icon={BuildingOffice2Icon} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="Low Stock Alerts" value={lowStock} subtitle="Need reordering" icon={ExclamationTriangleIcon} gradient="from-red-500 to-orange-500" />
          <AdvancedStatCard title="Reserved" value={inventory.reduce((sum, i) => sum + i.reserved, 0).toLocaleString()} subtitle="Allocated units" icon={ArrowPathIcon} gradient="from-purple-500 to-indigo-500" />
        </StatCardsGrid>

        <div className="flex gap-2">
          {['all', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status as any)} className={`rounded-lg px-4 py-2 text-sm font-medium ${statusFilter === status ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-white text-gray-700'}`}>
              {status === 'all' ? 'All Items' : status}
              {status !== 'all' && <span className="ml-2 rounded-full bg-white bg-opacity-30 px-2 py-0.5 text-xs">{inventory.filter(i => i.status === status).length}</span>}
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <AdvancedDataTable data={filteredInventory} columns={columns} searchPlaceholder="Search inventory..." />
        </div>
      </div>
    </RoleBasedLayout>
  );
}
