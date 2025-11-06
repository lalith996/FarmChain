'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { paymentAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  WalletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  _id: string;
  type: 'send' | 'receive' | 'payment' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  from: string;
  to: string;
  txHash?: string;
  createdAt: string;
  description?: string;
}

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalSent: 0,
    pendingTransactions: 0,
  });

  useEffect(() => {
    if (isConnected) {
      fetchTransactions();
    }
  }, [isConnected]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockTransactions: Transaction[] = [
        {
          _id: '1',
          type: 'receive',
          amount: 1500,
          currency: 'MATIC',
          status: 'completed',
          from: '0x1234...5678',
          to: address || '',
          txHash: '0xabcd...efgh',
          createdAt: new Date().toISOString(),
          description: 'Payment for Order #12345',
        },
        {
          _id: '2',
          type: 'send',
          amount: 500,
          currency: 'MATIC',
          status: 'completed',
          from: address || '',
          to: '0x8765...4321',
          txHash: '0xijkl...mnop',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          description: 'Product purchase',
        },
      ];
      setTransactions(mockTransactions);
      
      // Calculate stats
      const received = mockTransactions
        .filter(t => t.type === 'receive' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const sent = mockTransactions
        .filter(t => t.type === 'send' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const pending = mockTransactions.filter(t => t.status === 'pending').length;
      
      setStats({
        totalReceived: received,
        totalSent: sent,
        pendingTransactions: pending,
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>,
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>,
      failed: <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Failed</span>,
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getTypeIcon = (type: string) => {
    return type === 'receive' || type === 'refund' ? (
      <ArrowDownIcon className="h-5 w-5 text-green-600" />
    ) : (
      <ArrowUpIcon className="h-5 w-5 text-red-600" />
    );
  };

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (tx: Transaction) => (
        <div className="flex items-center space-x-2">
          {getTypeIcon(tx.type)}
          <span className="capitalize">{tx.type}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (tx: Transaction) => (
        <span className={tx.type === 'receive' || tx.type === 'refund' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {tx.type === 'receive' || tx.type === 'refund' ? '+' : '-'}
          {tx.amount} {tx.currency}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (tx: Transaction) => tx.description || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (tx: Transaction) => getStatusBadge(tx.status),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (tx: Transaction) => new Date(tx.createdAt).toLocaleDateString(),
    },
    {
      key: 'txHash',
      label: 'Transaction',
      render: (tx: Transaction) => tx.txHash ? (
        <button
          onClick={() => copyToClipboard(tx.txHash!)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
        >
          <span className="text-xs">{tx.txHash.slice(0, 10)}...</span>
          <DocumentDuplicateIcon className="h-4 w-4" />
        </button>
      ) : '-',
    },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <WalletIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-4">Please connect your wallet to view your balance and transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Wallet"
        description="Manage your crypto wallet and transactions"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Address Card */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm mb-1">Your Wallet Address</p>
              <div className="flex items-center space-x-2">
                <code className="text-lg font-mono">{address?.slice(0, 10)}...{address?.slice(-8)}</code>
                <button
                  onClick={() => copyToClipboard(address || '')}
                  className="p-1 hover:bg-white/20 rounded transition"
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <WalletIcon className="h-12 w-12 text-white/80" />
          </div>
          <div className="border-t border-white/20 pt-4">
            <p className="text-green-100 text-sm mb-1">Current Balance</p>
            <p className="text-4xl font-bold">
              {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} {balance?.symbol || 'MATIC'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Received"
            value={`${stats.totalReceived} MATIC`}
            icon={<ArrowDownIcon className="h-6 w-6" />}
            color="green"
            trend={{ value: '+12%', isPositive: true }}
          />
          <StatCard
            title="Total Sent"
            value={`${stats.totalSent} MATIC`}
            icon={<ArrowUpIcon className="h-6 w-6" />}
            color="red"
          />
          <StatCard
            title="Pending Transactions"
            value={stats.pendingTransactions}
            icon={<ClockIcon className="h-6 w-6" />}
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              <ArrowDownIcon className="h-5 w-5" />
              <span>Receive</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <ArrowUpIcon className="h-5 w-5" />
              <span>Send</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              <WalletIcon className="h-5 w-5" />
              <span>Add Funds</span>
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h3>
          <DataTable
            columns={columns}
            data={transactions}
            loading={loading}
            emptyMessage="No transactions yet"
          />
        </div>
      </div>
    </div>
  );
}
