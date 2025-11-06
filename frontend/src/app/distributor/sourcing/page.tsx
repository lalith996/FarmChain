'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar } from '@/components/shared/FilterBar';
import { ProductCard } from '@/components/products/ProductCard';
import { Pagination } from '@/components/shared/Pagination';
import toast from 'react-hot-toast';

export default function DistributorSourcingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [page, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockProducts = [
        {
          _id: '1',
          name: 'Organic Rice',
          category: 'grains',
          currentPrice: 120,
          quantityAvailable: 5000,
          unit: 'kg',
          qualityGrade: 'A',
          farmer: { profile: { name: 'Rajesh Kumar', location: { city: 'Punjab' } }, rating: { average: 4.8, count: 45 } },
          images: [],
        },
      ];
      setProducts(mockProducts);
      setTotalPages(1);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Product Sourcing" description="Find and source quality products from verified farmers" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={fetchProducts}
            placeholder="Search products by name, category, or farmer..."
            filters={[
              {
                label: 'Category',
                value: category,
                onChange: setCategory,
                options: [
                  { label: 'All Categories', value: 'all' },
                  { label: 'Grains', value: 'grains' },
                  { label: 'Vegetables', value: 'vegetables' },
                  { label: 'Fruits', value: 'fruits' },
                ],
              },
            ]}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
