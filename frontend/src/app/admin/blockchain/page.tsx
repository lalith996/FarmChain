'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import toast from 'react-hot-toast';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface BlockchainTx {
  _id: string;
  txHash: string;
  type: string;
  from: string;
  to: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
}

export default function AdminBlockchainPage() {
  const [transactions, setTransactions] = useState<BlockchainTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const mockTxs: BlockchainTx[] = [
        {
          _id: '1',
          txHash: '0xabcd...efgh',
          type: 'Product Registration',
          from: '0x1234...5678',
          to: '0x8765...4321',
          amount: 0,
          status: 'confirmed',
          timestamp: new Date().toISOString(),
        },
        {
          _id: '2',
          txHash: '0xijkl...mnop',
          type: 'Payment',
          from: '0x2345...6789',
          to: '0x9876...5432',
          amount: 5000,
          status: 'confirmed',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      setTransactions(mockTxs);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      confirmed: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center space-x-1"><CheckCircleIcon className="h-3 w-3" /><span>Confirmed</span></span>,
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center space-x-1"><ClockIcon className="h-3 w-3" /><span>Pending</span></span>,
      failed: <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center space-x-1"><XCircleIcon className="h-3 w-3" /><span>Failed</span></span>,
    };
    return badges[status];
  };

  const columns = [
    { key: 'txHash', label: 'Transaction Hash', render: (tx: BlockchainTx) => <span className="font-mono text-xs text-blue-600">{tx.txHash}</span> },
    { key: 'type', label: 'Type', render: (tx: BlockchainTx) => <span className="font-medium text-gray-900">{tx.type}</span> },
    { key: 'from', label: 'From', render: (tx: BlockchainTx) => <span className="font-mono text-xs text-gray-600">{tx.from}</span> },
    { key: 'to', label: 'To', render: (tx: BlockchainTx) => <span className="font-mono text-xs text-gray-600">{tx.to}</span> },
    { key: 'amount', label: 'Amount', render: (tx: BlockchainTx) => tx.amount > 0 ? <span className="font-semibold text-green-600">{tx.amount} MATIC</span> : '-' },
    { key: 'status', label: 'Status', render: (tx: BlockchainTx) => getStatusBadge(tx.status) },
    { key: 'timestamp', label: 'Time', render: (tx: BlockchainTx) => <span className="text-sm text-gray-600">{new Date(tx.timestamp).toLocaleString()}</span> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Blockchain Monitoring" description="Monitor all blockchain transactions" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{transactions.filter(t => t.status === 'confirmed').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{transactions.filter(t => t.status === 'pending').length}</p>
          </div>
        </div>

        <DataTable columns={columns} data={transactions} loading={loading} emptyMessage="No transactions found" />
      </div>
    </div>
  );
}
