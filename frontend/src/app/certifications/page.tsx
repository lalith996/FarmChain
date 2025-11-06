'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar } from '@/components/shared/FilterBar';
import { Pagination } from '@/components/shared/Pagination';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, DocumentTextIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Certification {
  _id: string;
  name: string;
  type: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  certificateNumber: string;
  status: 'active' | 'expired' | 'pending';
  ipfsHash?: string;
  product?: {
    name: string;
    farmer: string;
  };
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCertifications();
  }, [page, typeFilter, statusFilter]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockCerts: Certification[] = [
        {
          _id: '1',
          name: 'Organic Certification',
          type: 'Organic',
          issuer: 'India Organic Certification Agency',
          issueDate: '2024-01-15',
          expiryDate: '2025-01-15',
          certificateNumber: 'ORG-2024-001',
          status: 'active',
          product: { name: 'Organic Rice', farmer: 'Rajesh Kumar' },
        },
        {
          _id: '2',
          name: 'Fair Trade Certification',
          type: 'Fair Trade',
          issuer: 'Fair Trade India',
          issueDate: '2023-06-20',
          expiryDate: '2024-06-20',
          certificateNumber: 'FT-2023-045',
          status: 'active',
          product: { name: 'Coffee Beans', farmer: 'Priya Sharma' },
        },
        {
          _id: '3',
          name: 'GAP Certification',
          type: 'Good Agricultural Practices',
          issuer: 'Agricultural Standards Board',
          issueDate: '2023-03-10',
          expiryDate: '2024-03-10',
          certificateNumber: 'GAP-2023-089',
          status: 'expired',
          product: { name: 'Fresh Vegetables', farmer: 'Amit Patel' },
        },
      ];
      setCertifications(mockCerts);
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      toast.error('Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>,
      expired: <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Expired</span>,
      pending: <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>,
    };
    return badges[status as keyof typeof badges];
  };

  const filteredCerts = certifications.filter(cert => {
    const matchesType = typeFilter === 'all' || cert.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Certifications"
        description="View and verify product certifications"
        badge={{ text: `${filteredCerts.length} Certifications`, variant: 'success' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={fetchCertifications}
            placeholder="Search by name or certificate number..."
            filters={[
              {
                label: 'Type',
                value: typeFilter,
                onChange: setTypeFilter,
                options: [
                  { label: 'All Types', value: 'all' },
                  { label: 'Organic', value: 'Organic' },
                  { label: 'Fair Trade', value: 'Fair Trade' },
                  { label: 'GAP', value: 'Good Agricultural Practices' },
                ],
              },
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'All Status', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Expired', value: 'expired' },
                  { label: 'Pending', value: 'pending' },
                ],
              },
            ]}
          />
        </div>

        {/* Certifications Grid */}
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
        ) : filteredCerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No certifications found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCerts.map((cert) => (
                <div key={cert._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    {getStatusBadge(cert.status)}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{cert.type}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{cert.certificateNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">
                        Valid until {new Date(cert.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-1">Issued by</p>
                    <p className="text-sm font-medium text-gray-900">{cert.issuer}</p>
                  </div>

                  {cert.product && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500 mb-1">Product</p>
                      <p className="text-sm font-medium text-gray-900">{cert.product.name}</p>
                      <p className="text-xs text-gray-600">by {cert.product.farmer}</p>
                    </div>
                  )}

                  <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                    View Certificate
                  </button>
                </div>
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
