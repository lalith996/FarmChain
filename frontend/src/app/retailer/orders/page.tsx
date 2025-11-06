'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  ShoppingBagIcon,
  CheckCircleIcon,
  TruckIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  PrinterIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
}

export default function RetailerOrdersPage() {
  const theme = getRoleTheme('RETAILER');
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  // Mock orders data
  const orders: Order[] = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      items: 5,
      total: 145.00,
      status: 'delivered',
      date: '2025-11-06',
      paymentStatus: 'paid',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      items: 3,
      total: 89.50,
      status: 'processing',
      date: '2025-11-06',
      paymentStatus: 'paid',
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      items: 8,
      total: 234.00,
      status: 'shipped',
      date: '2025-11-05',
      paymentStatus: 'paid',
    },
    {
      id: 'ORD-004',
      customer: 'Sarah Wilson',
      items: 2,
      total: 56.00,
      status: 'pending',
      date: '2025-11-06',
      paymentStatus: 'pending',
    },
    {
      id: 'ORD-005',
      customer: 'David Brown',
      items: 6,
      total: 178.50,
      status: 'delivered',
      date: '2025-11-04',
      paymentStatus: 'paid',
    },
    {
      id: 'ORD-006',
      customer: 'Emily Davis',
      items: 4,
      total: 112.00,
      status: 'processing',
      date: '2025-11-06',
      paymentStatus: 'paid',
    },
    {
      id: 'ORD-007',
      customer: 'Robert Taylor',
      items: 10,
      total: 298.75,
      status: 'shipped',
      date: '2025-11-05',
      paymentStatus: 'paid',
    },
    {
      id: 'ORD-008',
      customer: 'Lisa Anderson',
      items: 3,
      total: 67.25,
      status: 'cancelled',
      date: '2025-11-05',
      paymentStatus: 'failed',
    },
  ];

  const filteredOrders = selectedTab === 'all'
    ? orders
    : orders.filter(o => o.status === selectedTab);

  const columns: Column<Order>[] = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-amber-600">{order.id}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
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
          pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
          processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: ArrowPathIcon },
          shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: TruckIcon },
          delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
          cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon },
        };

        const config = statusConfig[order.status];
        const Icon = config.icon;

        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
            <Icon className="h-4 w-4" />
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (order) => (
        <span className="text-gray-600">{new Date(order.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (order) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
          order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (order) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(order);
            }}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            title="View Details"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Print invoice', order.id);
            }}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            title="Print Invoice"
          >
            <PrinterIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
  ];

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Orders</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track all customer orders from your store
            </p>
          </div>
          <button className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl">
            <ShoppingBagIcon className="mb-1 inline h-5 w-5" /> New Order
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <ShoppingBagIcon className="h-12 w-12 text-amber-500 opacity-20" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <ClockIcon className="h-12 w-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {orders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
              <TruckIcon className="h-12 w-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  selectedTab === tab.id
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Orders Table */}
        <AdvancedDataTable
          data={filteredOrders}
          columns={columns}
          searchPlaceholder="Search by order ID, customer name..."
          onRowClick={(order) => setSelectedOrder(order)}
        />

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Order ID</p>
                    <p className="mt-1 font-semibold text-amber-600">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer</p>
                    <p className="mt-1 font-semibold">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date</p>
                    <p className="mt-1">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      ${selectedOrder.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 font-medium text-gray-900">Order Items</p>
                  <p className="text-gray-600">{selectedOrder.items} items in this order</p>
                  {/* Add item list here */}
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="flex-1 rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600">
                    Update Status
                  </button>
                  <button className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50">
                    Print Invoice
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
