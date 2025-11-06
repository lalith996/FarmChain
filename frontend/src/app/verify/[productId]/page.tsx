'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { PageHeader } from '@/components/shared/PageHeader';
import Link from 'next/link';

export default function VerifyProductPage() {
  const params = useParams();
  const productId = params.productId as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyProduct();
  }, [productId]);

  const verifyProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/qr/verify/product/${productId}`
      );
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Verification Failed" description="Unable to verify product" />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/marketplace"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Product Verification"
        description="Blockchain-verified product information"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-center mb-6">
            {data.blockchain.verified ? (
              <div className="text-center">
                <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ✓ Verified Product
                </h2>
                <p className="text-gray-600">
                  This product is registered on the blockchain
                </p>
              </div>
            ) : (
              <div className="text-center">
                <ShieldCheckIcon className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Product Found
                </h2>
                <p className="text-gray-600">
                  Product exists but not yet blockchain verified
                </p>
              </div>
            )}
          </div>

          {/* Blockchain Info */}
          {data.blockchain.verified && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">Blockchain Details</h3>
              <div className="space-y-1 text-sm">
                <p className="text-green-800">
                  <span className="font-medium">Transaction Hash:</span>{' '}
                  <span className="font-mono text-xs break-all">
                    {data.blockchain.txHash}
                  </span>
                </p>
                {data.blockchain.registeredAt && (
                  <p className="text-green-800">
                    <span className="font-medium">Registered:</span>{' '}
                    {new Date(data.blockchain.registeredAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Product Information</h3>
          
          {data.product.images && data.product.images[0] && (
            <img
              src={data.product.images[0]}
              alt={data.product.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Product Name</p>
              <p className="font-semibold text-gray-900">{data.product.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-semibold text-gray-900">{data.product.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-semibold text-gray-900">
                ₹{data.product.price}/{data.product.unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quality Grade</p>
              <p className="font-semibold text-gray-900">Grade {data.product.qualityGrade}</p>
            </div>
          </div>

          {data.product.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-gray-900">{data.product.description}</p>
            </div>
          )}

          {data.isOrganic && (
            <div className="mt-4">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🌱 Organic
              </span>
            </div>
          )}
        </div>

        {/* Farmer Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Farmer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Farmer Name</p>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-gray-900">{data.farmer.name}</p>
                {data.farmer.verified && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" title="Verified Farmer" />
                )}
              </div>
            </div>
            {data.farmer.location && (
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">{data.farmer.location}</p>
              </div>
            )}
            {data.farmer.rating && (
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="font-semibold text-gray-900">
                  ⭐ {data.farmer.rating.toFixed(1)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {data.certifications.map((cert: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-4">
          <Link
            href={`/products/${data.product.id}`}
            className="flex-1 px-6 py-3 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition font-medium"
          >
            View Full Details
          </Link>
          <Link
            href="/marketplace"
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 text-center rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Browse More Products
          </Link>
        </div>
      </div>
    </div>
  );
}
