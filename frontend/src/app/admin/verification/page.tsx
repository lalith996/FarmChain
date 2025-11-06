'use client';

import { useState, useEffect } from 'react';
import { rbacAdminAPI } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface KYCSubmission {
  _id: string;
  user: {
    _id: string;
    profile: {
      name: string;
      email?: string;
    };
    role: string;
  };
  documents: Array<{
    type: string;
    ipfsHash: string;
    fileName: string;
  }>;
  businessDetails?: {
    businessName: string;
    businessType: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminVerificationPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [page, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await rbacAdminAPI.getPendingKYC({ page, limit: 10 });
      setSubmissions(response.data.data.submissions || []);
      setTotalPages(response.data.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await rbacAdminAPI.approveKYC(userId, {
        verificationLevel: 2,
        notes: 'KYC documents verified successfully',
      });
      toast.success('KYC approved successfully');
      fetchSubmissions();
      setShowModal(false);
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast.error('Failed to approve KYC');
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    try {
      await rbacAdminAPI.rejectKYC(userId, {
        reason,
        documentIssues: [],
      });
      toast.success('KYC rejected');
      fetchSubmissions();
      setShowModal(false);
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast.error('Failed to reject KYC');
    }
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (submission: KYCSubmission) => (
        <div>
          <p className="font-semibold text-gray-900">{submission.user.profile.name}</p>
          <p className="text-sm text-gray-500">{submission.user.profile.email}</p>
          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
            {submission.user.role}
          </span>
        </div>
      ),
    },
    {
      key: 'documents',
      label: 'Documents',
      render: (submission: KYCSubmission) => (
        <div className="space-y-1">
          {submission.documents.map((doc, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-sm">
              <DocumentTextIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{doc.type}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'business',
      label: 'Business',
      render: (submission: KYCSubmission) => submission.businessDetails ? (
        <div>
          <p className="font-medium text-gray-900">{submission.businessDetails.businessName}</p>
          <p className="text-sm text-gray-500">{submission.businessDetails.businessType}</p>
        </div>
      ) : '-',
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (submission: KYCSubmission) => (
        <span className="text-sm text-gray-600">
          {new Date(submission.submittedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (submission: KYCSubmission) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedSubmission(submission);
              setShowModal(true);
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
          >
            Review
          </button>
          <button
            onClick={() => handleApprove(submission.user._id)}
            className="p-1 text-green-600 hover:bg-green-50 rounded transition"
            title="Approve"
          >
            <CheckCircleIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleReject(submission.user._id, 'Documents not clear')}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            title="Reject"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Verification Queue"
        description="Review and approve KYC submissions"
        badge={{ text: `${submissions.length} Pending`, variant: 'warning' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-2">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  statusFilter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions Table */}
        <DataTable
          columns={columns}
          data={submissions}
          loading={loading}
          emptyMessage="No submissions found"
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        {/* Review Modal */}
        {showModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Review KYC Submission</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">User Information</h4>
                  <p><strong>Name:</strong> {selectedSubmission.user.profile.name}</p>
                  <p><strong>Email:</strong> {selectedSubmission.user.profile.email}</p>
                  <p><strong>Role:</strong> {selectedSubmission.user.role}</p>
                </div>

                {selectedSubmission.businessDetails && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Business Details</h4>
                    <p><strong>Business Name:</strong> {selectedSubmission.businessDetails.businessName}</p>
                    <p><strong>Business Type:</strong> {selectedSubmission.businessDetails.businessType}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Documents</h4>
                  <div className="space-y-2">
                    {selectedSubmission.documents.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded">
                        <p><strong>Type:</strong> {doc.type}</p>
                        <p className="text-sm text-gray-600"><strong>File:</strong> {doc.fileName}</p>
                        <p className="text-xs text-gray-500 break-all"><strong>IPFS:</strong> {doc.ipfsHash}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(selectedSubmission.user._id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission.user._id, 'Documents not clear')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
