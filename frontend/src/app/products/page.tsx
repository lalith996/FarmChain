'use client';

import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'All',
    'grains',
    'vegetables',
    'fruits',
    'dairy',
    'pulses',
    'spices',
  ];

  useEffect(() => {
    fetchProducts();
  }, [page, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Check if using fake authentication
      const authToken = localStorage.getItem('authToken');
      const isFakeAuth = authToken?.startsWith('fake-jwt-token-');
      
      if (isFakeAuth) {
        console.log('🔧 Using fake products data for dev mode');
        
        // Generate comprehensive fake products
        const fakeProducts = [
          {
            _id: 'prod-1',
            name: 'Organic Tomatoes',
            description: 'Fresh organic tomatoes from local farm',
            category: 'vegetables',
            price: 4.99,
            unit: 'kg',
            quantity: 500,
            farmer: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            images: ['/images/products/tomato.jpg'],
            status: 'active',
            rating: { average: 4.8, count: 45 },
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'prod-2',
            name: 'Fresh Strawberries',
            description: 'Sweet and juicy strawberries',
            category: 'fruits',
            price: 8.99,
            unit: 'kg',
            quantity: 200,
            farmer: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            images: ['/images/products/strawberry.jpg'],
            status: 'active',
            rating: { average: 4.9, count: 67 },
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'prod-3',
            name: 'Organic Wheat',
            description: 'Premium quality organic wheat',
            category: 'grains',
            price: 2.99,
            unit: 'kg',
            quantity: 1000,
            farmer: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            images: ['/images/products/wheat.jpg'],
            status: 'active',
            rating: { average: 4.7, count: 89 },
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'prod-4',
            name: 'Fresh Milk',
            description: 'Pure farm-fresh milk',
            category: 'dairy',
            price: 1.99,
            unit: 'liter',
            quantity: 300,
            farmer: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            images: ['/images/products/milk.jpg'],
            status: 'active',
            rating: { average: 5.0, count: 120 },
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'prod-5',
            name: 'Green Peas',
            description: 'Fresh green peas',
            category: 'vegetables',
            price: 3.49,
            unit: 'kg',
            quantity: 250,
            farmer: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            images: ['/images/products/peas.jpg'],
            status: 'active',
            rating: { average: 4.6, count: 34 },
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'prod-6',
            name: 'Red Apples',
            description: 'Crispy red apples',
            category: 'fruits',
            price: 6.99,
            unit: 'kg',
            quantity: 400,
            farmer: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            images: ['/images/products/apple.jpg'],
            status: 'active',
            rating: { average: 4.8, count: 78 },
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'prod-7',
            name: 'Turmeric Powder',
            description: 'Pure turmeric powder',
            category: 'spices',
            price: 9.99,
            unit: 'kg',
            quantity: 150,
            farmer: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            images: ['/images/products/turmeric.jpg'],
            status: 'active',
            rating: { average: 4.9, count: 56 },
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'prod-8',
            name: 'Black Lentils',
            description: 'Premium black lentils',
            category: 'pulses',
            price: 5.49,
            unit: 'kg',
            quantity: 600,
            farmer: {
              _id: 'fake-farmer-id',
              name: 'John Farmer',
              walletAddress: '0xcbdc7cc11a5b19623c9a515d6a6702f6775075c1'
            },
            images: ['/images/products/lentils.jpg'],
            status: 'active',
            rating: { average: 4.7, count: 92 },
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        // Filter by category if selected
        let filteredProducts = fakeProducts;
        if (category && category !== 'All') {
          filteredProducts = fakeProducts.filter(p => p.category === category);
        }
        
        // Filter by search query if provided
        if (searchQuery) {
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setProducts(filteredProducts as any);
        setTotalPages(1);
      } else {
        // Real API call
        const params: Record<string, string | number> = { page, limit: 12 };
        if (category && category !== 'All') params.category = category;
        if (searchQuery) params.q = searchQuery;

        const response = await productAPI.getAll(params);
        setProducts(response.data.data.products);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Browse Products
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-3.5" />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            <FunnelIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  (cat === 'All' && !category) || category === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-96 animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {products.length} products
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 border rounded-md ${
                        page === pageNum
                          ? 'bg-green-600 text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
