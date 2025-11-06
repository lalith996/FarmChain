'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import { getRoleTheme } from '@/config/roleThemes';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CameraIcon,
  CheckCircleIcon,
  TrophyIcon,
  ShoppingBagIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const theme = getRoleTheme('CONSUMER');
  const user = { name: 'John Customer', email: 'john@example.com' };
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'preferences'>('personal');
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Customer',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    address: '123 Main Street, Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    bio: 'Food enthusiast and organic produce lover. Always looking for fresh, quality ingredients!',
  });

  const accountStats = {
    memberSince: '2023-01-15',
    totalOrders: 47,
    totalSpent: 1247.89,
    loyaltyPoints: 2450,
    reviewsWritten: 12,
    wishlistItems: 6,
    completedOrders: 45,
    cancelledOrders: 2,
  };

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    console.log('Profile updated:', profileData);
  };

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

        {/* Profile Header */}
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-8 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-purple-600">
                  {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-lg hover:bg-gray-50">
                  <CameraIcon className="h-4 w-4 text-purple-600" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-purple-100 mb-2">{profileData.email}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Member since {new Date(accountStats.memberSince).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Verified Account</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-white/20 p-3">
                <div className="text-2xl font-bold text-white">{accountStats.totalOrders}</div>
                <div className="text-sm text-purple-100">Orders</div>
              </div>
              <div className="rounded-lg bg-white/20 p-3">
                <div className="text-2xl font-bold text-white">{accountStats.reviewsWritten}</div>
                <div className="text-sm text-purple-100">Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Orders"
            value={accountStats.totalOrders}
            subtitle={`${accountStats.completedOrders} completed`}
            icon={ShoppingBagIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Total Spent"
            value={`$${accountStats.totalSpent.toFixed(2)}`}
            subtitle="All time"
            icon={CheckCircleIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Loyalty Points"
            value={accountStats.loyaltyPoints}
            subtitle="Available to redeem"
            icon={TrophyIcon}
            gradient="from-yellow-500 to-orange-500"
          />
          <AdvancedStatCard
            title="Wishlist"
            value={accountStats.wishlistItems}
            subtitle="Saved items"
            icon={HeartIcon}
            gradient="from-pink-500 to-rose-500"
          />
        </StatCardsGrid>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'personal', label: 'Personal Information' },
            { id: 'security', label: 'Security & Privacy' },
            { id: 'preferences', label: 'Preferences' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-600'}`}
            >
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />}
            </button>
          ))}
        </div>

        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="rounded-xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 font-bold text-white hover:shadow-lg"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 font-bold text-white hover:shadow-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border-2 border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <UserCircleIcon className="h-4 w-4" />
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full rounded-lg border border-gray-300 px-4 py-2 ${!isEditing && 'bg-gray-50'}`}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <UserCircleIcon className="h-4 w-4" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full rounded-lg border border-gray-300 px-4 py-2 ${!isEditing && 'bg-gray-50'}`}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="h-4 w-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full rounded-lg border border-gray-300 px-4 py-2 ${!isEditing && 'bg-gray-50'}`}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="h-4 w-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full rounded-lg border border-gray-300 px-4 py-2 ${!isEditing && 'bg-gray-50'}`}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border border-gray-300 px-4 py-2 ${!isEditing && 'bg-gray-50'}`}
                />
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="h-4 w-4" />
                  Street Address
                </label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border border-gray-300 px-4 py-2 ${!isEditing && 'bg-gray-50'}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">City</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full rounded-lg border border-gray-300 px-4 py-2 ${!isEditing && 'bg-gray-50'}`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">State</label>
                  <input
                    type="text"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full rounded-lg border border-gray-300 px-4 py-2 ${!isEditing && 'bg-gray-50'}`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">ZIP Code</label>
                  <input
                    type="text"
                    value={profileData.zip}
                    onChange={(e) => setProfileData({ ...profileData, zip: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full rounded-lg border border-gray-300 px-4 py-2 ${!isEditing && 'bg-gray-50'}`}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full rounded-lg border border-gray-300 px-4 py-2 ${!isEditing && 'bg-gray-50'}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Security & Privacy Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
                <button className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-bold text-white hover:shadow-lg">
                  Update Password
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button className="rounded-lg border-2 border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50">
                  Enable
                </button>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy Settings</h2>
              <div className="space-y-4">
                {[
                  { label: 'Show profile to other users', description: 'Allow other users to see your profile' },
                  { label: 'Show order history', description: 'Display your order history on your profile' },
                  { label: 'Show reviews publicly', description: 'Make your product reviews visible to everyone' },
                  { label: 'Allow marketing emails', description: 'Receive promotional offers and updates' },
                ].map((setting, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                    <div>
                      <div className="font-semibold text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.description}</div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" defaultChecked={idx < 2} />
                      <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-purple-600 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Dietary Preferences */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Dietary Preferences</h2>
              <div className="grid grid-cols-2 gap-4">
                {['Organic Only', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'].map((pref) => (
                  <label key={pref} className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:border-purple-500">
                    <input type="checkbox" className="h-4 w-4 rounded text-purple-600" />
                    <span className="font-medium">{pref}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Communication Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Order Updates', description: 'Notifications about your order status' },
                  { label: 'Promotional Emails', description: 'Special offers and new products' },
                  { label: 'Weekly Newsletter', description: 'Recipes, tips, and featured products' },
                  { label: 'SMS Notifications', description: 'Delivery updates via text message' },
                ].map((comm, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                    <div>
                      <div className="font-semibold text-gray-900">{comm.label}</div>
                      <div className="text-sm text-gray-600">{comm.description}</div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" defaultChecked />
                      <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-purple-600 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
