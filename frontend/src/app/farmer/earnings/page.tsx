'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import toast from 'react-hot-toast';
import { CurrencyDollarIcon, ArrowTrendingUpIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Earning {
  _id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'completed' | 'withdrawn';
  date: string;
}

export default function FarmerEarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 125000,
    availableBalance: 45000,
    pendingPayments: 15000,
    withdrawn: 65000,
  });

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const mockEarnings: Earning[] = [
        { _id: '1', orderId: 'ORD-12345', amount: 6000, status: 'completed', date: new Date().toISOString() },
        { _id: '2', orderId: 'ORD-12346', amount: 4500, status: 'pending', date: new Date(Date.now() - 86400000).toISOString() },
        { _id: '3', orderId: 'ORD-12347', amount: 8000, status: 'withdrawn', date: new Date(Date.now() - 172800000).toISOString() },
      ];
      setEarnings(mockEarnings);
    } catch (error) {
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = () => {
    toast.success('Withdrawal request submitted');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>,
      completed: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>,
      withdrawn: <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Withdrawn</span>,
    };
    return badges[status];
  };

  const columns = [
    { key: 'orderId', label: 'Order ID', render: (e: Earning) => <span className="font-mono text-sm">{e.orderId}</span> },
    { key: 'amount', label: 'Amount', render: (e: Earning) => <span className="font-semibold text-green-600">₹{e.amount}</span> },
    { key: 'status', label: 'Status', render: (e: Earning) => getStatusBadge(e.status) },
    { key: 'date', label: 'Date', render: (e: Earning) => <span className="text-sm text-gray-600">{new Date(e.date).toLocaleDateString()}</span> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Financial Dashboard" description="Track your earnings and manage withdrawals" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Earnings" value={`₹${stats.totalEarnings.toLocaleString()}`} icon={<CurrencyDollarIcon className="h-6 w-6" />} color="green" trend={{ value: '+15%', isPositive: true }} />
          <StatCard title="Available Balance" value={`₹${stats.availableBalance.toLocaleString()}`} icon={<BanknotesIcon className="h-6 w-6" />} color="blue" />
          <StatCard title="Pending Payments" value={`₹${stats.pendingPayments.toLocaleString()}`} icon={<ClockIcon className="h-6 w-6" />} color="yellow" />
          <StatCard title="Total Withdrawn" value={`₹${stats.withdrawn.toLocaleString()}`} icon={<ArrowTrendingUpIcon className="h-6 w-6" />} color="purple" />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Available for Withdrawal</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">₹{stats.availableBalance.toLocaleString()}</p>
            </div>
            <button onClick={handleWithdraw} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
              Withdraw Funds
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
          <DataTable columns={columns} data={earnings} loading={loading} emptyMessage="No earnings yet" />
        </div>
      </div>
    </div>
  );
}
