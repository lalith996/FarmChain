'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { getRoleTheme } from '@/config/roleThemes';
import { Cog6ToothIcon, BellIcon, ShieldCheckIcon, MapPinIcon, TruckIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const theme = getRoleTheme('DISTRIBUTOR');
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'operations'>('general');
  const user = { name: 'System Admin', email: 'admin@distribution.com' };

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'operations', label: 'Operations', icon: TruckIcon },
  ];

  return (
    <RoleBasedLayout role="DISTRIBUTOR" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your distribution center preferences</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-lg bg-white p-6 shadow-lg">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Distribution Center Name</label><input type="text" defaultValue="Main Distribution Center" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Address</label><textarea rows={3} defaultValue="123 Logistics Ave, Distribution City" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700">Contact Email</label><input type="email" defaultValue="contact@distribution.com" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></div><div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="tel" defaultValue="+1 (555) 123-4567" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></div></div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                  <div className="space-y-4">
                    {['Low stock alerts', 'Delivery delays', 'Quality control issues', 'Vehicle maintenance reminders', 'Route optimization suggestions'].map((item) => (
                      <label key={item} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                        <span className="text-sm font-medium text-gray-900">{item}</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Current Password</label><input type="password" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">New Password</label><input type="password" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Confirm New Password</label><input type="password" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></div>
                    <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600" /><span className="text-sm text-gray-700">Enable two-factor authentication</span></label>
                  </div>
                </div>
              )}

              {activeTab === 'operations' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Operations Settings</h2>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Default Delivery Radius (km)</label><input type="number" defaultValue="50" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Working Hours</label><div className="mt-1 grid grid-cols-2 gap-4"><input type="time" defaultValue="08:00" className="block w-full rounded-lg border border-gray-300 px-4 py-2" /><input type="time" defaultValue="18:00" className="block w-full rounded-lg border border-gray-300 px-4 py-2" /></div></div>
                    <label className="flex items-center gap-3"><input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600" /><span className="text-sm text-gray-700">Enable automatic route optimization</span></label>
                    <label className="flex items-center gap-3"><input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600" /><span className="text-sm text-gray-700">Real-time vehicle tracking</span></label>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 font-medium text-white hover:shadow-lg">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
