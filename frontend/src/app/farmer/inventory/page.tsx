'use client';

import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { Pagination } from '@/components/shared/Pagination';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function FarmerInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInventory();
  }, [page, statusFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 10, filter: 'mine' };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.q = searchQuery;

      const response = await productAPI.getAll(params);
      setProducts(response.data.data.products);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(productId);
      toast.success('Product deleted successfully');
      fetchInventory();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (product: Product) => (
        <div className="flex items-center space-x-3">
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
          )}
          <div>
            <p className="font-semibold text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500 capitalize">{product.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Available',
      render: (product: Product) => (
        <span className="font-medium">
          {product.quantityAvailable} {product.unit}
        </span>
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
      key: 'status',
      label: 'Status',
      render: (product: Product) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
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
            onClick={() => handleDelete(product._id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Inventory Management"
        description="Manage your farm products and stock levels"
        badge={{ text: `${products.length} Products`, variant: 'info' }}
        action={{
          label: 'Add Product',
          onClick: () => window.location.href = '/products/register',
          icon: <PlusIcon className="h-5 w-5" />,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={fetchInventory}
            placeholder="Search products by name or category..."
            filters={[
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                  { label: 'Out of Stock', value: 'out_of_stock' },
                ],
              },
            ]}
          />
        </div>

        {/* Inventory Table */}
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products in inventory. Add your first product to get started!"
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
