'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import { HeartIcon, ShoppingCartIcon, TrashIcon, StarIcon, TagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface WishlistItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  onSale?: boolean;
  dateAdded: string;
}

export default function WishlistPage() {
  const theme = getRoleTheme('CONSUMER');
  const user = { name: 'John Customer', email: 'john@example.com' };
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    { id: 'W-001', name: 'Organic Strawberries', category: 'fruits', price: 5.99, originalPrice: 7.99, image: '🍓', rating: 4.9, reviews: 312, inStock: true, onSale: true, dateAdded: '2025-11-05' },
    { id: 'W-002', name: 'Fresh Avocados', category: 'fruits', price: 4.99, image: '🥑', rating: 4.7, reviews: 189, inStock: true, dateAdded: '2025-11-04' },
    { id: 'W-003', name: 'Organic Spinach', category: 'vegetables', price: 3.49, image: '🥬', rating: 4.8, reviews: 156, inStock: false, dateAdded: '2025-11-03' },
    { id: 'W-004', name: 'Greek Yogurt', category: 'dairy', price: 4.29, image: '🥛', rating: 4.6, reviews: 278, inStock: true, dateAdded: '2025-11-02' },
    { id: 'W-005', name: 'Organic Blueberries', category: 'fruits', price: 6.99, originalPrice: 8.99, image: '🫐', rating: 4.9, reviews: 445, inStock: true, onSale: true, dateAdded: '2025-11-01' },
    { id: 'W-006', name: 'Whole Grain Bread', category: 'bakery', price: 3.99, image: '🍞', rating: 4.5, reviews: 203, inStock: true, dateAdded: '2025-10-30' },
  ]);

  const categories = ['all', 'fruits', 'vegetables', 'dairy', 'bakery'];
  const filteredWishlist = selectedCategory === 'all'
    ? wishlist
    : wishlist.filter(item => item.category === selectedCategory);

  const removeFromWishlist = (id: string) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  const addToCart = (item: WishlistItem) => {
    // Cart functionality would be implemented here
    console.log('Added to cart:', item);
  };

  const totalItems = wishlist.length;
  const totalValue = wishlist.reduce((sum, item) => sum + item.price, 0);
  const onSaleItems = wishlist.filter(item => item.onSale).length;
  const outOfStockItems = wishlist.filter(item => !item.inStock).length;

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Items"
            value={totalItems}
            subtitle="Saved for later"
            icon={HeartIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Total Value"
            value={`$${totalValue.toFixed(2)}`}
            subtitle="If purchased"
            icon={ShoppingCartIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="On Sale"
            value={onSaleItems}
            subtitle="Special offers"
            icon={TagIcon}
            gradient="from-pink-500 to-rose-500"
          />
          <AdvancedStatCard
            title="Out of Stock"
            value={outOfStockItems}
            subtitle="Currently unavailable"
            icon={TrashIcon}
            gradient="from-red-500 to-orange-500"
          />
        </StatCardsGrid>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredWishlist.length === 0 && (
          <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-12 text-center">
            <HeartIcon className="mx-auto h-16 w-16 text-purple-400" />
            <h3 className="mt-4 text-xl font-bold text-gray-900">Your wishlist is empty</h3>
            <p className="mt-2 text-gray-600">Start adding products you love to your wishlist</p>
            <button className="mt-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-bold text-white hover:shadow-lg">
              Browse Products
            </button>
          </div>
        )}

        {/* Wishlist Items - Grid View */}
        {viewMode === 'grid' && filteredWishlist.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredWishlist.map((item) => (
              <div key={item.id} className="group relative rounded-xl bg-white p-4 shadow-lg hover:shadow-xl transition-all">
                {/* Heart Icon */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute right-2 top-2 z-10 rounded-full bg-white p-2 shadow-lg hover:scale-110 transition-transform"
                >
                  <HeartSolidIcon className="h-5 w-5 text-pink-500" />
                </button>

                {/* Sale Badge */}
                {item.onSale && (
                  <div className="absolute left-2 top-2 z-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1 text-xs font-bold text-white">
                    SALE
                  </div>
                )}

                {/* Product Image */}
                <div className="mb-4 flex h-32 items-center justify-center text-6xl">
                  {item.image}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-700">{item.rating}</span>
                    <span className="text-sm text-gray-500">({item.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-purple-600">${item.price}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">${item.originalPrice}</span>
                    )}
                  </div>

                  {/* Stock Status */}
                  {!item.inStock && (
                    <div className="text-sm font-medium text-red-600">Out of Stock</div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                      className={`flex-1 rounded-lg py-2 text-sm font-bold ${
                        item.inStock
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCartIcon className="inline-block h-4 w-4 mr-1" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="rounded-lg border-2 border-gray-300 px-3 py-2 text-gray-600 hover:border-red-500 hover:text-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Date Added */}
                  <div className="text-xs text-gray-400">Added {item.dateAdded}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wishlist Items - List View */}
        {viewMode === 'list' && filteredWishlist.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="space-y-4">
              {filteredWishlist.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-lg border-2 border-gray-100 p-4 hover:border-purple-300 transition-all">
                  {/* Product Image */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-50 text-4xl">
                    {item.image}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-700">{item.rating}</span>
                            <span className="text-sm text-gray-500">({item.reviews})</span>
                          </div>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500 capitalize">{item.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-purple-600">${item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">${item.originalPrice}</span>
                          )}
                        </div>
                        {item.onSale && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-bold text-pink-700">
                            <TagIcon className="h-3 w-3" /> ON SALE
                          </span>
                        )}
                        {!item.inStock && (
                          <div className="text-sm font-medium text-red-600 mt-1">Out of Stock</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!item.inStock}
                        className={`rounded-lg px-6 py-2 text-sm font-bold ${
                          item.inStock
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCartIcon className="inline-block h-4 w-4 mr-1" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-red-500 hover:text-red-500"
                      >
                        <TrashIcon className="inline-block h-4 w-4 mr-1" />
                        Remove
                      </button>
                      <span className="ml-auto text-xs text-gray-400">Added {item.dateAdded}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {filteredWishlist.length > 0 && (
          <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Add All to Cart</h3>
                <p className="text-sm text-gray-600">Purchase all items in your wishlist at once</p>
              </div>
              <button className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-bold text-white hover:shadow-lg">
                Add All ({filteredWishlist.filter(i => i.inStock).length} items)
              </button>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
