'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  retailer: string;
  items: number;
  weight: number;
  status: 'Pending' | 'Confirmed' | 'Loading' | 'In Transit' | 'Delivered' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  orderDate: string;
  deliveryDate: string;
  assignedVehicle?: string;
  value: number;
}

export default function OrdersShipmentsPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');

  const user = {
    name: 'Operations Manager',
    email: 'ops@distribution.com',
  };

  const orders: Order[] = [
    {
      id: 'ORD-5678',
      retailer: 'Fresh Market Store',
      items: 45,
      weight: 850,
      status: 'In Transit',
      priority: 'High',
      orderDate: '2025-11-06 08:00',
      deliveryDate: '2025-11-06 14:00',
      assignedVehicle: 'TRK-101',
      value: 4250,
    },
    {
      id: 'ORD-5677',
      retailer: 'Green Grocers',
      items: 32,
      weight: 620,
      status: 'Loading',
      priority: 'Medium',
      orderDate: '2025-11-06 09:30',
      deliveryDate: '2025-11-06 16:00',
      assignedVehicle: 'TRK-102',
      value: 2980,
    },
    {
      id: 'ORD-5676',
      retailer: 'Organic Foods Co.',
      items: 28,
      weight: 540,
      status: 'Delivered',
      priority: 'Low',
      orderDate: '2025-11-05 10:00',
      deliveryDate: '2025-11-05 15:00',
      assignedVehicle: 'TRK-103',
      value: 3450,
    },
    {
      id: 'ORD-5675',
      retailer: 'City Market',
      items: 51,
      weight: 920,
      status: 'Pending',
      priority: 'Urgent',
      orderDate: '2025-11-06 11:00',
      deliveryDate: '2025-11-06 18:00',
      value: 5670,
    },
  ];

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  const columns: Column<Order>[] = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-blue-600">{order.id}</span>
      ),
    },
    {
      key: 'retailer',
      label: 'Retailer',
      sortable: true,
    },
    {
      key: 'items',
      label: 'Items',
      sortable: true,
      render: (order) => (
        <span className="text-gray-700">{order.items} items ({order.weight}kg)</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (order) => {
        const statusColors = {
          'Pending': 'bg-gray-100 text-gray-800',
          'Confirmed': 'bg-blue-100 text-blue-800',
          'Loading': 'bg-yellow-100 text-yellow-800',
          'In Transit': 'bg-purple-100 text-purple-800',
          'Delivered': 'bg-green-100 text-green-800',
          'Cancelled': 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[order.status]}`}>
            {order.status}
          </span>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (order) => {
        const priorityColors = {
          'Low': 'bg-gray-100 text-gray-800',
          'Medium': 'bg-blue-100 text-blue-800',
          'High': 'bg-orange-100 text-orange-800',
          'Urgent': 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${priorityColors[order.priority]}`}>
            {order.priority}
          </span>
        );
      },
    },
    {
      key: 'assignedVehicle',
      label: 'Vehicle',
      render: (order) => (
        <span className="text-sm text-gray-700">{order.assignedVehicle || 'Unassigned'}</span>
      ),
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-green-600">${order.value.toLocaleString()}</span>
      ),
    },
    {
      key: 'deliveryDate',
      label: 'Delivery Time',
      sortable: true,
      render: (order) => (
        <span className="text-sm text-gray-600">{order.deliveryDate}</span>
      ),
    },
  ];

  const totalOrders = orders.length;
  const inTransit = orders.filter(o => o.status === 'In Transit').length;
  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const pending = orders.filter(o => o.status === 'Pending').length;
  const totalValue = orders.reduce((sum, o) => sum + o.value, 0);

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders & Shipments</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage delivery orders and track shipments
            </p>
          </div>
          <button className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl">
            <PlusIcon className="mb-1 inline h-5 w-5" /> New Order
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Orders"
            value={totalOrders}
            subtitle="Today"
            icon={TruckIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="In Transit"
            value={inTransit}
            subtitle="Active deliveries"
            icon={ClockIcon}
            gradient="from-purple-500 to-indigo-500"
          />
          <AdvancedStatCard
            title="Delivered"
            value={delivered}
            subtitle="Completed today"
            icon={CheckCircleIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Total Value"
            value={`$${totalValue.toLocaleString()}`}
            subtitle="Today's orders"
            icon={TruckIcon}
            gradient="from-amber-500 to-orange-500"
          />
        </StatCardsGrid>

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'Pending', 'Loading', 'In Transit', 'Delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All Orders' : status}
              {status !== 'all' && (
                <span className="ml-2 rounded-full bg-white bg-opacity-30 px-2 py-0.5 text-xs">
                  {orders.filter(o => o.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <AdvancedDataTable
            data={filteredOrders}
            columns={columns}
            searchPlaceholder="Search by order ID, retailer..."
          />
        </div>
      </div>
    </RoleBasedLayout>
  );
}
