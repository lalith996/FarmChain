'use client';

import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar } from '@/components/shared/FilterBar';
import { Pagination } from '@/components/shared/Pagination';
import type { User } from '@/types';
import toast from 'react-hot-toast';
import { MapPinIcon, StarIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFarmers();
  }, [page, locationFilter, verificationFilter]);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 12, role: 'farmer' };
      if (locationFilter !== 'all') params.location = locationFilter;
      if (verificationFilter !== 'all') params.isVerified = verificationFilter === 'verified';
      if (searchQuery) params.search = searchQuery;

      const response = await userAPI.search(params);
      setFarmers(response.data.data.users || []);
      setTotalPages(response.data.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      toast.error('Failed to load farmers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Farmers Directory"
        description="Connect with verified farmers across the country"
        badge={{ text: `${farmers.length} Farmers`, variant: 'success' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={fetchFarmers}
            placeholder="Search farmers by name or location..."
            filters={[
              {
                label: 'Location',
                value: locationFilter,
                onChange: setLocationFilter,
                options: [
                  { label: 'All Locations', value: 'all' },
                  { label: 'Maharashtra', value: 'maharashtra' },
                  { label: 'Punjab', value: 'punjab' },
                  { label: 'Karnataka', value: 'karnataka' },
                  { label: 'Tamil Nadu', value: 'tamilnadu' },
                ],
              },
              {
                label: 'Verification',
                value: verificationFilter,
                onChange: setVerificationFilter,
                options: [
                  { label: 'All', value: 'all' },
                  { label: 'Verified Only', value: 'verified' },
                  { label: 'Unverified', value: 'unverified' },
                ],
              },
            ]}
          />
        </div>

        {/* Farmers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full" />
                  <div className="flex-grow space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : farmers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">👨‍🌾</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No farmers found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farmers.map((farmer) => (
                <Link
                  key={farmer._id}
                  href={`/farmer/profile/${farmer._id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                      {farmer.profile?.avatar || '👨‍🌾'}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-gray-900 truncate">
                          {farmer.profile?.name || 'Farmer'}
                        </h3>
                        {farmer.verification?.isVerified && (
                          <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      {farmer.profile?.location && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4" />
                          <span className="truncate">
                            {farmer.profile.location.city}, {farmer.profile.location.state}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  {farmer.rating && farmer.rating.count > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="font-semibold">{farmer.rating.average.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-gray-500">({farmer.rating.count} reviews)</span>
                    </div>
                  )}

                  {/* Verification Badge */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    {farmer.verification?.isVerified ? (
                      <span className="flex items-center space-x-1 text-sm text-green-600">
                        <ShieldCheckIcon className="h-4 w-4" />
                        <span>Verified Farmer</span>
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Pending Verification</span>
                    )}
                    <span className="text-sm text-green-600 font-medium">View Profile →</span>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
