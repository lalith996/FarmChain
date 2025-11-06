'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import { BanknotesIcon, ArrowTrendingUpIcon, ChartBarIcon, ShoppingCartIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  type: 'Income' | 'Expense';
  amount: number;
}

export default function FinancePage() {
  const theme = getRoleTheme('FARMER');
  const user = { name: 'John Farmer', email: 'john.farmer@example.com' };
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'transactions' | 'projections'>('overview');

  const transactions: Transaction[] = [
    { id: 'TXN-001', date: '2025-11-05', category: 'Harvest Sales', description: 'Organic tomatoes sold to distributor', type: 'Income', amount: 15000 },
    { id: 'TXN-002', date: '2025-11-04', category: 'Equipment', description: 'Tractor maintenance', type: 'Expense', amount: 350 },
    { id: 'TXN-003', date: '2025-11-03', category: 'Supplies', description: 'Fertilizer purchase', type: 'Expense', amount: 1200 },
    { id: 'TXN-004', date: '2025-11-01', category: 'Harvest Sales', description: 'Lettuce sold to retailer', type: 'Income', amount: 8500 },
    { id: 'TXN-005', date: '2025-10-30', category: 'Labor', description: 'Seasonal worker wages', type: 'Expense', amount: 2400 },
    { id: 'TXN-006', date: '2025-10-28', category: 'Utilities', description: 'Irrigation water bill', type: 'Expense', amount: 680 },
  ];

  const columns: Column<Transaction>[] = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (t) => (
        <span className={`font-semibold ${t.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
          {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (t) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
          t.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {t.type}
        </span>
      ),
    },
  ];

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(1);

  const cashFlowData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Income',
        data: [12000, 15000, 28000, 32000, 45000, 52000, 48000, 55000, 38000, 42000, 35000, 30000],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: [8000, 9500, 11000, 12000, 15000, 18000, 17000, 19000, 14000, 16000, 13000, 12000],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const expenseBreakdownData = {
    labels: ['Labor', 'Equipment', 'Supplies', 'Utilities', 'Other'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(156, 163, 175, 0.5)',
      ],
    }],
  };

  const budgetData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: 'Budget', data: [50000, 70000, 65000, 55000], backgroundColor: 'rgba(156, 163, 175, 0.5)' },
      { label: 'Actual', data: [55000, 145000, 135000, 65000], backgroundColor: 'rgba(16, 185, 129, 0.8)' },
    ],
  };

  return (
    <RoleBasedLayout role="FARMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Planning & Analysis</h1>

        <StatCardsGrid>
          <AdvancedStatCard title="Total Income" value={`$${(totalIncome / 1000).toFixed(0)}K`} subtitle="Year to date" icon={BanknotesIcon} gradient={theme.gradients.primary} />
          <AdvancedStatCard title="Total Expenses" value={`$${(totalExpenses / 1000).toFixed(0)}K`} subtitle="Operating costs" icon={ShoppingCartIcon} gradient="from-red-500 to-rose-500" />
          <AdvancedStatCard title="Net Profit" value={`$${(netProfit / 1000).toFixed(0)}K`} subtitle={`${profitMargin}% margin`} icon={ArrowTrendingUpIcon} gradient="from-green-500 to-emerald-500" />
          <AdvancedStatCard title="ROI" value="23%" subtitle="Return on investment" icon={ChartBarIcon} gradient="from-blue-500 to-cyan-500" />
        </StatCardsGrid>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Financial Overview' },
            { id: 'budget', label: 'Budget Planning' },
            { id: 'transactions', label: 'Transactions', count: transactions.length },
            { id: 'projections', label: 'Projections' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-600'}`}
            >
              {tab.label}
              {tab.count && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-600" />}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Cash Flow Analysis</h2>
              <Line data={cashFlowData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Expense Breakdown</h2>
                <Doughnut data={expenseBreakdownData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>

              <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">💰 Financial Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-600">Revenue Growth</span><span className="font-bold text-green-600">+18%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Cost Efficiency</span><span className="font-bold text-green-600">92%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Profit Margin</span><span className="font-bold text-emerald-600">{profitMargin}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Cash Reserve</span><span className="font-bold text-blue-600">$45K</span></div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'budget' && (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Budget vs Actual Performance</h2>
              <Bar data={budgetData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Annual Budget</h3>
                <div className="text-3xl font-bold text-gray-900">$240K</div>
                <div className="text-sm text-gray-500 mt-1">Planned for 2025</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Actual Spending</h3>
                <div className="text-3xl font-bold text-green-600">$400K</div>
                <div className="text-sm text-gray-500 mt-1">Exceeding target</div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-sm text-gray-600 mb-2">Variance</h3>
                <div className="text-3xl font-bold text-blue-600">+67%</div>
                <div className="text-sm text-gray-500 mt-1">Above budget</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <AdvancedDataTable data={transactions} columns={columns} searchPlaceholder="Search transactions..." />
          </div>
        )}

        {activeTab === 'projections' && (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">2026 Revenue Projections</h3>
                <div className="space-y-4">
                  <div><span className="text-gray-600">Q1 2026:</span> <span className="font-bold text-emerald-600">$65K</span></div>
                  <div><span className="text-gray-600">Q2 2026:</span> <span className="font-bold text-emerald-600">$95K</span></div>
                  <div><span className="text-gray-600">Q3 2026:</span> <span className="font-bold text-emerald-600">$88K</span></div>
                  <div><span className="text-gray-600">Q4 2026:</span> <span className="font-bold text-emerald-600">$72K</span></div>
                  <div className="pt-3 border-t border-gray-200"><span className="text-gray-600">Total 2026:</span> <span className="font-bold text-lg text-emerald-600">$320K</span></div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">📈 Growth Strategy</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Expand organic certification to 3 more fields</li>
                  <li>• Invest in drip irrigation for water savings</li>
                  <li>• Diversify crop varieties for market demand</li>
                  <li>• Establish direct-to-consumer sales channel</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </RoleBasedLayout>
  );
}
