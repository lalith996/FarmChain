'use client';

import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import { ProductCard } from '@/components/products/ProductCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar } from '@/components/shared/FilterBar';
import { Pagination } from '@/components/shared/Pagination';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import { AdjustmentsHorizontalIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [qualityGrade, setQualityGrade] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Grains', value: 'grains' },
    { label: 'Vegetables', value: 'vegetables' },
    { label: 'Fruits', value: 'fruits' },
    { label: 'Dairy', value: 'dairy' },
    { label: 'Pulses', value: 'pulses' },
    { label: 'Spices', value: 'spices' },
  ];

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹100', value: '0-100' },
    { label: '₹100 - ₹500', value: '100-500' },
    { label: '₹500 - ₹1000', value: '500-1000' },
    { label: 'Above ₹1000', value: '1000+' },
  ];

  const qualityGrades = [
    { label: 'All Grades', value: 'all' },
    { label: 'Grade A', value: 'A' },
    { label: 'Grade B', value: 'B' },
    { label: 'Grade C', value: 'C' },
  ];

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Best Rating', value: 'rating' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [page, category, priceRange, qualityGrade, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 12 };
      
      if (category !== 'all') params.category = category;
      if (qualityGrade !== 'all') params.qualityGrade = qualityGrade;
      if (searchQuery) params.q = searchQuery;
      if (sortBy) params.sort = sortBy;
      
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-');
        if (min) params.minPrice = min;
        if (max && max !== '+') params.maxPrice = max;
      }

      const response = await productAPI.getAll(params);
      setProducts(response.data.data.products);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Marketplace"
        description="Discover fresh, quality products directly from verified farmers"
        badge={{ text: `${products.length} Products`, variant: 'success' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Search for products, farmers, or categories..."
          />

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-4 flex items-center space-x-2 text-gray-700 hover:text-green-600 transition"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span className="font-medium">
              {showFilters ? 'Hide' : 'Show'} Advanced Filters
            </span>
          </button>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => { setPriceRange(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                >
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Grade
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => { setQualityGrade(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                >
                  {qualityGrades.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle and Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{products.length}</span> products
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-96 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategory('all');
                setPriceRange('all');
                setQualityGrade('all');
                setPage(1);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} viewMode={viewMode} />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
