'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatCard } from '@/components/shared/StatCard';
import toast from 'react-hot-toast';
import { CurrencyDollarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const mockPayments: Payment[] = [
        { _id: '1', orderId: 'ORD-12345', amount: 6000, status: 'completed', method: 'Crypto', createdAt: new Date().toISOString() },
        { _id: '2', orderId: 'ORD-12346', amount: 4500, status: 'pending', method: 'Crypto', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ];
      setPayments(mockPayments);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      completed: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>,
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>,
      failed: <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Failed</span>,
    };
    return badges[status];
  };

  const columns = [
    { key: 'orderId', label: 'Order ID', render: (p: Payment) => <span className="font-mono text-sm text-blue-600">{p.orderId}</span> },
    { key: 'amount', label: 'Amount', render: (p: Payment) => <span className="font-semibold text-green-600">₹{p.amount}</span> },
    { key: 'method', label: 'Method', render: (p: Payment) => <span className="text-gray-700">{p.method}</span> },
    { key: 'status', label: 'Status', render: (p: Payment) => getStatusBadge(p.status) },
    { key: 'createdAt', label: 'Date', render: (p: Payment) => <span className="text-sm text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</span> },
  ];

  const stats = {
    totalPayments: payments.reduce((sum, p) => sum + p.amount, 0),
    completedPayments: payments.filter(p => p.status === 'completed').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Payment Management" description="Monitor and manage all payments" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Payments" value={`₹${stats.totalPayments.toLocaleString()}`} icon={<CurrencyDollarIcon className="h-6 w-6" />} color="green" />
          <StatCard title="Completed" value={stats.completedPayments} icon={<CheckCircleIcon className="h-6 w-6" />} color="blue" />
          <StatCard title="Pending" value={stats.pendingPayments} icon={<ClockIcon className="h-6 w-6" />} color="yellow" />
        </div>

        <DataTable columns={columns} data={payments} loading={loading} emptyMessage="No payments found" />
      </div>
    </div>
  );
}
