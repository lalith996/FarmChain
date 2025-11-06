'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import toast from 'react-hot-toast';
import { UserGroupIcon, StarIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Supplier {
  _id: string;
  name: string;
  location: string;
  products: string[];
  rating: number;
  totalOrders: number;
  verified: boolean;
}

export default function DistributorSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const mockSuppliers: Supplier[] = [
        {
          _id: '1',
          name: 'Rajesh Kumar',
          location: 'Punjab, India',
          products: ['Rice', 'Wheat', 'Corn'],
          rating: 4.8,
          totalOrders: 156,
          verified: true,
        },
        {
          _id: '2',
          name: 'Priya Sharma',
          location: 'Maharashtra, India',
          products: ['Tomatoes', 'Onions', 'Potatoes'],
          rating: 4.6,
          totalOrders: 98,
          verified: true,
        },
      ];
      setSuppliers(mockSuppliers);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Supplier Management" description="Manage your supplier relationships" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div key={supplier._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                      👨‍🌾
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{supplier.name}</h3>
                      {supplier.verified && (
                        <span className="flex items-center space-x-1 text-sm text-green-600">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{supplier.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{supplier.rating}</span>
                    <span className="text-sm text-gray-600">({supplier.totalOrders} orders)</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Products:</p>
                  <div className="flex flex-wrap gap-2">
                    {supplier.products.map((product, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
