'use client';

import { useState, useEffect } from 'react';
import { orderAPI } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import toast from 'react-hot-toast';
import { CheckCircleIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  orderId: string;
  buyer: { name: string };
  product: { name: string };
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const mockOrders: Order[] = [
        {
          _id: '1',
          orderId: 'ORD-12345',
          buyer: { name: 'Amit Patel' },
          product: { name: 'Organic Rice' },
          quantity: 50,
          totalAmount: 6000,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          orderId: 'ORD-12346',
          buyer: { name: 'Priya Sharma' },
          product: { name: 'Fresh Tomatoes' },
          quantity: 30,
          totalAmount: 1200,
          status: 'shipped',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setOrders(mockOrders);
      setTotalPages(1);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>,
      confirmed: <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Confirmed</span>,
      shipped: <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Shipped</span>,
      delivered: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Delivered</span>,
      cancelled: <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>,
    };
    return badges[status] || badges.pending;
  };

  const columns = [
    {
      key: 'orderId',
      label: 'Order ID',
      render: (order: Order) => <span className="font-mono text-sm text-blue-600">{order.orderId}</span>,
    },
    {
      key: 'buyer',
      label: 'Buyer',
      render: (order: Order) => <span className="font-medium text-gray-900">{order.buyer.name}</span>,
    },
    {
      key: 'product',
      label: 'Product',
      render: (order: Order) => (
        <div>
          <p className="font-medium text-gray-900">{order.product.name}</p>
          <p className="text-sm text-gray-600">{order.quantity} kg</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (order: Order) => <span className="font-semibold text-green-600">₹{order.totalAmount}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (order: Order) => getStatusBadge(order.status),
    },
    {
      key: 'date',
      label: 'Date',
      render: (order: Order) => <span className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (order: Order) => (
        <div className="flex items-center space-x-2">
          {order.status === 'pending' && (
            <button
              onClick={() => updateOrderStatus(order._id, 'confirmed')}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
            >
              Confirm
            </button>
          )}
          {order.status === 'confirmed' && (
            <button
              onClick={() => updateOrderStatus(order._id, 'shipped')}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm"
            >
              Ship
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Order Management"
        description="Manage incoming orders and shipments"
        badge={{ text: `${orders.filter(o => o.status === 'pending').length} Pending`, variant: 'warning' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-2">
            {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  statusFilter === status ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <DataTable columns={columns} data={orders} loading={loading} emptyMessage="No orders yet" />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
