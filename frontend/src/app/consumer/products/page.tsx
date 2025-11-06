'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  organic: boolean;
  image: string;
}

export default function ProductBrowsingPage() {
  const theme = getRoleTheme('CONSUMER');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOrganic, setShowOrganic] = useState(false);

  const user = { name: 'John Customer', email: 'john@example.com' };

  const products: Product[] = [
    { id: 'P-001', name: 'Organic Tomatoes', category: 'Vegetables', price: 3.99, rating: 4.8, reviews: 245, inStock: true, organic: true, image: '🍅' },
    { id: 'P-002', name: 'Fresh Strawberries', category: 'Fruits', price: 5.99, rating: 4.9, reviews: 312, inStock: true, organic: false, image: '🍓' },
    { id: 'P-003', name: 'Farm Fresh Milk', category: 'Dairy', price: 4.49, rating: 4.7, reviews: 189, inStock: true, organic: true, image: '🥛' },
    { id: 'P-004', name: 'Red Apples', category: 'Fruits', price: 2.99, rating: 4.6, reviews: 156, inStock: true, organic: false, image: '🍎' },
    { id: 'P-005', name: 'Organic Carrots', category: 'Vegetables', price: 2.49, rating: 4.8, reviews: 203, inStock: true, organic: true, image: '🥕' },
    { id: 'P-006', name: 'Fresh Bananas', category: 'Fruits', price: 1.99, rating: 4.5, reviews: 287, inStock: true, organic: false, image: '🍌' },
    { id: 'P-007', name: 'Brown Rice', category: 'Grains', price: 6.99, rating: 4.7, reviews: 134, inStock: true, organic: true, image: '🌾' },
    { id: 'P-008', name: 'Fresh Lettuce', category: 'Vegetables', price: 2.79, rating: 4.6, reviews: 178, inStock: false, organic: false, image: '🥬' },
  ];

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    if (showOrganic && !p.organic) return false;
    return true;
  });

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('grid')} className={`rounded-lg px-4 py-2 ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}>Grid</button>
            <button onClick={() => setViewMode('list')} className={`rounded-lg px-4 py-2 ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}>List</button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search products..." className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4" />
          </div>
          <button className="flex items-center gap-2 rounded-lg border-2 border-purple-500 px-6 py-3 font-semibold text-purple-600">
            <AdjustmentsHorizontalIcon className="h-5 w-5" /> Filters
          </button>
        </div>

        {/* Category & Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {['all', 'Vegetables', 'Fruits', 'Dairy', 'Grains'].map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`rounded-full px-4 py-2 text-sm font-medium ${selectedCategory === cat ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {cat === 'all' ? 'All Products' : cat}
            </button>
          ))}
          <button onClick={() => setShowOrganic(!showOrganic)} className={`rounded-full px-4 py-2 text-sm font-medium ${showOrganic ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
            🌱 Organic Only
          </button>
        </div>

        {/* Products Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl">
                {product.organic && <div className="absolute left-3 top-3 z-10 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">🌱 Organic</div>}
                <button className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-lg hover:bg-pink-50"><HeartIcon className="h-5 w-5 text-pink-500" /></button>
                <div className="p-6">
                  <div className="text-7xl text-center mb-4">{product.image}</div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{product.rating}</span>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-600">${product.price}</span>
                    {product.inStock ? <span className="text-sm text-green-600">In Stock</span> : <span className="text-sm text-red-600">Out of Stock</span>}
                  </div>
                  <button disabled={!product.inStock} className="mt-4 w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-2 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50">
                    <ShoppingCartIcon className="inline h-5 w-5 mr-1 mb-1" /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-6 rounded-lg border border-gray-200 p-4 hover:border-purple-300">
                  <div className="text-5xl">{product.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      {product.organic && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">🌱 Organic</span>}
                    </div>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">${product.price}</div>
                    {product.inStock ? <span className="text-sm text-green-600">In Stock</span> : <span className="text-sm text-red-600">Out of Stock</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="rounded-lg border-2 border-purple-500 p-2 text-purple-600 hover:bg-purple-50"><HeartIcon className="h-5 w-5" /></button>
                    <button disabled={!product.inStock} className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-2 text-white hover:shadow-lg disabled:opacity-50"><ShoppingCartIcon className="h-5 w-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
