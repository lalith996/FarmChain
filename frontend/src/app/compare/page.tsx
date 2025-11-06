'use client';

import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import { XMarkIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ComparePage() {
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('compareProducts');
    if (saved) {
      setCompareProducts(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('compareProducts', JSON.stringify(compareProducts));
  }, [compareProducts]);

  const searchProducts = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const response = await productAPI.search({ q: searchQuery, limit: 5 });
      setSearchResults(response.data.data.products || []);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
    } finally {
      setSearching(false);
    }
  };

  const addToCompare = (product: Product) => {
    if (compareProducts.length >= 4) {
      toast.error('You can only compare up to 4 products');
      return;
    }
    if (compareProducts.find(p => p._id === product._id)) {
      toast.error('Product already added');
      return;
    }
    setCompareProducts([...compareProducts, product]);
    setSearchQuery('');
    setSearchResults([]);
    toast.success('Product added to comparison');
  };

  const removeFromCompare = (productId: string) => {
    setCompareProducts(compareProducts.filter(p => p._id !== productId));
    toast.success('Product removed');
  };

  const clearAll = () => {
    setCompareProducts([]);
    toast.success('Comparison cleared');
  };

  const ComparisonRow = ({ label, values }: { label: string; values: (string | number)[] }) => (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4 font-medium text-gray-900 bg-gray-50 sticky left-0">{label}</td>
      {values.map((value, index) => (
        <td key={index} className="px-6 py-4 text-gray-700">{value || '-'}</td>
      ))}
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Compare Products"
        description="Compare up to 4 products side by side"
        badge={compareProducts.length > 0 ? { text: `${compareProducts.length} Products`, variant: 'info' } : undefined}
        action={compareProducts.length > 0 ? {
          label: 'Clear All',
          onClick: clearAll,
        } : undefined}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
              placeholder="Search products to compare..."
              className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={searchProducts}
              disabled={searching || compareProducts.length >= 4}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center space-x-3">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">₹{product.currentPrice}/{product.unit}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCompare(product)}
                    disabled={compareProducts.length >= 4}
                    className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {compareProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products to compare</h3>
            <p className="text-gray-600 mb-4">Search and add products to start comparing</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900 sticky left-0 bg-gray-50">
                      Feature
                    </th>
                    {compareProducts.map((product) => (
                      <th key={product._id} className="px-6 py-4 text-left min-w-[250px]">
                        <div className="relative">
                          <button
                            onClick={() => removeFromCompare(product._id)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <Link href={`/products/${product._id}`} className="font-semibold text-gray-900 hover:text-green-600">
                            {product.name}
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow
                    label="Price"
                    values={compareProducts.map(p => `₹${p.currentPrice}/${p.unit}`)}
                  />
                  <ComparisonRow
                    label="Category"
                    values={compareProducts.map(p => p.category)}
                  />
                  <ComparisonRow
                    label="Quality Grade"
                    values={compareProducts.map(p => `Grade ${p.qualityGrade}`)}
                  />
                  <ComparisonRow
                    label="Available Quantity"
                    values={compareProducts.map(p => `${p.quantityAvailable} ${p.unit}`)}
                  />
                  <ComparisonRow
                    label="Farmer"
                    values={compareProducts.map(p => p.farmer?.profile?.name || 'N/A')}
                  />
                  <ComparisonRow
                    label="Location"
                    values={compareProducts.map(p => p.farmer?.profile?.location?.city || 'N/A')}
                  />
                  <ComparisonRow
                    label="Farmer Rating"
                    values={compareProducts.map(p => p.farmer?.rating?.average ? `${p.farmer.rating.average.toFixed(1)} ⭐` : 'N/A')}
                  />
                  <ComparisonRow
                    label="Blockchain Verified"
                    values={compareProducts.map(p => p.blockchain?.registrationTxHash ? '✓ Yes' : '✗ No')}
                  />
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900 bg-gray-50 sticky left-0">Actions</td>
                    {compareProducts.map((product) => (
                      <td key={product._id} className="px-6 py-4">
                        <Link
                          href={`/products/${product._id}`}
                          className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition"
                        >
                          View Details
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
