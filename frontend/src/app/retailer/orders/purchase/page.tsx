'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  ShoppingCartIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface PurchaseOrder {
  id: string;
  distributor: string;
  items: number;
  total: number;
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received';
  date: string;
  expectedDelivery: string;
}

export default function PurchaseOrdersPage() {
  const theme = getRoleTheme('RETAILER');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  const purchaseOrders: PurchaseOrder[] = [
    {
      id: 'PO-001',
      distributor: 'Fresh Farms Distributor',
      items: 12,
      total: 1245.00,
      status: 'received',
      date: '2025-11-01',
      expectedDelivery: '2025-11-05',
    },
    {
      id: 'PO-002',
      distributor: 'Organic Valley Supply',
      items: 8,
      total: 890.50,
      status: 'shipped',
      date: '2025-11-03',
      expectedDelivery: '2025-11-07',
    },
    {
      id: 'PO-003',
      distributor: 'Local Harvest Co.',
      items: 15,
      total: 1567.25,
      status: 'confirmed',
      date: '2025-11-04',
      expectedDelivery: '2025-11-08',
    },
    {
      id: 'PO-004',
      distributor: 'Green Field Distributors',
      items: 6,
      total: 445.00,
      status: 'sent',
      date: '2025-11-06',
      expectedDelivery: '2025-11-10',
    },
    {
      id: 'PO-005',
      distributor: 'Farm Fresh Network',
      items: 10,
      total: 1123.75,
      status: 'draft',
      date: '2025-11-06',
      expectedDelivery: '2025-11-12',
    },
  ];

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'id',
      label: 'PO Number',
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-amber-600">{order.id}</span>
      ),
    },
    {
      key: 'distributor',
      label: 'Distributor',
      sortable: true,
    },
    {
      key: 'items',
      label: 'Items',
      sortable: true,
      render: (order) => (
        <span className="text-gray-600">{order.items} items</span>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-gray-900">${order.total.toFixed(2)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (order) => {
        const statusConfig = {
          draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
          sent: { bg: 'bg-blue-100', text: 'text-blue-800' },
          confirmed: { bg: 'bg-purple-100', text: 'text-purple-800' },
          shipped: { bg: 'bg-orange-100', text: 'text-orange-800' },
          received: { bg: 'bg-green-100', text: 'text-green-800' },
        };

        const config = statusConfig[order.status];

        return (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'date',
      label: 'Order Date',
      sortable: true,
      render: (order) => (
        <span className="text-gray-600">{new Date(order.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'expectedDelivery',
      label: 'Expected Delivery',
      sortable: true,
      render: (order) => (
        <span className="text-gray-600">{new Date(order.expectedDelivery).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage orders to distributors and suppliers
            </p>
          </div>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <PlusIcon className="mb-1 inline h-5 w-5" /> New Purchase Order
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{purchaseOrders.length}</p>
              </div>
              <ShoppingCartIcon className="h-12 w-12 text-amber-500 opacity-20" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {purchaseOrders.filter(o => o.status === 'sent' || o.status === 'confirmed').length}
                </p>
              </div>
              <ClockIcon className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {purchaseOrders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
              <TruckIcon className="h-12 w-12 text-orange-500 opacity-20" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Received</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {purchaseOrders.filter(o => o.status === 'received').length}
                </p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Purchase Orders Table */}
        <AdvancedDataTable
          data={purchaseOrders}
          columns={columns}
          searchPlaceholder="Search by PO number, distributor..."
        />

        {/* New Order Modal */}
        {showNewOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create Purchase Order</h2>
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Distributor</label>
                  <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option>Fresh Farms Distributor</option>
                    <option>Organic Valley Supply</option>
                    <option>Local Harvest Co.</option>
                    <option>Green Field Distributors</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Delivery Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Add any special instructions..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewOrderModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600">
                    Create Order
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
