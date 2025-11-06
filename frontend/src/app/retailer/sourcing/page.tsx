'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { getRoleTheme } from '@/config/roleThemes';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  StarIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  distributor: string;
  price: number;
  unit: string;
  minOrder: number;
  rating: number;
  certified: boolean;
  location: string;
}

export default function RetailerSourcingPage() {
  const theme = getRoleTheme('RETAILER');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<string[]>([]);

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  const products: Product[] = [
    {
      id: '1',
      name: 'Organic Tomatoes',
      distributor: 'Fresh Farms Distributor',
      price: 3.99,
      unit: 'lb',
      minOrder: 50,
      rating: 4.8,
      certified: true,
      location: 'California',
    },
    {
      id: '2',
      name: 'Fresh Lettuce',
      distributor: 'Green Valley Supply',
      price: 2.49,
      unit: 'head',
      minOrder: 30,
      rating: 4.6,
      certified: true,
      location: 'Oregon',
    },
    {
      id: '3',
      name: 'Red Apples',
      distributor: 'Orchard Direct',
      price: 2.99,
      unit: 'lb',
      minOrder: 100,
      rating: 4.9,
      certified: false,
      location: 'Washington',
    },
    {
      id: '4',
      name: 'Carrots',
      distributor: 'Farm Fresh Network',
      price: 1.99,
      unit: 'lb',
      minOrder: 50,
      rating: 4.7,
      certified: true,
      location: 'California',
    },
  ];

  const categories = ['all', 'Vegetables', 'Fruits', 'Dairy', 'Grains'];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCart = (id: string) => {
    setCart(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Sourcing</h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse and order from trusted distributors
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-amber-100 px-4 py-2">
            <ShoppingCartIcon className="h-5 w-5 text-amber-600" />
            <span className="font-semibold text-amber-900">{cart.length} items selected</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <select className="rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none">
              <option>All Distributors</option>
              <option>Fresh Farms Distributor</option>
              <option>Green Valley Supply</option>
              <option>Orchard Direct</option>
            </select>
          </div>

          <div className="mt-3 flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="overflow-hidden rounded-lg border-2 border-gray-200 bg-white transition-all hover:border-amber-500 hover:shadow-lg"
            >
              <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <ShoppingCartIcon className="h-20 w-20 text-amber-400" />
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  {product.certified && (
                    <ShieldCheckIcon className="h-5 w-5 text-green-500" title="Certified Organic" />
                  )}
                </div>

                <p className="text-sm text-gray-600">{product.distributor}</p>

                <div className="mt-2 flex items-center gap-1">
                  <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>

                <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                  <MapPinIcon className="h-4 w-4" />
                  {product.location}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-amber-600">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500">/{product.unit}</span>
                  </div>
                </div>

                <p className="mt-1 text-xs text-gray-500">Min. order: {product.minOrder} {product.unit}s</p>

                <button
                  onClick={() => toggleCart(product.id)}
                  className={`mt-4 w-full rounded-lg px-4 py-2 font-medium transition-colors ${
                    cart.includes(product.id)
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg'
                  }`}
                >
                  {cart.includes(product.id) ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 rounded-lg bg-white p-6 shadow-2xl">
            <h3 className="mb-3 font-semibold text-gray-900">Cart Summary</h3>
            <p className="text-sm text-gray-600">{cart.length} items selected</p>
            <button className="mt-4 w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white hover:shadow-lg">
              Create Purchase Order
            </button>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
