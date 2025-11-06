'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Dispute {
  _id: string;
  orderId: string;
  buyer: string;
  seller: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDisputes();
  }, [page, statusFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const mockDisputes: Dispute[] = [
        {
          _id: '1',
          orderId: 'ORD-12345',
          buyer: 'Amit Patel',
          seller: 'Rajesh Kumar',
          title: 'Product quality issue',
          priority: 'high',
          status: 'open',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          orderId: 'ORD-12346',
          buyer: 'Priya Sharma',
          seller: 'Sneha Reddy',
          title: 'Delayed delivery',
          priority: 'medium',
          status: 'in_progress',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setDisputes(mockDisputes);
      setTotalPages(1);
    } catch (error) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async (disputeId: string, resolution: string) => {
    try {
      toast.success('Dispute resolved successfully');
      fetchDisputes();
    } catch (error) {
      toast.error('Failed to resolve dispute');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      open: <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Open</span>,
      in_progress: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">In Progress</span>,
      resolved: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Resolved</span>,
    };
    return badges[status];
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, JSX.Element> = {
      high: <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">High</span>,
      medium: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Medium</span>,
      low: <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Low</span>,
    };
    return badges[priority];
  };

  const columns = [
    { key: 'orderId', label: 'Order ID', render: (d: Dispute) => <span className="font-mono text-sm text-blue-600">{d.orderId}</span> },
    {
      key: 'parties',
      label: 'Parties',
      render: (d: Dispute) => (
        <div className="text-sm">
          <p><strong>Buyer:</strong> {d.buyer}</p>
          <p><strong>Seller:</strong> {d.seller}</p>
        </div>
      ),
    },
    { key: 'title', label: 'Issue', render: (d: Dispute) => <span className="font-medium text-gray-900">{d.title}</span> },
    { key: 'priority', label: 'Priority', render: (d: Dispute) => getPriorityBadge(d.priority) },
    { key: 'status', label: 'Status', render: (d: Dispute) => getStatusBadge(d.status) },
    { key: 'createdAt', label: 'Created', render: (d: Dispute) => <span className="text-sm text-gray-600">{new Date(d.createdAt).toLocaleDateString()}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (d: Dispute) => (
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">View</button>
          {d.status !== 'resolved' && (
            <button
              onClick={() => resolveDispute(d._id, 'resolved')}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
            >
              Resolve
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Dispute Resolution Center"
        description="Manage and resolve order disputes"
        badge={{ text: `${disputes.filter(d => d.status === 'open').length} Open`, variant: 'error' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-2">
            {['all', 'open', 'in_progress', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  statusFilter === status ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <DataTable columns={columns} data={disputes} loading={loading} emptyMessage="No disputes found" />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
