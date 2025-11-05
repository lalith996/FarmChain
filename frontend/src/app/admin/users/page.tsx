'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserCircleIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { adminAPI } from '@/lib/api';
import { User } from '@/types';
import toast from 'react-hot-toast';

type UserRole = 'all' | 'farmer' | 'distributor' | 'retailer' | 'consumer' | 'admin';
type KycStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole>('all');
  const [kycFilter, setKycFilter] = useState<KycStatus>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (currentUser?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUser, page, roleFilter, kycFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: 15,
      };

      if (roleFilter !== 'all') params.role = roleFilter;
      if (kycFilter !== 'all') params.kycStatus = kycFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await adminAPI.getAllUsers(params);
      setUsers(response.data.users || response.data);
      
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleVerifyKYC = async (userId: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status === 'approved' ? 'approve' : 'reject'} this KYC?`)) {
      return;
    }

    try {
      await adminAPI.updateUser(userId, { kycStatus: status });
      toast.success(`KYC ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      fetchUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update KYC status');
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    if (!confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      await adminAPI.updateUser(userId, { isActive: !isActive });
      toast.success(`User ${isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'farmer':
        return 'bg-green-100 text-green-800';
      case 'distributor':
        return 'bg-blue-100 text-blue-800';
      case 'retailer':
        return 'bg-purple-100 text-purple-800';
      case 'consumer':
        return 'bg-orange-100 text-orange-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">View and manage all platform users</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or wallet..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </form>

            {/* Role Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as UserRole);
                  setPage(1);
                }}
                aria-label="Filter by role"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Roles</option>
                <option value="farmer">Farmer</option>
                <option value="distributor">Distributor</option>
                <option value="retailer">Retailer</option>
                <option value="consumer">Consumer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* KYC Filter */}
            <div className="relative">
              <ShieldCheckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={kycFilter}
                onChange={(e) => {
                  setKycFilter(e.target.value as KycStatus);
                  setPage(1);
                }}
                aria-label="Filter by KYC status"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="all">All KYC Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KYC Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.profile?.avatar ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                            <Image
                              src={user.profile.avatar}
                              alt={user.profile.name || 'User'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <UserCircleIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {user.profile?.name || 'Anonymous'}
                            </p>
                            {user.verification.isVerified && (
                              <CheckBadgeIcon className="w-4 h-4 text-green-600 ml-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-mono">
                            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.profile?.email || '-'}</div>
                      <div className="text-xs text-gray-500">{user.profile?.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getKycStatusColor(user.verification.kycStatus)}`}>
                        {user.verification.kycStatus.charAt(0).toUpperCase() + user.verification.kycStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        {user.verification.kycStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerifyKYC(user._id, 'approved')}
                              className="text-green-600 hover:text-green-700 font-medium"
                              title="Approve KYC"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerifyKYC(user._id, 'rejected')}
                              className="text-red-600 hover:text-red-700 font-medium"
                              title="Reject KYC"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`${
                            user.isActive 
                              ? 'text-red-600 hover:text-red-700' 
                              : 'text-green-600 hover:text-green-700'
                          } font-medium`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && !loading && (
            <div className="text-center py-12">
              <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
