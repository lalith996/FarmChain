'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { getRoleTheme } from '@/config/roleThemes';
import {
  BuildingStorefrontIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PhotoIcon,
  UsersIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default function RetailerStorePage() {
  const theme = getRoleTheme('RETAILER');
  const [activeTab, setActiveTab] = useState<'details' | 'hours' | 'staff' | 'photos'>('details');

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your store details, hours, and team
            </p>
          </div>
          <button className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl">
            Save Changes
          </button>
        </div>

        {/* Store Overview Card */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-start gap-6">
            <div className="h-32 w-32 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <BuildingStorefrontIcon className="h-16 w-16 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Fresh Farm Market</h2>
              <p className="mt-1 text-gray-600">Premium organic produce and groceries</p>
              <div className="mt-4 flex gap-6">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold">4.8/5.0</span>
                  <span className="text-gray-500">(234 reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPinIcon className="h-5 w-5" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'details', label: 'Store Details', icon: BuildingStorefrontIcon },
              { id: 'hours', label: 'Operating Hours', icon: ClockIcon },
              { id: 'staff', label: 'Staff', icon: UsersIcon },
              { id: 'photos', label: 'Photos', icon: PhotoIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">Store Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Store Name</label>
                <input
                  type="text"
                  defaultValue="Fresh Farm Market"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Store Type</label>
                <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                  <option>Grocery Store</option>
                  <option>Organic Market</option>
                  <option>Farmers Market</option>
                  <option>Convenience Store</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={4}
                  defaultValue="We offer the freshest organic produce, sourced directly from local farmers. Our mission is to provide healthy, sustainable food options to our community."
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Full Address</label>
                <input
                  type="text"
                  defaultValue="123 Main Street, San Francisco, CA 94102"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  defaultValue="contact@freshfarmmarket.com"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  defaultValue="https://freshfarmmarket.com"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                <input
                  type="text"
                  defaultValue="12-3456789"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">Operating Hours</h3>
            <div className="space-y-4">
              {[
                { day: 'Monday', open: '08:00', close: '20:00', closed: false },
                { day: 'Tuesday', open: '08:00', close: '20:00', closed: false },
                { day: 'Wednesday', open: '08:00', close: '20:00', closed: false },
                { day: 'Thursday', open: '08:00', close: '20:00', closed: false },
                { day: 'Friday', open: '08:00', close: '21:00', closed: false },
                { day: 'Saturday', open: '09:00', close: '21:00', closed: false },
                { day: 'Sunday', open: '09:00', close: '18:00', closed: false },
              ].map((schedule) => (
                <div key={schedule.day} className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
                  <div className="w-32 font-medium text-gray-900">{schedule.day}</div>
                  <div className="flex-1 flex items-center gap-4">
                    <input
                      type="time"
                      defaultValue={schedule.open}
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      defaultValue={schedule.close}
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-amber-500" />
                    <span className="text-sm text-gray-600">Closed</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Staff Members</h3>
              <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
                Add Staff Member
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'John Smith', role: 'Manager', email: 'john@store.com' },
                { name: 'Sarah Johnson', role: 'Sales Associate', email: 'sarah@store.com' },
                { name: 'Mike Wilson', role: 'Inventory Manager', email: 'mike@store.com' },
                { name: 'Emily Brown', role: 'Cashier', email: 'emily@store.com' },
              ].map((staff, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{staff.name}</h4>
                      <p className="text-sm text-gray-600">{staff.role}</p>
                      <p className="text-xs text-gray-500">{staff.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Store Photos</h3>
              <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
                Upload Photos
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
