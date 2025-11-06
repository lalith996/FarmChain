'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  CreditCardIcon,
  BanknotesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ReceiptRefundIcon,
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';

interface Transaction {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  method: 'Credit Card' | 'Debit Card' | 'PayPal' | 'Cash' | 'Crypto';
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
  fee: number;
  net: number;
}

interface Refund {
  id: string;
  transactionId: string;
  orderId: string;
  customer: string;
  amount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processed';
  date: string;
}

export default function RetailerPaymentsPage() {
  const theme = getRoleTheme('RETAILER');
  const [activeTab, setActiveTab] = useState<'transactions' | 'refunds' | 'analytics'>('transactions');
  const [selectedMethod, setSelectedMethod] = useState<'all' | 'Credit Card' | 'Debit Card' | 'PayPal' | 'Cash' | 'Crypto'>('all');

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  const transactions: Transaction[] = [
    {
      id: 'TXN-2456',
      orderId: 'ORD-1234',
      customer: 'John Doe',
      amount: 124.50,
      method: 'Credit Card',
      status: 'Completed',
      date: '2025-11-06 14:23',
      fee: 3.62,
      net: 120.88,
    },
    {
      id: 'TXN-2455',
      orderId: 'ORD-1233',
      customer: 'Jane Smith',
      amount: 89.00,
      method: 'PayPal',
      status: 'Completed',
      date: '2025-11-06 13:45',
      fee: 2.67,
      net: 86.33,
    },
    {
      id: 'TXN-2454',
      orderId: 'ORD-1232',
      customer: 'Mike Johnson',
      amount: 56.75,
      method: 'Debit Card',
      status: 'Completed',
      date: '2025-11-06 12:10',
      fee: 1.70,
      net: 55.05,
    },
    {
      id: 'TXN-2453',
      orderId: 'ORD-1231',
      customer: 'Sarah Wilson',
      amount: 234.00,
      method: 'Credit Card',
      status: 'Pending',
      date: '2025-11-06 11:30',
      fee: 6.78,
      net: 227.22,
    },
    {
      id: 'TXN-2452',
      orderId: 'ORD-1230',
      customer: 'Tom Brown',
      amount: 45.50,
      method: 'Cash',
      status: 'Completed',
      date: '2025-11-06 10:15',
      fee: 0,
      net: 45.50,
    },
    {
      id: 'TXN-2451',
      orderId: 'ORD-1229',
      customer: 'Emily Davis',
      amount: 178.90,
      method: 'Crypto',
      status: 'Completed',
      date: '2025-11-06 09:45',
      fee: 1.79,
      net: 177.11,
    },
    {
      id: 'TXN-2450',
      orderId: 'ORD-1228',
      customer: 'David Lee',
      amount: 92.25,
      method: 'Credit Card',
      status: 'Failed',
      date: '2025-11-06 08:20',
      fee: 0,
      net: 0,
    },
    {
      id: 'TXN-2449',
      orderId: 'ORD-1227',
      customer: 'Lisa Anderson',
      amount: 156.00,
      method: 'PayPal',
      status: 'Refunded',
      date: '2025-11-05 16:40',
      fee: -4.68,
      net: 0,
    },
  ];

  const refunds: Refund[] = [
    {
      id: 'REF-101',
      transactionId: 'TXN-2449',
      orderId: 'ORD-1227',
      customer: 'Lisa Anderson',
      amount: 156.00,
      reason: 'Product damaged during shipping',
      status: 'Processed',
      date: '2025-11-05 18:30',
    },
    {
      id: 'REF-102',
      transactionId: 'TXN-2401',
      orderId: 'ORD-1180',
      customer: 'Mark Taylor',
      amount: 89.50,
      reason: 'Customer changed mind',
      status: 'Approved',
      date: '2025-11-05 14:20',
    },
    {
      id: 'REF-103',
      transactionId: 'TXN-2398',
      orderId: 'ORD-1177',
      customer: 'Anna White',
      amount: 45.00,
      reason: 'Wrong item received',
      status: 'Pending',
      date: '2025-11-06 10:15',
    },
  ];

  const filteredTransactions = selectedMethod === 'all'
    ? transactions
    : transactions.filter(t => t.method === selectedMethod);

  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'id',
      label: 'Transaction ID',
      sortable: true,
      render: (txn) => (
        <div>
          <div className="font-semibold text-amber-600">{txn.id}</div>
          <div className="text-xs text-gray-500">{txn.orderId}</div>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (txn) => (
        <span className="font-semibold text-gray-900">${txn.amount.toFixed(2)}</span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      sortable: true,
      render: (txn) => {
        const methodColors = {
          'Credit Card': 'bg-blue-100 text-blue-800',
          'Debit Card': 'bg-green-100 text-green-800',
          'PayPal': 'bg-purple-100 text-purple-800',
          'Cash': 'bg-gray-100 text-gray-800',
          'Crypto': 'bg-orange-100 text-orange-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${methodColors[txn.method]}`}>
            {txn.method}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (txn) => {
        const statusConfig = {
          Completed: { color: 'text-green-800', bg: 'bg-green-100', icon: CheckCircleIcon },
          Pending: { color: 'text-yellow-800', bg: 'bg-yellow-100', icon: ClockIcon },
          Failed: { color: 'text-red-800', bg: 'bg-red-100', icon: XCircleIcon },
          Refunded: { color: 'text-gray-800', bg: 'bg-gray-100', icon: ArrowPathIcon },
        };
        const config = statusConfig[txn.status];
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
            <Icon className="h-3 w-3" />
            {txn.status}
          </span>
        );
      },
    },
    {
      key: 'fee',
      label: 'Fee',
      sortable: true,
      render: (txn) => (
        <span className="text-gray-600">${Math.abs(txn.fee).toFixed(2)}</span>
      ),
    },
    {
      key: 'net',
      label: 'Net',
      sortable: true,
      render: (txn) => (
        <span className="font-semibold text-green-600">${txn.net.toFixed(2)}</span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (txn) => (
        <span className="text-sm text-gray-700">{txn.date}</span>
      ),
    },
  ];

  const refundColumns: Column<Refund>[] = [
    {
      key: 'id',
      label: 'Refund ID',
      sortable: true,
      render: (ref) => (
        <div>
          <div className="font-semibold text-amber-600">{ref.id}</div>
          <div className="text-xs text-gray-500">{ref.transactionId}</div>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (ref) => (
        <span className="font-semibold text-red-600">-${ref.amount.toFixed(2)}</span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (ref) => (
        <span className="text-sm text-gray-700">{ref.reason}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (ref) => {
        const statusColors = {
          Pending: 'bg-yellow-100 text-yellow-800',
          Approved: 'bg-blue-100 text-blue-800',
          Rejected: 'bg-red-100 text-red-800',
          Processed: 'bg-green-100 text-green-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[ref.status]}`}>
            {ref.status}
          </span>
        );
      },
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (ref) => (
        <span className="text-sm text-gray-700">{ref.date}</span>
      ),
    },
  ];

  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === 'Completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = completedTransactions.reduce((sum, t) => sum + t.fee, 0);
  const netRevenue = completedTransactions.reduce((sum, t) => sum + t.net, 0);
  const pendingAmount = transactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);

  const paymentTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue',
        data: [3200, 4100, 3800, 5200, 4900, 6800, 5600],
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}40`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track transactions, process refunds, and manage payments
            </p>
          </div>
          <button className="rounded-lg border-2 border-amber-500 px-6 py-3 font-semibold text-amber-600 transition-colors hover:bg-amber-50">
            Export Report
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            subtitle="Today"
            icon={BanknotesIcon}
            trend={{ direction: 'up', value: '12%', label: 'vs yesterday' }}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Net Revenue"
            value={`$${netRevenue.toFixed(2)}`}
            subtitle="After fees"
            icon={ChartBarIcon}
            trend={{ direction: 'up', value: '11%', label: 'vs yesterday' }}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Pending"
            value={`$${pendingAmount.toFixed(2)}`}
            subtitle={`${transactions.filter(t => t.status === 'Pending').length} transactions`}
            icon={ClockIcon}
            gradient="from-yellow-500 to-orange-500"
          />
          <AdvancedStatCard
            title="Processing Fees"
            value={`$${totalFees.toFixed(2)}`}
            subtitle={`${((totalFees / totalRevenue) * 100).toFixed(2)}% of revenue`}
            icon={CreditCardIcon}
            gradient="from-blue-500 to-indigo-500"
          />
        </StatCardsGrid>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'transactions', label: 'Transactions', count: transactions.length },
            { id: 'refunds', label: 'Refunds', count: refunds.length },
            { id: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-amber-600'
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
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              )}
            </button>
          ))}
        </div>

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Method Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'Credit Card', 'Debit Card', 'PayPal', 'Cash', 'Crypto'].map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method as any)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedMethod === method
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {method === 'all' ? 'All Methods' : method}
                  {method !== 'all' && (
                    <span className="ml-2 rounded-full bg-white bg-opacity-30 px-2 py-0.5 text-xs">
                      {transactions.filter(t => t.method === method).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Transactions Table */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <AdvancedDataTable
                data={filteredTransactions}
                columns={transactionColumns}
                searchPlaceholder="Search by transaction ID, customer..."
              />
            </div>
          </div>
        )}

        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <div className="flex items-center gap-3">
                <ReceiptRefundIcon className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Pending Refunds</h3>
                  <p className="text-sm text-yellow-700">
                    {refunds.filter(r => r.status === 'Pending').length} refund requests require your attention
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
              <AdvancedDataTable
                data={refunds}
                columns={refundColumns}
                searchPlaceholder="Search refunds by ID, customer..."
              />
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Payment Trend Chart */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Trend (Last 7 Days)</h2>
              <div className="h-64">
                <Line data={paymentTrendData} options={chartOptions} />
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Methods Breakdown</h2>
              <div className="space-y-3">
                {[
                  { method: 'Credit Card', count: 3, amount: 450.75, color: 'bg-blue-500' },
                  { method: 'PayPal', count: 2, amount: 245.00, color: 'bg-purple-500' },
                  { method: 'Debit Card', count: 1, amount: 56.75, color: 'bg-green-500' },
                  { method: 'Cash', count: 1, amount: 45.50, color: 'bg-gray-500' },
                  { method: 'Crypto', count: 1, amount: 178.90, color: 'bg-orange-500' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium text-gray-900">{item.method}</span>
                        <span className="text-sm text-gray-600">
                          {item.count} transactions · ${item.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${(item.amount / totalRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Rate */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                      {((completedTransactions.length / totalTransactions) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <CheckCircleIcon className="h-12 w-12 text-green-500 opacity-20" />
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed Rate</p>
                    <p className="mt-2 text-3xl font-bold text-red-600">
                      {((transactions.filter(t => t.status === 'Failed').length / totalTransactions) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <XCircleIcon className="h-12 w-12 text-red-500 opacity-20" />
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Refund Rate</p>
                    <p className="mt-2 text-3xl font-bold text-gray-600">
                      {((transactions.filter(t => t.status === 'Refunded').length / totalTransactions) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <ArrowPathIcon className="h-12 w-12 text-gray-500 opacity-20" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
