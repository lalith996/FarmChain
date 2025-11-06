'use client';

import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

interface WishlistButtonProps {
  productId: string;
  initialInWishlist?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function WishlistButton({ 
  productId, 
  initialInWishlist = false,
  size = 'md',
  showLabel = false
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, token } = useAuthStore();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);
      
      if (!isAuthenticated || !token) {
        toast.error('Please login to add to wishlist');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (inWishlist) {
        // Get default wishlist first
        const wishlistsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/wishlists`,
          config
        );
        
        const defaultWishlist = wishlistsRes.data.data.find((w: any) => w.isDefault);
        
        if (defaultWishlist) {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/wishlists/${defaultWishlist._id}/items/${productId}`,
            config
          );
        }
        
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/wishlists/items`,
          { productId },
          config
        );
        
        setInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast.error(error.response?.data?.error || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`
        flex items-center space-x-2 p-2 rounded-full 
        hover:bg-gray-100 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${inWishlist ? 'text-red-500' : 'text-gray-600'}
      `}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-red-500 ${sizeClasses[size]}`} />
      ) : inWishlist ? (
        <HeartSolidIcon className={`${sizeClasses[size]} animate-pulse`} />
      ) : (
        <HeartIcon className={sizeClasses[size]} />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {inWishlist ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
