'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.basicInfo.images[0] || '/placeholder-product.jpg';
  
  return (
    <Link href={`/products/${product.productId}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col">
        <div className="relative h-48 bg-gray-200">
          <Image
            src={image}
            alt={product.basicInfo.name}
            fill
            className="object-cover"
          />
          {product.blockchain?.registrationTxHash && (
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
          )}
          <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs font-semibold text-gray-700 capitalize">
            {product.basicInfo.category}
          </div>
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.basicInfo.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
            {product.basicInfo.description || 'Quality agricultural product'}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-green-600">
                ₹{product.pricing.currentPrice}
                <span className="text-sm text-gray-500">/{product.quantity.unit}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Available</div>
              <div className="font-semibold text-gray-900">
                {product.quantity.available} {product.quantity.unit}
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

          {product.quality?.grade && (
            <div className="mt-2 text-center">
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                product.quality.grade === 'A' ? 'bg-green-100 text-green-800' :
                product.quality.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                Grade {product.quality.grade}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
