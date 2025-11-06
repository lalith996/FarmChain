'use client';

import React from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import { UserGroupIcon, ShoppingBagIcon, CurrencyDollarIcon, StarIcon } from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  segment: 'VIP' | 'Regular' | 'New';
  satisfaction: number;
}

export default function RetailerCustomersPage() {
  const theme = getRoleTheme('RETAILER');
  const user = { name: 'Store Manager', email: 'manager@retailstore.com' };

  const customers: Customer[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-0101', orders: 45, totalSpent: 2340.50, lastOrder: '2025-11-05', segment: 'VIP', satisfaction: 4.8 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-0102', orders: 28, totalSpent: 1456.00, lastOrder: '2025-11-04', segment: 'Regular', satisfaction: 4.5 },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '555-0103', orders: 12, totalSpent: 678.25, lastOrder: '2025-11-03', segment: 'Regular', satisfaction: 4.2 },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', phone: '555-0104', orders: 3, totalSpent: 145.00, lastOrder: '2025-11-06', segment: 'New', satisfaction: 5.0 },
  ];

  const columns: Column<Customer>[] = [
    { key: 'name', label: 'Customer', sortable: true, render: (c) => <div><div className="font-semibold">{c.name}</div><div className="text-xs text-gray-500">{c.email}</div></div> },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'orders', label: 'Orders', sortable: true, render: (c) => <span className="font-semibold">{c.orders}</span> },
    { key: 'totalSpent', label: 'Total Spent', sortable: true, render: (c) => <span className="font-semibold text-green-600">${c.totalSpent.toFixed(2)}</span> },
    { key: 'segment', label: 'Segment', render: (c) => <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${c.segment === 'VIP' ? 'bg-purple-100 text-purple-800' : c.segment === 'Regular' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{c.segment}</span> },
    { key: 'satisfaction', label: 'Rating', render: (c) => <div className="flex items-center gap-1"><StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span>{c.satisfaction}</span></div> },
    { key: 'lastOrder', label: 'Last Order', sortable: true, render: (c) => new Date(c.lastOrder).toLocaleDateString() },
  ];

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-gray-900">Customer Management</h1><p className="mt-1 text-sm text-gray-500">Manage your customer relationships and loyalty</p></div>
          <button className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl">Add Customer</button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Customers</p><p className="mt-2 text-3xl font-bold text-gray-900">{customers.length}</p></div><UserGroupIcon className="h-12 w-12 text-amber-500 opacity-20" /></div></div>
          <div className="rounded-lg bg-white p-6 shadow"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">VIP Customers</p><p className="mt-2 text-3xl font-bold text-purple-600">{customers.filter(c => c.segment === 'VIP').length}</p></div><StarIcon className="h-12 w-12 text-purple-500 opacity-20" /></div></div>
          <div className="rounded-lg bg-white p-6 shadow"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Avg Orders</p><p className="mt-2 text-3xl font-bold text-blue-600">{(customers.reduce((sum, c) => sum + c.orders, 0) / customers.length).toFixed(0)}</p></div><ShoppingBagIcon className="h-12 w-12 text-blue-500 opacity-20" /></div></div>
          <div className="rounded-lg bg-white p-6 shadow"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Lifetime Value</p><p className="mt-2 text-3xl font-bold text-green-600">${(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toFixed(0)}</p></div><CurrencyDollarIcon className="h-12 w-12 text-green-500 opacity-20" /></div></div>
        </div>

        <AdvancedDataTable data={customers} columns={columns} searchPlaceholder="Search customers by name, email..." />
      </div>
    </RoleBasedLayout>
  );
}
