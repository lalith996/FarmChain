'use client';

import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  category: string;
  currentPrice: number;
  quantityAvailable: number;
  unit: string;
  qualityGrade: string;
  isActive: boolean;
  views: number;
  orders: number;
}

export default function FarmerListingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchListings();
  }, [page]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockProducts: Product[] = [
        {
          _id: '1',
          name: 'Organic Basmati Rice',
          category: 'grains',
          currentPrice: 120,
          quantityAvailable: 500,
          unit: 'kg',
          qualityGrade: 'A',
          isActive: true,
          views: 245,
          orders: 12,
        },
        {
          _id: '2',
          name: 'Fresh Tomatoes',
          category: 'vegetables',
          currentPrice: 40,
          quantityAvailable: 200,
          unit: 'kg',
          qualityGrade: 'A',
          isActive: true,
          views: 189,
          orders: 8,
        },
        {
          _id: '3',
          name: 'Wheat Flour',
          category: 'grains',
          currentPrice: 35,
          quantityAvailable: 0,
          unit: 'kg',
          qualityGrade: 'B',
          isActive: false,
          views: 156,
          orders: 15,
        },
      ];
      setProducts(mockProducts);
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      // API call to toggle status
      setProducts(products.map(p => 
        p._id === productId ? { ...p, isActive: !currentStatus } : p
      ));
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (product: Product) => (
        <div>
          <p className="font-semibold text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-500 capitalize">{product.category}</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (product: Product) => (
        <span className="text-green-600 font-semibold">
          ₹{product.currentPrice}/{product.unit}
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (product: Product) => (
        <span className={product.quantityAvailable === 0 ? 'text-red-600 font-medium' : 'text-gray-900'}>
          {product.quantityAvailable} {product.unit}
        </span>
      ),
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (product: Product) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          product.qualityGrade === 'A' ? 'bg-green-100 text-green-800' :
          product.qualityGrade === 'B' ? 'bg-yellow-100 text-yellow-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          Grade {product.qualityGrade}
        </span>
      ),
    },
    {
      key: 'performance',
      label: 'Performance',
      render: (product: Product) => (
        <div className="text-sm">
          <p className="text-gray-700">{product.views} views</p>
          <p className="text-gray-700">{product.orders} orders</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (product: Product) => (
        <button
          onClick={() => toggleStatus(product._id, product.isActive)}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            product.isActive 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          } transition`}
        >
          {product.isActive ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product: Product) => (
        <div className="flex items-center space-x-2">
          <Link
            href={`/products/${product._id}`}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
            title="View"
          >
            <EyeIcon className="h-5 w-5" />
          </Link>
          <Link
            href={`/farmer/listings/${product._id}/edit`}
            className="p-1 text-green-600 hover:bg-green-50 rounded transition"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={() => toggleStatus(product._id, product.isActive)}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded transition"
            title={product.isActive ? 'Deactivate' : 'Activate'}
          >
            {product.isActive ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Product Listings"
        description="Manage your product listings and availability"
        badge={{ text: `${products.filter(p => p.isActive).length} Active`, variant: 'success' }}
        action={{
          label: 'Add Product',
          onClick: () => window.location.href = '/products/register',
          icon: <PlusIcon className="h-5 w-5" />,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Listings</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">{products.filter(p => p.isActive).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-2xl font-bold text-blue-600">{products.reduce((sum, p) => sum + p.views, 0)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-purple-600">{products.reduce((sum, p) => sum + p.orders, 0)}</p>
          </div>
        </div>

        {/* Listings Table */}
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No listings yet. Add your first product to get started!"
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
