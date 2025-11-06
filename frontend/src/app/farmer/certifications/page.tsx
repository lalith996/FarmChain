'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, PlusIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface Certification {
  _id: string;
  name: string;
  type: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
  document?: string;
}

export default function FarmerCertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const mockCerts: Certification[] = [
        {
          _id: '1',
          name: 'Organic Certification',
          type: 'Organic',
          certificateNumber: 'ORG-2024-001',
          issueDate: '2024-01-15',
          expiryDate: '2025-01-15',
          status: 'active',
        },
        {
          _id: '2',
          name: 'Fair Trade Certification',
          type: 'Fair Trade',
          certificateNumber: 'FT-2023-045',
          issueDate: '2023-06-20',
          expiryDate: '2024-06-20',
          status: 'pending',
        },
      ];
      setCertifications(mockCerts);
    } catch (error) {
      toast.error('Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      active: <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>,
      expired: <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Expired</span>,
      pending: <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending Approval</span>,
    };
    return badges[status];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Manage Certifications"
        description="Upload and manage your farming certifications"
        action={{
          label: 'Upload Certificate',
          onClick: () => setShowUploadModal(true),
          icon: <PlusIcon className="h-5 w-5" />,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : certifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No certifications yet</h3>
            <p className="text-gray-600 mb-4">Upload your first certification to build trust with buyers</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Upload Certificate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
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

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    View
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Certification</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option>Organic Certification</option>
                    <option>Fair Trade</option>
                    <option>GAP Certification</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Number</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document</label>
                  <input type="file" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.success('Certificate uploaded successfully');
                      setShowUploadModal(false);
                    }}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
