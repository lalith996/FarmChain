'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  StarIcon,
  PencilIcon,
  WalletIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import { DashboardStats } from '@/types';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchProfileData();
  }, [isAuthenticated, router]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'farmer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'distributor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'retailer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'consumer':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-green-400 to-blue-500"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex items-start justify-between -mt-16 mb-4">
              {/* Avatar */}
              <div className="relative">
                {user.profile?.avatar ? (
                  <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden">
                    <Image
                      src={user.profile.avatar}
                      alt={user.profile.name || 'User avatar'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                    <UserCircleIcon className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                {user.verification.isVerified && (
                  <div className="absolute bottom-2 right-2 bg-green-600 rounded-full p-1">
                    <CheckBadgeIcon className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <Link
                href="/profile/edit"
                className="mt-20 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </div>

            {/* Name and Role */}
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.profile?.name || 'Anonymous User'}
                </h1>
                {user.verification.isVerified && (
                  <CheckBadgeIcon className="w-7 h-7 text-green-600" />
                )}
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>

            {/* Rating */}
            {user.rating && user.rating.count > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(user.rating.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {user.rating.average.toFixed(1)}
                </span>
                <span className="text-sm text-gray-600">
                  ({user.rating.count} reviews)
                </span>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              {/* Email */}
              {user.profile?.email && (
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="w-5 h-5 mr-3" />
                  <span>{user.profile.email}</span>
                </div>
              )}

              {/* Phone */}
              {user.profile?.phone && (
                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="w-5 h-5 mr-3" />
                  <span>{user.profile.phone}</span>
                </div>
              )}

              {/* Location */}
              {user.profile?.location && (
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="w-5 h-5 mr-3" />
                  <span>
                    {user.profile.location.city}, {user.profile.location.state},{' '}
                    {user.profile.location.country}
                  </span>
                </div>
              )}

              {/* Wallet Address */}
              <div className="flex items-center text-gray-600">
                <WalletIcon className="w-5 h-5 mr-3" />
                <span className="font-mono text-sm">
                  {formatWalletAddress(user.walletAddress)}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.walletAddress);
                    toast.success('Wallet address copied!');
                  }}
                  className="ml-2 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics */}
            {stats && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Total Orders */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalOrders || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>

                  {/* Revenue/Spending */}
                  {user.role === 'farmer' ? (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{(stats.totalRevenue || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                  ) : (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{(stats.totalSpent || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                  )}

                  {/* Active Products/Orders */}
                  {user.role === 'farmer' ? (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <ShoppingBagIcon className="w-8 h-8 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.activeProducts || 0}
                      </p>
                      <p className="text-sm text-gray-600">Active Products</p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <ShoppingBagIcon className="w-8 h-8 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.activeOrders || 0}
                      </p>
                      <p className="text-sm text-gray-600">Active Orders</p>
                    </div>
                  )}

                  {/* Rating */}
                  {user.rating && user.rating.count > 0 && (
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <StarIcon className="w-8 h-8 text-pink-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.rating.average.toFixed(1)} ⭐
                      </p>
                      <p className="text-sm text-gray-600">User Rating</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/orders"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBagIcon className="w-5 h-5 mr-2" />
                  View Orders
                </Link>

                {user.role === 'farmer' && (
                  <Link
                    href="/products/new"
                    className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Product
                  </Link>
                )}

                {user.role !== 'farmer' && (
                  <Link
                    href="/products"
                    className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Browse Products
                  </Link>
                )}

                <Link
                  href="/settings"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Settings
                </Link>

                {!user.verification.isVerified && (
                  <Link
                    href="/profile/verify"
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    Verify Account
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Verification Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-gray-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">Verification</h2>
              </div>

              <div className="space-y-3">
                {/* Account Verification */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account</span>
                  {user.verification.isVerified ? (
                    <span className="flex items-center text-green-600 font-medium">
                      <CheckBadgeIcon className="w-5 h-5 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-gray-500">Not Verified</span>
                  )}
                </div>

                {/* KYC Status */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">KYC</span>
                  <span
                    className={`font-medium ${getKycStatusColor(
                      user.verification.kycStatus
                    )}`}
                  >
                    {user.verification.kycStatus.charAt(0).toUpperCase() +
                      user.verification.kycStatus.slice(1)}
                  </span>
                </div>
              </div>

              {!user.verification.isVerified && (
                <Link
                  href="/profile/verify"
                  className="mt-4 block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Complete Verification
                </Link>
              )}
            </div>

            {/* Member Since */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Member Since</h3>
              <p className="text-gray-600">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Account Status</h3>
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    user.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                <span className="text-gray-600">
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
