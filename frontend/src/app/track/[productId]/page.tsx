'use client';

import { useState, useEffect } from 'react';
import { productAPI, blockchainAPI } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface SupplyChainEvent {
  status: string;
  timestamp: string;
  location?: string;
  actor?: string;
  txHash?: string;
  note?: string;
}

export default function TrackProductPage({ params }: { params: { productId: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<SupplyChainEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  useEffect(() => {
    fetchProductDetails();
  }, [params.productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const [productRes, historyRes] = await Promise.all([
        productAPI.getById(params.productId),
        productAPI.getHistory(params.productId).catch(() => ({ data: { data: [] } })),
      ]);

      setProduct(productRes.data.data);
      setHistory(historyRes.data.data || []);

      // Try to get blockchain verification
      if (productRes.data.data.blockchain?.registrationTxHash) {
        try {
          const verifyRes = await blockchainAPI.verifyProduct(params.productId);
          setVerificationStatus(verifyRes.data.data);
        } catch (error) {
          console.error('Verification failed:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'registered':
      case 'created':
        return <DocumentTextIcon className="h-6 w-6" />;
      case 'in_transit':
      case 'shipped':
        return <TruckIcon className="h-6 w-6" />;
      case 'delivered':
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6" />;
      default:
        return <ClockIcon className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'registered':
      case 'created':
        return 'bg-blue-100 text-blue-600';
      case 'in_transit':
      case 'shipped':
        return 'bg-yellow-100 text-yellow-600';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-96 bg-gray-200 rounded-lg" />
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
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/marketplace" className="text-green-600 hover:text-green-700 font-medium">
            Browse Marketplace →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Track Product"
        description={`Product ID: ${params.productId}`}
        badge={
          verificationStatus?.isValid
            ? { text: 'Verified on Blockchain', variant: 'success' }
            : undefined
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-semibold capitalize">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quality Grade</p>
                  <p className="font-semibold">Grade {product.qualityGrade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Price</p>
                  <p className="font-semibold text-green-600">₹{product.currentPrice}/{product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="font-semibold">{product.quantityAvailable} {product.unit}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Verification */}
        {product.blockchain?.registrationTxHash && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-sm p-6 mb-6 border border-green-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-12 w-12 text-green-600" />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Blockchain Verified
                </h3>
                <p className="text-gray-600 mb-3">
                  This product is registered on the blockchain, ensuring authenticity and traceability.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Transaction Hash:</span>
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      {product.blockchain.registrationTxHash.slice(0, 20)}...
                    </code>
                  </div>
                  {product.blockchain.contractAddress && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Contract Address:</span>
                      <code className="text-xs bg-white px-2 py-1 rounded border">
                        {product.blockchain.contractAddress.slice(0, 20)}...
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supply Chain Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Supply Chain Journey</h3>
          
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No supply chain events recorded yet</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Timeline Events */}
              <div className="space-y-6">
                {history.map((event, index) => (
                  <div key={index} className="relative flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${getStatusColor(event.status)} relative z-10`}>
                      {getStatusIcon(event.status)}
                    </div>

                    {/* Content */}
                    <div className="flex-grow bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 capitalize">
                          {event.status.replace(/_/g, ' ')}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.actor && (
                        <p className="text-sm text-gray-600 mb-1">
                          By: {event.actor}
                        </p>
                      )}
                      
                      {event.note && (
                        <p className="text-sm text-gray-700 mt-2">{event.note}</p>
                      )}
                      
                      {event.txHash && (
                        <div className="mt-2">
                          <code className="text-xs bg-white px-2 py-1 rounded border text-gray-600">
                            TX: {event.txHash.slice(0, 16)}...
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Farmer Information */}
        {product.farmer && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Farmer Information</h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                👨‍🌾
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{product.farmer.profile?.name || 'Verified Farmer'}</h4>
                {product.farmer.profile?.location && (
                  <p className="text-sm text-gray-600">
                    {product.farmer.profile.location.city}, {product.farmer.profile.location.state}
                  </p>
                )}
                {product.farmer.verification?.isVerified && (
                  <span className="inline-flex items-center space-x-1 text-sm text-green-600 mt-1">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Verified Farmer</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
