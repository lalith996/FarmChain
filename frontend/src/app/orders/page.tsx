'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ShoppingBagIcon 
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { orderAPI } from '@/lib/api';
import { Order } from '@/types';
import OrderCard from '@/components/orders/OrderCard';
import toast from 'react-hot-toast';

type OrderStatus = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuthStore();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if using fake authentication
      const authToken = localStorage.getItem('authToken');
      const isFakeAuth = authToken?.startsWith('fake-jwt-token-');
      
      if (isFakeAuth) {
        console.log('🔧 Using fake orders data for dev mode');
        
        // Get current user to determine role
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        
        // Generate role-specific fake orders
        const fakeOrders = [
          {
            _id: 'order-1',
            orderNumber: 'ORD-2024-001',
            buyer: {
              _id: 'fake-consumer-id',
              name: 'Jane Consumer',
              walletAddress: '0xf75a95a93af19896379635e2bb2283c32bfbf935'
            },
            seller: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            items: [
              {
                product: {
                  _id: 'prod-1',
                  name: 'Organic Tomatoes',
                  price: 4.99
                },
                quantity: 10,
                price: 4.99
              }
            ],
            totalAmount: 49.90,
            status: 'pending',
            paymentStatus: 'pending',
            deliveryAddress: '123 Main St, City, State 12345',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'order-2',
            orderNumber: 'ORD-2024-002',
            buyer: {
              _id: 'fake-consumer-id',
              name: 'Jane Consumer',
              walletAddress: '0xf75a95a93af19896379635e2bb2283c32bfbf935'
            },
            seller: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            items: [
              {
                product: {
                  _id: 'prod-2',
                  name: 'Fresh Strawberries',
                  price: 8.99
                },
                quantity: 5,
                price: 8.99
              }
            ],
            totalAmount: 44.95,
            status: 'confirmed',
            paymentStatus: 'paid',
            deliveryAddress: '123 Main St, City, State 12345',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'order-3',
            orderNumber: 'ORD-2024-003',
            buyer: {
              _id: 'fake-consumer-id',
              name: 'Jane Consumer',
              walletAddress: '0xf75a95a93af19896379635e2bb2283c32bfbf935'
            },
            seller: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            items: [
              {
                product: {
                  _id: 'prod-4',
                  name: 'Fresh Milk',
                  price: 1.99
                },
                quantity: 20,
                price: 1.99
              }
            ],
            totalAmount: 39.80,
            status: 'delivered',
            paymentStatus: 'paid',
            deliveryAddress: '123 Main St, City, State 12345',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'order-4',
            orderNumber: 'ORD-2024-004',
            buyer: {
              _id: 'fake-consumer-id',
              name: 'Jane Consumer',
              walletAddress: '0xf75a95a93af19896379635e2bb2283c32bfbf935'
            },
            seller: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            items: [
              {
                product: {
                  _id: 'prod-6',
                  name: 'Red Apples',
                  price: 6.99
                },
                quantity: 8,
                price: 6.99
              }
            ],
            totalAmount: 55.92,
            status: 'shipped',
            paymentStatus: 'paid',
            deliveryAddress: '123 Main St, City, State 12345',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        // Filter by status if needed
        let filteredOrders = fakeOrders;
        if (statusFilter !== 'all') {
          filteredOrders = fakeOrders.filter(o => o.status === statusFilter);
        }
        
        // Filter by search term if provided
        if (searchTerm) {
          filteredOrders = filteredOrders.filter(o =>
            o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.seller.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setOrders(filteredOrders as any);
        setTotalPages(1);
      } else {
        // Real API call
        const params: {
          page: number;
          limit: number;
          status?: string;
          search?: string;
        } = {
          page,
          limit: 10,
        };

        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }

        if (searchTerm) {
          params.search = searchTerm;
        }

        const response = await orderAPI.getAll(params);
        setOrders(response.data.data || response.data);
        
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchTerm]);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }

    // Check for status filter from URL
    const urlStatus = searchParams.get('status');
    if (urlStatus) {
      setStatusFilter(urlStatus as OrderStatus);
    }

    fetchOrders();
  }, [isAuthenticated, fetchOrders, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const statusOptions: { value: OrderStatus; label: string; count?: number }[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getPageTitle = () => {
    if (user?.role === 'farmer') {
      return 'Sales Orders';
    }
    return 'My Orders';
  };

  const getPageDescription = () => {
    if (user?.role === 'farmer') {
      return 'Manage and track your product sales';
    }
    return 'View and track your purchase orders';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
          <p className="text-gray-600">{getPageDescription()}</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Search by order ID or product name..."
                />
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === option.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter !== 'all'
                ? `You don't have any ${statusFilter} orders yet.`
                : user?.role === 'farmer'
                ? "You haven't received any orders yet."
                : "You haven't placed any orders yet."}
            </p>
            {user?.role !== 'farmer' && (
              <a
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Browse Products
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
