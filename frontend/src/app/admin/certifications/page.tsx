'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface CertSubmission {
  _id: string;
  farmer: { name: string };
  certificateType: string;
  certificateNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export default function AdminCertificationsPage() {
  const [submissions, setSubmissions] = useState<CertSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const mockSubs: CertSubmission[] = [
        { _id: '1', farmer: { name: 'Rajesh Kumar' }, certificateType: 'Organic', certificateNumber: 'ORG-2024-001', status: 'pending', submittedAt: new Date().toISOString() },
        { _id: '2', farmer: { name: 'Priya Sharma' }, certificateType: 'Fair Trade', certificateNumber: 'FT-2023-045', status: 'pending', submittedAt: new Date(Date.now() - 86400000).toISOString() },
      ];
      setSubmissions(mockSubs);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    toast.success('Certificate approved');
    fetchSubmissions();
  };

  const handleReject = async (id: string) => {
    toast.success('Certificate rejected');
    fetchSubmissions();
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>,
      approved: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Approved</span>,
      rejected: <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Rejected</span>,
    };
    return badges[status];
  };

  const columns = [
    { key: 'farmer', label: 'Farmer', render: (s: CertSubmission) => <span className="font-medium text-gray-900">{s.farmer.name}</span> },
    { key: 'type', label: 'Type', render: (s: CertSubmission) => <span className="text-gray-700">{s.certificateType}</span> },
    { key: 'number', label: 'Certificate #', render: (s: CertSubmission) => <span className="font-mono text-sm">{s.certificateNumber}</span> },
    { key: 'status', label: 'Status', render: (s: CertSubmission) => getStatusBadge(s.status) },
    { key: 'date', label: 'Submitted', render: (s: CertSubmission) => <span className="text-sm text-gray-600">{new Date(s.submittedAt).toLocaleDateString()}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (s: CertSubmission) => s.status === 'pending' ? (
        <div className="flex items-center space-x-2">
          <button onClick={() => handleApprove(s._id)} className="p-1 text-green-600 hover:bg-green-50 rounded transition" title="Approve">
            <CheckCircleIcon className="h-5 w-5" />
          </button>
          <button onClick={() => handleReject(s._id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition" title="Reject">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      ) : null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Certification Approval" description="Review and approve farmer certifications" badge={{ text: `${submissions.filter(s => s.status === 'pending').length} Pending`, variant: 'warning' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DataTable columns={columns} data={submissions} loading={loading} emptyMessage="No submissions found" />
      </div>
    </div>
  );
}
