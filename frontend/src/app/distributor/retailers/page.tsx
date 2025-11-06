'use client';

import React from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import { UserGroupIcon, CurrencyDollarIcon, TruckIcon, StarIcon } from '@heroicons/react/24/outline';

interface Retailer {
  id: string;
  name: string;
  location: string;
  orders: number;
  revenue: number;
  rating: number;
  status: 'Active' | 'Inactive';
}

export default function RetailerNetworkPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const user = { name: 'Account Manager', email: 'accounts@distribution.com' };

  const retailers: Retailer[] = [
    { id: 'RET-001', name: 'Fresh Market Store', location: 'Downtown', orders: 145, revenue: 125400, rating: 4.8, status: 'Active' },
    { id: 'RET-002', name: 'Green Grocers', location: 'West Side', orders: 98, revenue: 89200, rating: 4.5, status: 'Active' },
    { id: 'RET-003', name: 'Organic Foods Co.', location: 'East District', orders: 112, revenue: 102600, rating: 4.7, status: 'Active' },
  ];

  const columns: Column<Retailer>[] = [
    { key: 'name', label: 'Retailer', sortable: true, render: (r) => <div><div className="font-semibold text-gray-900">{r.name}</div><div className="text-xs text-gray-500">{r.id}</div></div> },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'orders', label: 'Orders', sortable: true, render: (r) => <span className="text-gray-700">{r.orders}</span> },
    { key: 'revenue', label: 'Revenue', sortable: true, render: (r) => <span className="font-semibold text-green-600">${r.revenue.toLocaleString()}</span> },
    { key: 'rating', label: 'Rating', sortable: true, render: (r) => <div className="flex items-center gap-1"><StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-semibold">{r.rating}</span></div> },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${r.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{r.status}</span> },
  ];

  const totalRevenue = retailers.reduce((sum, r) => sum + r.revenue, 0);
  const avgRating = (retailers.reduce((sum, r) => sum + r.rating, 0) / retailers.length).toFixed(1);

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Retailer Network</h1>
        <StatCardsGrid>
          <AdvancedStatCard title="Total Retailers" value={retailers.length} subtitle="Active partners" icon={UserGroupIcon} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} subtitle="This month" icon={CurrencyDollarIcon} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="Total Orders" value={retailers.reduce((sum, r) => sum + r.orders, 0)} subtitle="This month" icon={TruckIcon} gradient="from-purple-500 to-indigo-500" />
          <AdvancedStatCard title="Avg Rating" value={avgRating} subtitle="Network satisfaction" icon={StarIcon} gradient="from-amber-500 to-orange-500" />
        </StatCardsGrid>
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <AdvancedDataTable data={retailers} columns={columns} searchPlaceholder="Search retailers..." />
        </div>
      </div>
    </RoleBasedLayout>
  );
}
