'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  MapPinIcon,
  StarIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShoppingCartIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { productAPI, blockchainAPI } from '@/lib/api';
import { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface BlockchainHistory {
  event: string;
  timestamp: string;
  blockNumber: number;
  transactionHash: string;
  from: string;
  to?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [blockchainHistory, setBlockchainHistory] = useState<BlockchainHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [params.id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(params.id as string);
      setProduct(response.data);

      // Fetch blockchain history if product is registered on blockchain
      if (response.data.registrationTxHash) {
        try {
          const historyResponse = await blockchainAPI.getProductHistory(response.data._id);
          setBlockchainHistory(historyResponse.data);
        } catch (error) {
          console.error('Failed to fetch blockchain history:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product details');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase products');
      router.push('/auth/login');
      return;
    }

    if (user?.role === 'farmer') {
      toast.error('Farmers cannot purchase products');
      return;
    }

    setShowOrderModal(true);
  };

  const handleCreateOrder = () => {
    // Navigate to checkout page with order data
    router.push(`/checkout?productId=${product?._id}&quantity=${quantity}`);
  };

  const getQualityGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-yellow-100 text-yellow-800';
      case 'C':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/products" className="text-green-600 hover:text-green-700">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Products
        </Link>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              {/* Blockchain Badge */}
              {product.registrationTxHash && (
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Blockchain Verified</span>
                </div>
              )}

              {/* Quality Grade Badge */}
              {product.qualityGrade && (
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${getQualityGradeColor(product.qualityGrade)}`}>
                  Grade {product.qualityGrade.toUpperCase()}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                {/* Category */}
                <div className="flex items-center space-x-4 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {product.category}
                  </span>
                  {product.certifications && product.certifications.length > 0 && (
                    <div className="flex items-center space-x-2">
                      {product.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  {renderStars(product.farmer?.rating?.average || 0)}
                  <span className="text-sm text-gray-600">
                    ({product.farmer?.rating?.average?.toFixed(1) || '0.0'})
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6">{product.description}</p>

                {/* Price */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{product.currentPrice}
                    </span>
                    <span className="text-gray-600">per {product.unit}</span>
                  </div>
                  {product.originalPrice && product.originalPrice > product.currentPrice && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice}
                      </span>
                      <span className="ml-2 text-sm text-green-600 font-medium">
                        Save ₹{(product.originalPrice - product.currentPrice).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className={`font-medium ${product.quantityAvailable > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.quantityAvailable > 0
                        ? `${product.quantityAvailable} ${product.unit} available`
                        : 'Out of Stock'}
                    </span>
                  </div>

                  {product.harvestDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Harvest Date:</span>
                      <span className="font-medium text-gray-900">
                        {format(new Date(product.harvestDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {product.expiryDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Expiry Date:</span>
                      <span className="font-medium text-gray-900">
                        {format(new Date(product.expiryDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Farmer Info */}
                {product.farmer && (
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Farmer Details</h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <UserIcon className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {product.farmer.profile?.name || 'Anonymous Farmer'}
                        </p>
                        {product.farmer.profile?.location && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {product.farmer.profile.location.address || product.farmer.profile.location.city || 'Location not specified'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity Selector & Buy Button */}
                {product.quantityAvailable > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label htmlFor="quantity-input" className="text-sm font-medium text-gray-700">
                        Quantity:
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <input
                          id="quantity-input"
                          type="number"
                          min="1"
                          max={product.quantityAvailable}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantityAvailable, parseInt(e.target.value) || 1)))}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                          aria-label="Product quantity"
                        />
                        <button
                          onClick={() => setQuantity(Math.min(product.quantityAvailable, quantity + 1))}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <span className="text-lg font-medium text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{(product.currentPrice * quantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={handleBuyNow}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                )}

                {product.quantityAvailable === 0 && (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-600 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info Tabs */}
          <div className="border-t border-gray-200">
            <div className="p-8 space-y-8">
              {/* Blockchain Verification */}
              {product.registrationTxHash && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600 mr-2" />
                    Blockchain Verification
                  </h2>
                  <div className="bg-green-50 rounded-lg p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Registration Transaction
                        </p>
                        <p className="text-xs text-gray-600 font-mono break-all">
                          {product.registrationTxHash}
                        </p>
                      </div>
                      <a
                        href={`https://www.oklink.com/amoy/tx/${product.registrationTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        View on Explorer →
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-green-700">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      This product is verified on the blockchain
                    </div>
                  </div>
                </div>
              )}

              {/* Supply Chain History */}
              {blockchainHistory.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <TruckIcon className="h-6 w-6 text-blue-600 mr-2" />
                    Supply Chain History
                  </h2>
                  <div className="space-y-4">
                    {blockchainHistory.map((event, index) => (
                      <div key={index} className="flex">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                            <ClockIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-900">
                                {event.event}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <p>Block: #{event.blockNumber}</p>
                              <p className="font-mono truncate">TX: {event.transactionHash}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Specifications */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Product Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-medium text-gray-900">{product.category}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Quality Grade</p>
                    <p className="font-medium text-gray-900">
                      Grade {product.qualityGrade?.toUpperCase() || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Unit</p>
                    <p className="font-medium text-gray-900">{product.unit}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Storage Type</p>
                    <p className="font-medium text-gray-900">
                      {product.storageType || 'Standard Storage'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Order</h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity} {product.unit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Price per unit:</span>
                <span className="font-medium">₹{product.currentPrice}</span>
              </div>
              <div className="border-t pt-4 flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{(product.currentPrice * quantity).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
