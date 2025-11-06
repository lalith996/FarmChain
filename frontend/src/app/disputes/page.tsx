'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon, ChatBubbleLeftRightIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Dispute {
  _id: string;
  orderId: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolvedAt?: string;
  messages: number;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [page, statusFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockDisputes: Dispute[] = [
        {
          _id: '1',
          orderId: 'ORD-12345',
          title: 'Product quality issue',
          description: 'Received product does not match the quality grade mentioned',
          status: 'open',
          priority: 'high',
          createdAt: new Date().toISOString(),
          messages: 2,
        },
        {
          _id: '2',
          orderId: 'ORD-12346',
          title: 'Delayed delivery',
          description: 'Order was not delivered within the promised timeframe',
          status: 'in_progress',
          priority: 'medium',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          messages: 5,
        },
        {
          _id: '3',
          orderId: 'ORD-12347',
          title: 'Wrong quantity received',
          description: 'Received 40kg instead of ordered 50kg',
          status: 'resolved',
          priority: 'low',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          resolvedAt: new Date(Date.now() - 86400000).toISOString(),
          messages: 8,
        },
      ];
      setDisputes(mockDisputes);
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Open</span>,
      in_progress: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">In Progress</span>,
      resolved: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Resolved</span>,
      closed: <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Closed</span>,
    };
    return badges[status as keyof typeof badges];
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">High</span>,
      medium: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Medium</span>,
      low: <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Low</span>,
    };
    return badges[priority as keyof typeof badges];
  };

  const columns = [
    {
      key: 'orderId',
      label: 'Order ID',
      render: (dispute: Dispute) => (
        <span className="font-mono text-sm text-blue-600">{dispute.orderId}</span>
      ),
    },
    {
      key: 'title',
      label: 'Issue',
      render: (dispute: Dispute) => (
        <div>
          <p className="font-semibold text-gray-900">{dispute.title}</p>
          <p className="text-sm text-gray-600 truncate max-w-xs">{dispute.description}</p>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (dispute: Dispute) => getPriorityBadge(dispute.priority),
    },
    {
      key: 'status',
      label: 'Status',
      render: (dispute: Dispute) => getStatusBadge(dispute.status),
    },
    {
      key: 'messages',
      label: 'Messages',
      render: (dispute: Dispute) => (
        <div className="flex items-center space-x-1">
          <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-700">{dispute.messages}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (dispute: Dispute) => (
        <span className="text-sm text-gray-600">
          {new Date(dispute.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (dispute: Dispute) => (
        <button
          onClick={() => {
            setSelectedDispute(dispute);
            setShowModal(true);
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Disputes"
        description="Manage and resolve order disputes"
        badge={{ text: `${disputes.filter(d => d.status === 'open').length} Open`, variant: 'warning' }}
        action={{
          label: 'Raise Dispute',
          onClick: () => toast.info('Dispute form coming soon'),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-2">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  statusFilter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Disputes Table */}
        <DataTable
          columns={columns}
          data={disputes}
          loading={loading}
          emptyMessage="No disputes found"
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        {/* Dispute Details Modal */}
        {showModal && selectedDispute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Dispute Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-blue-600">{selectedDispute.orderId}</span>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(selectedDispute.priority)}
                    {getStatusBadge(selectedDispute.status)}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedDispute.title}</h4>
                  <p className="text-gray-700">{selectedDispute.description}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Created: {new Date(selectedDispute.createdAt).toLocaleString()}
                  </p>
                  {selectedDispute.resolvedAt && (
                    <p className="text-sm text-gray-600">
                      Resolved: {new Date(selectedDispute.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Messages ({selectedDispute.messages})</h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                    Message thread will appear here
                  </div>
                </div>

                {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' && (
                  <div className="flex items-center space-x-4 pt-4 border-t">
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                      Mark as Resolved
                    </button>
                    <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                      Close Dispute
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
