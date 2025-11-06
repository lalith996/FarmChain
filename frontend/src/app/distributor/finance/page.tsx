'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import { CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';

interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export default function FinancialManagementPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const user = { name: 'Finance Manager', email: 'finance@distribution.com' };

  const transactions: Transaction[] = [
    { id: 'TXN-1001', type: 'Income', category: 'Delivery Revenue', amount: 15420, date: '2025-11-06', description: 'Deliveries completed' },
    { id: 'TXN-1002', type: 'Expense', category: 'Fuel Costs', amount: 3250, date: '2025-11-06', description: 'Fleet fuel expenses' },
    { id: 'TXN-1003', type: 'Expense', category: 'Maintenance', amount: 1800, date: '2025-11-05', description: 'Vehicle maintenance' },
    { id: 'TXN-1004', type: 'Income', category: 'Delivery Revenue', amount: 18900, date: '2025-11-05', description: 'Deliveries completed' },
  ];

  const columns: Column<Transaction>[] = [
    { key: 'id', label: 'Transaction ID', sortable: true, render: (t) => <span className="font-semibold text-blue-600">{t.id}</span> },
    { key: 'type', label: 'Type', sortable: true, render: (t) => <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${t.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.type}</span> },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (t) => <span className={`font-semibold ${t.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}</span> },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'description', label: 'Description', render: (t) => <span className="text-sm text-gray-600">{t.description}</span> },
  ];

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(1);

  const revenueData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Revenue', data: [15200, 18400, 16800, 21000, 19500, 24500, 22000], borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}40`, fill: true, tension: 0.4 },
      { label: 'Expenses', data: [5200, 6100, 5800, 7200, 6500, 7800, 7000], borderColor: '#EF4444', backgroundColor: '#EF444440', fill: true, tension: 0.4 },
    ],
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' as const } } };

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>

        <StatCardsGrid>
          <AdvancedStatCard title="Total Revenue" value={`$${totalIncome.toLocaleString()}`} subtitle="This period" icon={CurrencyDollarIcon} trend={{ direction: 'up', value: '15%', label: 'vs last period' }} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} subtitle="This period" icon={ArrowTrendingDownIcon} gradient="from-red-500 to-orange-500" />
          <AdvancedStatCard title="Net Profit" value={`$${netProfit.toLocaleString()}`} subtitle="This period" icon={ArrowTrendingUpIcon} trend={{ direction: 'up', value: '12%', label: 'vs last period' }} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="Profit Margin" value={`${profitMargin}%`} subtitle="Efficiency ratio" icon={ChartBarIcon} gradient="from-purple-500 to-indigo-500" />
        </StatCardsGrid>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Revenue vs Expenses (Last 7 Days)</h2>
          <div className="h-64"><Line data={revenueData} options={chartOptions} /></div>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          {[{ id: 'overview', label: 'Overview' }, { id: 'transactions', label: 'Transactions', count: transactions.length }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`relative px-6 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'}`}>
              {tab.label}
              {tab.count && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600" />}
            </button>
          ))}
        </div>

        {activeTab === 'transactions' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <AdvancedDataTable data={transactions} columns={columns} searchPlaceholder="Search transactions..." />
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
