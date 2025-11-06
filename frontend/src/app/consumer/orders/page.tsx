'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import { TruckIcon, ClockIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Order {
  id: string;
  date: string;
  items: number;
  total: number;
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled';
  eta?: string;
}

export default function OrdersPage() {
  const theme = getRoleTheme('CONSUMER');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const user = { name: 'John Customer', email: 'john@example.com' };

  const orders: Order[] = [
    { id: 'ORD-1234', date: '2025-11-06', items: 5, total: 45.67, status: 'In Transit', eta: 'Tomorrow' },
    { id: 'ORD-1233', date: '2025-11-05', items: 3, total: 23.45, status: 'Delivered' },
    { id: 'ORD-1232', date: '2025-11-04', items: 7, total: 56.78, status: 'Delivered' },
    { id: 'ORD-1231', date: '2025-11-03', items: 4, total: 34.90, status: 'Processing', eta: '2 days' },
  ];

  const filteredOrders = activeTab === 'all' ? orders :
    activeTab === 'active' ? orders.filter(o => o.status === 'In Transit' || o.status === 'Processing') :
    orders.filter(o => o.status === 'Delivered');

  const columns: Column<Order>[] = [
    { key: 'id', label: 'Order ID', sortable: true, render: (o) => <span className="font-semibold text-purple-600">{o.id}</span> },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'items', label: 'Items', sortable: true, render: (o) => <span>{o.items} items</span> },
    { key: 'total', label: 'Total', sortable: true, render: (o) => <span className="font-semibold text-gray-900">${o.total}</span> },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (o) => {
        const statusConfig = {
          'Delivered': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
          'In Transit': { color: 'bg-blue-100 text-blue-800', icon: TruckIcon },
          'Processing': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
          'Cancelled': { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
        };
        const config = statusConfig[o.status];
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
            <Icon className="h-3 w-3" />
            {o.status}
          </span>
        );
      },
    },
    { key: 'eta', label: 'ETA', render: (o) => <span className="text-sm text-gray-600">{o.eta || '-'}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <button className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700">
          <EyeIcon className="h-4 w-4" /> View
        </button>
      ),
    },
  ];

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'active', label: 'Active', count: orders.filter(o => o.status === 'In Transit' || o.status === 'Processing').length },
            { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'Delivered').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-600'}`}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />}
            </button>
          ))}
        </div>

        {/* Active Order Tracking */}
        {activeTab === 'active' && orders.find(o => o.status === 'In Transit') && (
          <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-6">
            <div className="flex items-center gap-4">
              <TruckIcon className="h-12 w-12 text-purple-600" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Order #ORD-1234 is on the way!</h3>
                <p className="text-sm text-gray-600">Expected delivery: Tomorrow</p>
              </div>
              <button className="rounded-lg bg-purple-500 px-6 py-2 font-semibold text-white hover:bg-purple-600">Track Order</button>
            </div>
            <div className="mt-4 h-2 rounded-full bg-purple-200">
              <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <AdvancedDataTable data={filteredOrders} columns={columns} searchPlaceholder="Search orders..." />
        </div>
      </div>
    </RoleBasedLayout>
  );
}
