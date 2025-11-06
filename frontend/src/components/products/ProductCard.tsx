'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { ComparisonButton } from '@/components/comparison/ComparisonButton';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const name = product.basicInfo?.name || product.name;
  const category = product.basicInfo?.category || product.category;
  
  // Get image with fallback
  let image = product.basicInfo?.images?.[0] || product.images?.[0];
  if (!image || image === '') {
    // Create a fallback placeholder based on product name
    const encodedName = encodeURIComponent(name || 'Product');
    image = `https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=${encodedName}`;
  }
  
  const description = product.basicInfo?.description || product.description;
  const rawPrice = product.pricing?.currentPrice || product.currentPrice || 0;
  const currentPrice = typeof rawPrice === 'number' ? rawPrice.toFixed(2) : parseFloat(rawPrice).toFixed(2);
  const rawAvailable = product.quantity?.available || product.quantityAvailable || 0;
  const available = typeof rawAvailable === 'number' ? Math.round(rawAvailable) : Math.round(parseFloat(rawAvailable));
  const unit = product.quantity?.unit || product.unit;
  const grade = product.quality?.grade || product.qualityGrade;
  
  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product.productId || product._id}`}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex">
          <div className="relative w-48 h-48 bg-gray-200 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=${encodeURIComponent(name)}`;
              }}
            />
            {product.blockchain?.registrationTxHash && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="p-6 flex-grow flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
                <span className="bg-gray-100 px-3 py-1 rounded text-sm font-semibold text-gray-700 capitalize">
                  {category}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{description || 'Quality agricultural product'}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">
                ₹{currentPrice}
                <span className="text-sm text-gray-500">/{unit}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Available: {available} {unit}</div>
                {grade && (
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    grade === 'A' ? 'bg-green-100 text-green-800' :
                    grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    Grade {grade}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }
  
  return (
    <Link href={`/products/${product.productId || product._id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col">
        <div className="relative h-48 bg-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=${encodeURIComponent(name)}`;
            }}
          />
          {product.blockchain?.registrationTxHash && (
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
          )}
          <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs font-semibold text-gray-700 capitalize">
            {category}
          </div>
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <WishlistButton productId={product.productId || product._id} size="md" />
            <ComparisonButton productId={product.productId || product._id} size="md" />
          </div>
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
            {description || 'Quality agricultural product'}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-green-600">
                ₹{currentPrice}
                <span className="text-sm text-gray-500">/{unit}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Available</div>
              <div className="font-semibold text-gray-900">
                {available} {unit}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm border-t pt-3">
            <div className="flex items-center space-x-1">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 text-xs">
                {product.farmer?.profile?.location?.city || 'India'}
              </span>
            </div>
            {product.farmer?.rating?.count > 0 && (
              <div className="flex items-center space-x-1">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span className="font-medium">{product.farmer.rating.average.toFixed(1)}</span>
                <span className="text-gray-500">({product.farmer.rating.count})</span>
              </div>
            )}
          </div>

          {grade && (
            <div className="mt-2 text-center">
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                grade === 'A' ? 'bg-green-100 text-green-800' :
                grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                Grade {grade}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
