'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { rbacAdminAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import RoleSelector from './RoleSelector';

interface User {
  _id: string;
  walletAddress: string;
  roles: string[];
  primaryRole: string;
  profile: {
    name: string;
    email: string;
  };
  verification: {
    isVerified: boolean;
    kycStatus: string;
    verificationLevel: number;
  };
  status: {
    isActive: boolean;
    isSuspended: boolean;
  };
  createdAt: string;
}

interface UserRBACDetails {
  user: User;
  permissions: string[];
  rateLimitStatus: {
    isBlocked: boolean;
    violations: number;
  };
}

export const UserManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserRBACDetails | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | ''>('');
  const [suspendedFilter, setSuspendedFilter] = useState<boolean | ''>('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;
  
  // Modals
  const [showGrantRoleModal, setShowGrantRoleModal] = useState(false);
  const [showRevokeRoleModal, setShowRevokeRoleModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Form states
  const [selectedRole, setSelectedRole] = useState('');
  const [reason, setReason] = useState('');
  const [syncToBlockchain, setSyncToBlockchain] = useState(false);
  const [suspendDuration, setSuspendDuration] = useState<number | ''>('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        limit,
        search: searchQuery || undefined,
        role: roleFilter || undefined,
        kycStatus: kycStatusFilter || undefined,
        isVerified: verifiedFilter !== '' ? verifiedFilter : undefined,
        isSuspended: suspendedFilter !== '' ? suspendedFilter : undefined,
      };

      const response = await rbacAdminAPI.getAllUsers(params);
      if (response.data.success) {
        setUsers(response.data.data.users || []);
        setTotal(response.data.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, roleFilter, kycStatusFilter, verifiedFilter, suspendedFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await rbacAdminAPI.getUserRBAC(userId);
      if (response.data.success) {
        setUserDetails(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const handleGrantRole = async () => {
    if (!selectedUser || !selectedRole || !reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await rbacAdminAPI.grantRole(selectedUser._id, {
        role: selectedRole,
        reason,
        syncToBlockchain,
      });

      if (response.data.success) {
        toast.success('Role granted successfully');
        setShowGrantRoleModal(false);
        resetFormStates();
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to grant role:', error);
      toast.error('Failed to grant role');
    }
  };

  const handleRevokeRole = async () => {
    if (!selectedUser || !selectedRole || !reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await rbacAdminAPI.revokeRole(selectedUser._id, {
        role: selectedRole,
        reason,
      });

      if (response.data.success) {
        toast.success('Role revoked successfully');
        setShowRevokeRoleModal(false);
        resetFormStates();
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to revoke role:', error);
      toast.error('Failed to revoke role');
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser || !reason) {
      toast.error('Please provide a suspension reason');
      return;
    }

    try {
      const response = await rbacAdminAPI.suspendUser(selectedUser._id, {
        reason,
        duration: suspendDuration !== '' ? Number(suspendDuration) : undefined,
      });

      if (response.data.success) {
        toast.success('User suspended successfully');
        setShowSuspendModal(false);
        resetFormStates();
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to suspend user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleReactivateUser = async (userId: string) => {
    const reactivateReason = prompt('Enter reason for reactivation:');
    if (!reactivateReason) return;

    try {
      const response = await rbacAdminAPI.reactivateUser(userId, {
        reason: reactivateReason,
      });

      if (response.data.success) {
        toast.success('User reactivated successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to reactivate user:', error);
      toast.error('Failed to reactivate user');
    }
  };

  const handleResetRateLimits = async (userId: string) => {
    try {
      const response = await rbacAdminAPI.resetRateLimits(userId);
      if (response.data.success) {
        toast.success('Rate limits reset successfully');
      }
    } catch (error) {
      console.error('Failed to reset rate limits:', error);
      toast.error('Failed to reset rate limits');
    }
  };

  const handleBlockUser = async (userId: string) => {
    const blockReason = prompt('Enter reason for blocking:');
    if (!blockReason) return;

    const durationStr = prompt('Enter block duration in hours (leave empty for permanent):');
    const duration = durationStr ? parseInt(durationStr) : undefined;

    try {
      const response = await rbacAdminAPI.blockUser(userId, {
        reason: blockReason,
        duration,
      });

      if (response.data.success) {
        toast.success('User blocked successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to block user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    const unblockReason = prompt('Enter reason for unblocking:');
    if (!unblockReason) return;

    try {
      const response = await rbacAdminAPI.unblockUser(userId, {
        reason: unblockReason,
      });

      if (response.data.success) {
        toast.success('User unblocked successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to unblock user:', error);
      toast.error('Failed to unblock user');
    }
  };

  const handleUpdateVerificationLevel = async (userId: string) => {
    const levelStr = prompt('Enter new verification level (0-3):');
    if (!levelStr) return;

    const level = parseInt(levelStr);
    if (level < 0 || level > 3) {
      toast.error('Verification level must be between 0 and 3');
      return;
    }

    const updateReason = prompt('Enter reason for verification level update:');
    if (!updateReason) return;

    try {
      const response = await rbacAdminAPI.updateVerificationLevel(userId, {
        level,
        reason: updateReason,
      });

      if (response.data.success) {
        toast.success('Verification level updated');
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update verification level:', error);
      toast.error('Failed to update verification level');
    }
  };

  const resetFormStates = () => {
    setSelectedUser(null);
    setSelectedRole('');
    setReason('');
    setSyncToBlockchain(false);
    setSuspendDuration('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="Search by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="FARMER">Farmer</option>
            <option value="DISTRIBUTOR">Distributor</option>
            <option value="RETAILER">Retailer</option>
            <option value="CONSUMER">Consumer</option>
          </select>

          <select
            value={kycStatusFilter}
            onChange={(e) => setKycStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All KYC Status</option>
            <option value="not_started">Not Started</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={verifiedFilter.toString()}
            onChange={(e) => setVerifiedFilter(e.target.value === '' ? '' : e.target.value === 'true')}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>

          <select
            value={suspendedFilter.toString()}
            onChange={(e) => setSuspendedFilter(e.target.value === '' ? '' : e.target.value === 'true')}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Suspended</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('');
              setKycStatusFilter('');
              setVerifiedFilter('');
              setSuspendedFilter('');
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KYC Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.profile.name}</div>
                      <div className="text-sm text-gray-500">{user.profile.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getKYCStatusColor(user.verification.kycStatus)}`}>
                        {user.verification.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status.isSuspended ? (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="relative inline-block text-left">
                        <select
                          onChange={(e) => {
                            const action = e.target.value;
                            e.target.value = '';
                            
                            switch (action) {
                              case 'view':
                                setSelectedUser(user);
                                fetchUserDetails(user._id);
                                setShowDetailsModal(true);
                                break;
                              case 'grant':
                                setSelectedUser(user);
                                setShowGrantRoleModal(true);
                                break;
                              case 'revoke':
                                setSelectedUser(user);
                                setShowRevokeRoleModal(true);
                                break;
                              case 'suspend':
                                setSelectedUser(user);
                                setShowSuspendModal(true);
                                break;
                              case 'reactivate':
                                handleReactivateUser(user._id);
                                break;
                              case 'reset':
                                handleResetRateLimits(user._id);
                                break;
                              case 'block':
                                handleBlockUser(user._id);
                                break;
                              case 'unblock':
                                handleUnblockUser(user._id);
                                break;
                              case 'verification':
                                handleUpdateVerificationLevel(user._id);
                                break;
                            }
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Actions</option>
                          <option value="view">View Details</option>
                          <option value="grant">Grant Role</option>
                          <option value="revoke">Revoke Role</option>
                          {!user.status.isSuspended ? (
                            <option value="suspend">Suspend User</option>
                          ) : (
                            <option value="reactivate">Reactivate User</option>
                          )}
                          <option value="reset">Reset Rate Limits</option>
                          <option value="block">Block User</option>
                          <option value="unblock">Unblock User</option>
                          <option value="verification">Update Verification Level</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Grant Role Modal */}
      {showGrantRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Grant Role</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">User: {selectedUser.profile.name}</p>
              <p className="text-sm text-gray-600">Current roles: {selectedUser.roles.join(', ')}</p>
            </div>

            <RoleSelector
              value={selectedRole}
              onChange={setSelectedRole}
              label="Select Role to Grant"
              required
            />

            <div className="mb-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Explain why you're granting this role..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={syncToBlockchain}
                  onChange={(e) => setSyncToBlockchain(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Sync to blockchain</span>
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowGrantRoleModal(false);
                  resetFormStates();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGrantRole}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Grant Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Role Modal */}
      {showRevokeRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Revoke Role</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">User: {selectedUser.profile.name}</p>
              <p className="text-sm text-gray-600">Current roles: {selectedUser.roles.join(', ')}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Role to Revoke *
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a role</option>
                {selectedUser.roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Explain why you're revoking this role..."
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRevokeRoleModal(false);
                  resetFormStates();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeRole}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Revoke Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Suspend User</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">User: {selectedUser.profile.name}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Explain why you're suspending this user..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours, optional)
              </label>
              <input
                type="number"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Leave empty for indefinite suspension"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  resetFormStates();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Suspend User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
                <p className="text-sm"><span className="font-medium">Name:</span> {userDetails.user.profile.name}</p>
                <p className="text-sm"><span className="font-medium">Email:</span> {userDetails.user.profile.email}</p>
                <p className="text-sm"><span className="font-medium">Wallet:</span> {userDetails.user.walletAddress}</p>
                <p className="text-sm"><span className="font-medium">Joined:</span> {formatDate(userDetails.user.createdAt)}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Verification</h3>
                <p className="text-sm"><span className="font-medium">KYC Status:</span> {userDetails.user.verification.kycStatus}</p>
                <p className="text-sm"><span className="font-medium">Verified:</span> {userDetails.user.verification.isVerified ? 'Yes' : 'No'}</p>
                <p className="text-sm"><span className="font-medium">Level:</span> {userDetails.user.verification.verificationLevel}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Roles</h3>
              <div className="flex flex-wrap gap-2">
                {userDetails.user.roles.map((role) => (
                  <span key={role} className="px-3 py-1 text-sm font-medium rounded bg-blue-100 text-blue-800">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Permissions ({userDetails.permissions.length})</h3>
              <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded">
                <div className="flex flex-wrap gap-1">
                  {userDetails.permissions.map((permission) => (
                    <span key={permission} className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Rate Limit Status</h3>
              <p className="text-sm">
                <span className="font-medium">Blocked:</span>{' '}
                {userDetails.rateLimitStatus.isBlocked ? (
                  <span className="text-red-600">Yes</span>
                ) : (
                  <span className="text-green-600">No</span>
                )}
              </p>
              <p className="text-sm">
                <span className="font-medium">Violations:</span> {userDetails.rateLimitStatus.violations}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setUserDetails(null);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPanel;
