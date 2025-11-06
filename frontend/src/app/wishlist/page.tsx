'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import { HeartIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface WishlistItem {
  _id: string;
  productId: Product;
  addedAt: string;
  notes?: string;
  priceWhenAdded: number;
}

interface Wishlist {
  _id: string;
  name: string;
  isDefault: boolean;
  items: WishlistItem[];
  itemCount: number;
}

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to view your wishlist');
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/wishlists`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setWishlists(response.data.data);
    } catch (error: any) {
      console.error('Error loading wishlists:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to view your wishlist');
      } else {
        toast.error('Failed to load wishlists');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string, productId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/wishlists/${wishlistId}/items/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Removed from wishlist');
      loadWishlists();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const createWishlist = async () => {
    if (!newWishlistName.trim()) {
      toast.error('Please enter a wishlist name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/wishlists`,
        { name: newWishlistName, isPublic: false },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Wishlist created');
      setNewWishlistName('');
      setShowCreateModal(false);
      loadWishlists();
    } catch (error) {
      console.error('Error creating wishlist:', error);
      toast.error('Failed to create wishlist');
    }
  };

  const deleteWishlist = async (wishlistId: string) => {
    if (!confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/wishlists/${wishlistId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Wishlist deleted');
      loadWishlists();
    } catch (error: any) {
      console.error('Error deleting wishlist:', error);
      toast.error(error.response?.data?.error || 'Failed to delete wishlist');
    }
  };

  const totalItems = wishlists.reduce((sum, w) => sum + w.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="My Wishlists"
        description="Products you've saved for later"
        badge={totalItems > 0 ? { text: `${totalItems} Items`, variant: 'info' } : undefined}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Wishlist Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Wishlist</span>
          </button>
        </div>

        {/* Create Wishlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Create New Wishlist</h3>
              <input
                type="text"
                value={newWishlistName}
                onChange={(e) => setNewWishlistName(e.target.value)}
                placeholder="Wishlist name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mb-4"
                onKeyPress={(e) => e.key === 'Enter' && createWishlist()}
              />
              <div className="flex space-x-3">
                <button
                  onClick={createWishlist}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewWishlistName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        ) : wishlists.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No wishlists yet</h3>
            <p className="text-gray-600 mb-6">
              Create a wishlist and start saving products you love
            </p>
            <a
              href="/marketplace"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {wishlists.map((wishlist) => (
              <div key={wishlist._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {wishlist.name}
                      {wishlist.isDefault && (
                        <span className="ml-2 text-sm font-normal text-green-600">(Default)</span>
                      )}
                    </h2>
                    <p className="text-gray-600">{wishlist.items.length} items</p>
                  </div>
                  {!wishlist.isDefault && (
                    <button
                      onClick={() => deleteWishlist(wishlist._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete wishlist"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {wishlist.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items in this wishlist</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.items.map((item) => (
                      <div key={item._id} className="relative">
                        <button
                          onClick={() => removeFromWishlist(wishlist._id, item.productId._id)}
                          className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition"
                          title="Remove from wishlist"
                        >
                          <HeartSolidIcon className="h-6 w-6 text-red-500" />
                        </button>
                        <ProductCard product={item.productId} />
                        {item.priceWhenAdded && item.productId.price < item.priceWhenAdded && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Price Drop!
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
