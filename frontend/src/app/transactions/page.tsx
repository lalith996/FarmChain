'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { Pagination } from '@/components/shared/Pagination';
import toast from 'react-hot-toast';
import { ArrowUpIcon, ArrowDownIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface Transaction {
  _id: string;
  type: 'payment' | 'refund' | 'withdrawal' | 'deposit';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  from: string;
  to: string;
  txHash?: string;
  description: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockTxs: Transaction[] = [
        {
          _id: '1',
          type: 'payment',
          amount: 5000,
          currency: 'MATIC',
          status: 'completed',
          from: '0x1234...5678',
          to: '0x8765...4321',
          txHash: '0xabcd...efgh',
          description: 'Payment for Order #12345',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          type: 'refund',
          amount: 1500,
          currency: 'MATIC',
          status: 'completed',
          from: '0x8765...4321',
          to: '0x1234...5678',
          txHash: '0xijkl...mnop',
          description: 'Refund for cancelled order',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: '3',
          type: 'withdrawal',
          amount: 10000,
          currency: 'MATIC',
          status: 'pending',
          from: '0x1234...5678',
          to: '0x9999...0000',
          description: 'Withdrawal to external wallet',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      setTransactions(mockTxs);
      setTotalPages(1);
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
    return badges[status as keyof typeof badges];
  };

  const getTypeIcon = (type: string) => {
    return type === 'refund' || type === 'deposit' ? (
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
          <span className="capitalize font-medium">{tx.type}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (tx: Transaction) => <span className="text-gray-700">{tx.description}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (tx: Transaction) => (
        <span className={`font-semibold ${
          tx.type === 'refund' || tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
        }`}>
          {tx.type === 'refund' || tx.type === 'deposit' ? '+' : '-'}
          {tx.amount} {tx.currency}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (tx: Transaction) => getStatusBadge(tx.status),
    },
    {
      key: 'date',
      label: 'Date',
      render: (tx: Transaction) => (
        <span className="text-sm text-gray-600">
          {new Date(tx.createdAt).toLocaleString()}
        </span>
      ),
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

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Transaction History"
        description="View all your blockchain transactions"
        badge={{ text: `${transactions.length} Transactions`, variant: 'info' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={fetchTransactions}
            placeholder="Search by description or transaction hash..."
            filters={[
              {
                label: 'Type',
                value: typeFilter,
                onChange: setTypeFilter,
                options: [
                  { label: 'All Types', value: 'all' },
                  { label: 'Payment', value: 'payment' },
                  { label: 'Refund', value: 'refund' },
                  { label: 'Withdrawal', value: 'withdrawal' },
                  { label: 'Deposit', value: 'deposit' },
                ],
              },
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'All Status', value: 'all' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Failed', value: 'failed' },
                ],
              },
            ]}
          />
        </div>

        {/* Transactions Table */}
        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
          emptyMessage="No transactions found"
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
