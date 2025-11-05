'use client';

import React, { useState, useEffect } from 'react';
import { rbacAdminAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PendingKYC {
  _id: string;
  walletAddress: string;
  profile: {
    name: string;
    email: string;
  };
  kycDocuments: Array<{
    type: string;
    ipfsHash: string;
    fileName: string;
    uploadedAt: string;
  }>;
  businessDetails?: {
    businessName: string;
    businessType: string;
    registrationNumber?: string;
    taxId?: string;
  };
  verification: {
    kycStatus: string;
    kycSubmittedAt: string;
  };
  roles: string[];
  primaryRole: string;
}

interface SystemStats {
  totalUsers: number;
  usersByRole: Record<string, number>;
  verificationStats: {
    pending: number;
    approved: number;
    rejected: number;
    notStarted: number;
  };
  activeUsers: number;
  suspendedUsers: number;
  recentRegistrations: number;
}

interface AuditLog {
  _id: string;
  userId: {
    walletAddress: string;
    profile: { name: string };
  };
  action: string;
  actionCategory: string;
  targetResource?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  isCritical: boolean;
  isSuspicious: boolean;
}

interface DocumentIssue {
  documentType: string;
  issue: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'kyc' | 'stats' | 'audit' | 'suspicious'>('kyc');
  const [pendingKYC, setPendingKYC] = useState<PendingKYC[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState<PendingKYC | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Pagination
  const [kycPage, setKycPage] = useState(1);
  const [kycTotal, setKycTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  
  // Form states
  const [verificationLevel, setVerificationLevel] = useState(1);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [documentIssues, setDocumentIssues] = useState<DocumentIssue[]>([]);

  useEffect(() => {
    if (activeTab === 'kyc') {
      fetchPendingKYC();
    } else if (activeTab === 'stats') {
      fetchSystemStats();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    } else if (activeTab === 'suspicious') {
      fetchSuspiciousActivities();
    }
  }, [activeTab, kycPage, auditPage]);

  const fetchPendingKYC = async () => {
    setLoading(true);
    try {
      const response = await rbacAdminAPI.getPendingKYC({ page: kycPage, limit: 10 });
      if (response.data.success) {
        setPendingKYC(response.data.data.users || []);
        setKycTotal(response.data.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch pending KYC:', error);
      toast.error('Failed to load pending KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    setLoading(true);
    try {
      const response = await rbacAdminAPI.getSystemStats();
      if (response.data.success) {
        setSystemStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      toast.error('Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await rbacAdminAPI.getAuditLogs({ 
        page: auditPage, 
        limit: 20,
        isCritical: false
      });
      if (response.data.success) {
        setAuditLogs(response.data.data.logs || []);
        setAuditTotal(response.data.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuspiciousActivities = async () => {
    setLoading(true);
    try {
      const response = await rbacAdminAPI.getSuspiciousActivities({ page: 1, limit: 20 });
      if (response.data.success) {
        setSuspiciousActivities(response.data.data.activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch suspicious activities:', error);
      toast.error('Failed to load suspicious activities');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKYC = async () => {
    if (!selectedKYC) return;

    try {
      const response = await rbacAdminAPI.approveKYC(selectedKYC._id, {
        verificationLevel,
        notes: approvalNotes,
      });

      if (response.data.success) {
        toast.success('KYC approved successfully');
        setShowApproveModal(false);
        setSelectedKYC(null);
        setVerificationLevel(1);
        setApprovalNotes('');
        fetchPendingKYC();
      }
    } catch (error) {
      console.error('Failed to approve KYC:', error);
      toast.error('Failed to approve KYC');
    }
  };

  const handleRejectKYC = async () => {
    if (!selectedKYC || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const response = await rbacAdminAPI.rejectKYC(selectedKYC._id, {
        reason: rejectionReason,
        documentIssues: documentIssues.length > 0 ? documentIssues : undefined,
      });

      if (response.data.success) {
        toast.success('KYC rejected');
        setShowRejectModal(false);
        setSelectedKYC(null);
        setRejectionReason('');
        setDocumentIssues([]);
        fetchPendingKYC();
      }
    } catch (error) {
      console.error('Failed to reject KYC:', error);
      toast.error('Failed to reject KYC');
    }
  };

  const addDocumentIssue = () => {
    setDocumentIssues([...documentIssues, { documentType: '', issue: '' }]);
  };

  const updateDocumentIssue = (index: number, field: 'documentType' | 'issue', value: string) => {
    const updated = [...documentIssues];
    updated[index][field] = value;
    setDocumentIssues(updated);
  };

  const removeDocumentIssue = (index: number) => {
    setDocumentIssues(documentIssues.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('kyc')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'kyc'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending KYC ({kycTotal})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            System Stats
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'audit'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('suspicious')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suspicious'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Suspicious Activities
          </button>
        </nav>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Pending KYC Tab */}
      {!loading && activeTab === 'kyc' && (
        <div>
          {pendingKYC.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pending KYC submissions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingKYC.map((kyc) => (
                <div key={kyc._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{kyc.profile.name}</h3>
                    <p className="text-sm text-gray-600">{kyc.walletAddress.slice(0, 10)}...{kyc.walletAddress.slice(-8)}</p>
                    <p className="text-sm text-gray-600">{kyc.profile.email}</p>
                  </div>

                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                      {kyc.primaryRole}
                    </span>
                  </div>

                  {kyc.businessDetails && (
                    <div className="mb-3 text-sm">
                      <p className="font-medium text-gray-700">{kyc.businessDetails.businessName}</p>
                      <p className="text-gray-600">{kyc.businessDetails.businessType}</p>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-xs text-gray-500">
                      Submitted: {formatDate(kyc.verification.kycSubmittedAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Documents: {kyc.kycDocuments.length}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedKYC(kyc);
                        setShowApproveModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedKYC(kyc);
                        setShowRejectModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {kycTotal > 10 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setKycPage(Math.max(1, kycPage - 1))}
                disabled={kycPage === 1}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {kycPage} of {Math.ceil(kycTotal / 10)}
              </span>
              <button
                onClick={() => setKycPage(kycPage + 1)}
                disabled={kycPage >= Math.ceil(kycTotal / 10)}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* System Stats Tab */}
      {!loading && activeTab === 'stats' && systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{systemStats.totalUsers}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{systemStats.activeUsers}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Suspended Users</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{systemStats.suspendedUsers}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Recent Registrations</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{systemStats.recentRegistrations}</p>
          </div>

          {/* Users by Role */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
            <div className="space-y-2">
              {Object.entries(systemStats.usersByRole).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-gray-700">{role}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Stats */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Pending</span>
                <span className="font-semibold text-yellow-600">{systemStats.verificationStats.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Approved</span>
                <span className="font-semibold text-green-600">{systemStats.verificationStats.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Rejected</span>
                <span className="font-semibold text-red-600">{systemStats.verificationStats.rejected}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Not Started</span>
                <span className="font-semibold text-gray-600">{systemStats.verificationStats.notStarted}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {!loading && activeTab === 'audit' && (
        <div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.userId?.profile?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.actionCategory}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.isCritical && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                          Critical
                        </span>
                      )}
                      {log.isSuspicious && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800 ml-1">
                          Suspicious
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {auditTotal > 20 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setAuditPage(Math.max(1, auditPage - 1))}
                disabled={auditPage === 1}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {auditPage} of {Math.ceil(auditTotal / 20)}
              </span>
              <button
                onClick={() => setAuditPage(auditPage + 1)}
                disabled={auditPage >= Math.ceil(auditTotal / 20)}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Suspicious Activities Tab */}
      {!loading && activeTab === 'suspicious' && (
        <div className="space-y-4">
          {suspiciousActivities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No suspicious activities detected</p>
            </div>
          ) : (
            suspiciousActivities.map((activity) => (
              <div key={activity._id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-red-900">{activity.action}</h3>
                    <p className="text-sm text-red-700 mt-1">
                      User: {activity.userId?.profile?.name || 'Unknown'} ({activity.userId?.walletAddress})
                    </p>
                    <p className="text-sm text-red-700">Category: {activity.actionCategory}</p>
                    {activity.metadata && (
                      <pre className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                  <span className="text-xs text-red-600">{formatDate(activity.timestamp)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedKYC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Approve KYC</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900">{selectedKYC.profile.name}</h3>
              <p className="text-sm text-gray-600">{selectedKYC.walletAddress}</p>
            </div>

            {/* Documents */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Submitted Documents</h4>
              <div className="space-y-2">
                {selectedKYC.kycDocuments.map((doc, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                      <p className="text-xs text-gray-500">{doc.fileName}</p>
                    </div>
                    <a
                      href={`https://ipfs.io/ipfs/${doc.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View on IPFS
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Level */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Level (0-3)
              </label>
              <input
                type="number"
                min="0"
                max="3"
                value={verificationLevel}
                onChange={(e) => setVerificationLevel(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                0: Basic, 1: Standard, 2: Enhanced, 3: Premium
              </p>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedKYC(null);
                  setVerificationLevel(1);
                  setApprovalNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveKYC}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve KYC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedKYC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject KYC</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900">{selectedKYC.profile.name}</h3>
              <p className="text-sm text-gray-600">{selectedKYC.walletAddress}</p>
            </div>

            {/* Rejection Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Explain why the KYC is being rejected..."
                required
              />
            </div>

            {/* Document Issues */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Issues (Optional)
              </label>
              {documentIssues.map((issue, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <select
                    value={issue.documentType}
                    onChange={(e) => updateDocumentIssue(index, 'documentType', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select document</option>
                    {selectedKYC.kycDocuments.map((doc, i) => (
                      <option key={i} value={doc.type}>
                        {doc.type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={issue.issue}
                    onChange={(e) => updateDocumentIssue(index, 'issue', e.target.value)}
                    placeholder="Issue description"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={() => removeDocumentIssue(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addDocumentIssue}
                className="text-sm text-blue-600 hover:underline"
              >
                + Add Document Issue
              </button>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedKYC(null);
                  setRejectionReason('');
                  setDocumentIssues([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectKYC}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
