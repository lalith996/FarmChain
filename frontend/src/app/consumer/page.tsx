'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import {
  ShoppingBagIcon,
  HeartIcon,
  TruckIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: 'New' | 'Sale' | 'Organic' | 'Popular';
}

export default function ConsumerMarketplacePage() {
  const theme = getRoleTheme('CONSUMER');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vegetables' | 'fruits' | 'dairy' | 'grains'>('all');

  const user = {
    name: 'John Customer',
    email: 'john@example.com',
  };

  const featuredProducts: Product[] = [
    { id: 'P-001', name: 'Organic Tomatoes', category: 'vegetables', price: 3.99, originalPrice: 4.99, image: '🍅', rating: 4.8, reviews: 245, badge: 'Sale' },
    { id: 'P-002', name: 'Fresh Strawberries', category: 'fruits', price: 5.99, image: '🍓', rating: 4.9, reviews: 312, badge: 'Popular' },
    { id: 'P-003', name: 'Farm Fresh Milk', category: 'dairy', price: 4.49, image: '🥛', rating: 4.7, reviews: 189, badge: 'Organic' },
    { id: 'P-004', name: 'Red Apples', category: 'fruits', price: 2.99, image: '🍎', rating: 4.6, reviews: 156, badge: 'New' },
    { id: 'P-005', name: 'Organic Carrots', category: 'vegetables', price: 2.49, image: '🥕', rating: 4.8, reviews: 203 },
    { id: 'P-006', name: 'Fresh Bananas', category: 'fruits', price: 1.99, image: '🍌', rating: 4.5, reviews: 287 },
    { id: 'P-007', name: 'Brown Rice', category: 'grains', price: 6.99, image: '🌾', rating: 4.7, reviews: 134, badge: 'Organic' },
    { id: 'P-008', name: 'Fresh Lettuce', category: 'vegetables', price: 2.79, image: '🥬', rating: 4.6, reviews: 178 },
  ];

  const categories = [
    { id: 'vegetables', name: 'Vegetables', icon: '🥕', color: 'from-green-500 to-emerald-500' },
    { id: 'fruits', name: 'Fruits', icon: '🍎', color: 'from-red-500 to-pink-500' },
    { id: 'dairy', name: 'Dairy', icon: '🥛', color: 'from-blue-500 to-cyan-500' },
    { id: 'grains', name: 'Grains', icon: '🌾', color: 'from-amber-500 to-yellow-500' },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? featuredProducts
    : featuredProducts.filter(p => p.category === selectedCategory);

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold">Fresh Farm Products 🌱</h1>
            <p className="mt-2 text-lg opacity-90">
              Farm-fresh produce delivered to your doorstep
            </p>
            <div className="mt-6 flex gap-4">
              <button className="rounded-lg bg-white px-6 py-3 font-semibold text-purple-600 shadow-lg transition-all hover:shadow-xl">
                Shop Now
              </button>
              <button className="rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white hover:text-purple-600">
                Learn More
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-64 opacity-20">
            <div className="text-9xl">🛒</div>
          </div>
        </div>

        {/* Quick Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Active Orders"
            value={3}
            subtitle="In progress"
            icon={ShoppingBagIcon}
            gradient={theme.gradients.primary}
            onClick={() => {}}
          />
          <AdvancedStatCard
            title="Wishlist Items"
            value={12}
            subtitle="Saved products"
            icon={HeartIcon}
            gradient="from-pink-500 to-rose-500"
            onClick={() => {}}
          />
          <AdvancedStatCard
            title="Reward Points"
            value={2450}
            subtitle="Available to use"
            icon={SparklesIcon}
            gradient="from-amber-500 to-orange-500"
            onClick={() => {}}
          />
          <AdvancedStatCard
            title="Next Delivery"
            value="Tomorrow"
            subtitle="Order #1234"
            icon={TruckIcon}
            gradient="from-green-500 to-emerald-500"
            onClick={() => {}}
          />
        </StatCardsGrid>

        {/* Categories */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`group relative overflow-hidden rounded-xl p-6 text-center transition-all ${
                  selectedCategory === category.id
                    ? 'scale-105 shadow-2xl'
                    : 'shadow-lg hover:scale-105 hover:shadow-xl'
                } bg-gradient-to-br ${category.color}`}
              >
                <div className="text-5xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-bold text-white">{category.name}</h3>
              </button>
            ))}
          </div>
        </div>

        {/* Deals & Offers */}
        <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FireIcon className="h-8 w-8 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Today's Hot Deals 🔥</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {featuredProducts.filter(p => p.badge === 'Sale').map((product) => (
              <div key={product.id} className="rounded-xl bg-white p-4 shadow-lg">
                <div className="text-6xl text-center mb-3">{product.image}</div>
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-bold text-purple-600">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                  )}
                  <span className="ml-auto rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600">
                    SAVE {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
              >
                {product.badge && (
                  <div className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-bold ${
                    product.badge === 'Sale' ? 'bg-red-500 text-white' :
                    product.badge === 'New' ? 'bg-blue-500 text-white' :
                    product.badge === 'Popular' ? 'bg-purple-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    {product.badge}
                  </div>
                )}

                <button className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-pink-50">
                  <HeartIcon className="h-5 w-5 text-pink-500" />
                </button>

                <div className="p-6">
                  <div className="text-7xl text-center mb-4">{product.image}</div>

                  <h3 className="font-semibold text-gray-900">{product.name}</h3>

                  <div className="mt-2 flex items-center gap-1">
                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-purple-600">${product.price}</span>
                      {product.originalPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <button className="mt-4 w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-2 font-semibold text-white transition-all hover:shadow-lg">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Banner */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white">
            <TruckIcon className="h-10 w-10 mb-3" />
            <h3 className="text-lg font-bold">Free Delivery</h3>
            <p className="text-sm opacity-90">On orders over $50</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
            <SparklesIcon className="h-10 w-10 mb-3" />
            <h3 className="text-lg font-bold">Fresh & Organic</h3>
            <p className="text-sm opacity-90">Farm to table quality</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white">
            <TagIcon className="h-10 w-10 mb-3" />
            <h3 className="text-lg font-bold">Best Prices</h3>
            <p className="text-sm opacity-90">Guaranteed lowest prices</p>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
