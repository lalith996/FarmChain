'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { adminAPI } from '@/lib/api';
import { Product } from '@/types';
import toast from 'react-hot-toast';

type ProductStatus = 'all' | 'active' | 'pending' | 'rejected';
type CategoryType = 'all' | 'grains' | 'vegetables' | 'fruits' | 'dairy' | 'organic';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (currentUser?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUser, page, statusFilter, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Check if using development authentication
      const authToken = localStorage.getItem('authToken');
      const isDevAuth = authToken?.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.');
      
      if (isDevAuth) {
        console.log('� Loading products data');
        // Use development products
        setProducts([
          {
            _id: 'fake-product-1',
            name: 'Organic Tomatoes',
            category: 'Vegetables',
            price: 4.99,
            unit: 'kg',
            status: 'active',
            farmer: { name: 'John Farmer', _id: 'fake-user-2' },
            images: [],
            createdAt: new Date().toISOString()
          },
          {
            _id: 'fake-product-2',
            name: 'Fresh Strawberries',
            category: 'Fruits',
            price: 8.99,
            unit: 'kg',
            status: 'pending',
            farmer: { name: 'John Farmer', _id: 'fake-user-2' },
            images: [],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ] as any);
        setTotalPages(1);
      } else {
        // Real API calls
        const params: Record<string, string | number> = {
          page,
          limit: 12,
        };

        if (statusFilter !== 'all') params.status = statusFilter;
        if (categoryFilter !== 'all') params.category = categoryFilter;
        if (searchTerm) params.search = searchTerm;

        const response = await adminAPI.getAllProducts(params);
        setProducts(response.data.products || response.data);
        
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleApproveProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to approve this product?')) {
      return;
    }

    try {
      await adminAPI.updateUser(productId, { status: 'active' });
      toast.success('Product approved successfully');
      fetchProducts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to approve product');
    }
  };

  const handleRejectProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to reject this product?')) {
      return;
    }

    try {
      await adminAPI.updateUser(productId, { status: 'rejected' });
      toast.success('Product rejected successfully');
      fetchProducts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to reject product');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
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
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-2">Review and manage all platform products</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </form>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ProductStatus);
                setPage(1);
              }}
              aria-label="Filter by status"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending Approval</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as CategoryType);
                setPage(1);
              }}
              aria-label="Filter by category"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="grains">Grains</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="dairy">Dairy</option>
              <option value="organic">Organic</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative h-48 w-full bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={(product.basicInfo?.images?.[0] || product.images?.[0]) || `https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=${encodeURIComponent(product.basicInfo?.name || product.name || 'Product')}`}
                  alt={product.basicInfo?.name || product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=${encodeURIComponent(product.basicInfo?.name || product.name || 'Product')}`;
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {(product.blockchain?.registrationTxHash || product.registrationTxHash) && (
                  <div className="absolute top-2 left-2">
                    <ShieldCheckIcon className="w-6 h-6 text-green-500 bg-white rounded-full p-1" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {product.basicInfo?.name || product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {product.basicInfo?.description || product.description || 'No description'}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{(product.pricing?.currentPrice || product.currentPrice || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">per {product.quantity?.unit || product.unit || 'unit'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Stock: {Math.round(product.quantity?.available || product.quantityAvailable || 0)}</p>
                    <p className="text-xs text-gray-500 capitalize">{product.basicInfo?.category || product.category}</p>
                  </div>
                </div>

                <div className="border-t pt-3 mb-3">
                  <p className="text-sm text-gray-600">
                    Farmer: <span className="font-medium">{product.farmer?.profile?.name || 'Unknown'}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.farmDetails?.farmLocation?.address || product.location || 'Location not specified'}
                  </p>
                </div>

                {/* Actions */}
                {product.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveProduct(product._id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectProduct(product._id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </div>
                )}

                {product.status === 'active' && (
                  <Link
                    href={`/products/${product._id}`}
                    className="block w-full text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                )}

                {product.status === 'rejected' && (
                  <div className="flex items-center justify-center text-sm text-red-600">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    Rejected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <TrashIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
