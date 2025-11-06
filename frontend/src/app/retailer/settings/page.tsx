'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { getRoleTheme } from '@/config/roleThemes';
import {
  Cog6ToothIcon,
  BellIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

export default function RetailerSettingsPage() {
  const theme = getRoleTheme('RETAILER');
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'payments' | 'shipping' | 'security'>('general');

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'payments', label: 'Payments', icon: CreditCardIcon },
    { id: 'shipping', label: 'Shipping', icon: TruckIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
  ];

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your store configuration and preferences
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 space-y-1 rounded-lg bg-white p-2 shadow">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 rounded-lg bg-white p-6 shadow">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">Basic store configuration</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Store Currency</label>
                    <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none">
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                      <option>GBP - British Pound</option>
                      <option>CAD - Canadian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timezone</label>
                    <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none">
                      <option>America/Los_Angeles (PST)</option>
                      <option>America/New_York (EST)</option>
                      <option>Europe/London (GMT)</option>
                      <option>Asia/Tokyo (JST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Format</label>
                    <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                      <p className="text-sm text-gray-500">Temporarily disable store for customers</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300"></div>
                    </label>
                  </div>
                </div>

                <button className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                  <p className="mt-1 text-sm text-gray-500">Manage how you receive notifications</p>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'New Orders', description: 'Get notified when new orders are placed' },
                    { title: 'Low Stock Alerts', description: 'Receive alerts when inventory is low' },
                    { title: 'Customer Reviews', description: 'Notified when customers leave reviews' },
                    { title: 'Payment Received', description: 'Confirmed when payments are received' },
                    { title: 'Daily Reports', description: 'Receive daily sales and performance reports' },
                  ].map((notif, index) => (
                    <div key={index} className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notif.title}</h4>
                        <p className="text-sm text-gray-500">{notif.description}</p>
                      </div>
                      <div className="flex gap-4 ml-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded text-amber-500" />
                          <span className="text-sm text-gray-600">Email</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded text-amber-500" />
                          <span className="text-sm text-gray-600">Push</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">Configure payment methods and processing</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-amber-500 bg-amber-50 p-4">
                    <div className="flex items-center gap-3">
                      <CreditCardIcon className="h-6 w-6 text-amber-600" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Credit/Debit Cards</h4>
                        <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <GlobeAltIcon className="h-6 w-6 text-gray-600" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Digital Wallets</h4>
                        <p className="text-sm text-gray-600">PayPal, Google Pay, Apple Pay</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" defaultChecked className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300"></div>
                      </label>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <KeyIcon className="h-6 w-6 text-gray-600" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Cryptocurrency</h4>
                        <p className="text-sm text-gray-600">Bitcoin, Ethereum, USDC</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300"></div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction Fee</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue="2.5"
                        step="0.1"
                        className="block w-32 rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">Configure delivery options and zones</p>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Standard Shipping', time: '3-5 business days', cost: 5.99 },
                    { name: 'Express Shipping', time: '1-2 business days', cost: 12.99 },
                    { name: 'Same Day Delivery', time: 'Within 24 hours', cost: 19.99 },
                    { name: 'Store Pickup', time: 'Ready in 2 hours', cost: 0 },
                  ].map((method, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-500">{method.time}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-900">
                          ${method.cost.toFixed(2)}
                        </span>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" defaultChecked className="peer sr-only" />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300"></div>
                        </label>
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Free Shipping Threshold</label>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-gray-600">$</span>
                      <input
                        type="number"
                        defaultValue="50"
                        className="block w-32 rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none"
                      />
                      <span className="text-gray-600">minimum order</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">Manage access and security preferences</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                    <button className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900">Change Password</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your password regularly for better security
                    </p>
                    <button className="mt-3 rounded-lg border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50">
                      Change Password
                    </button>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900">API Keys</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage API keys for integrations
                    </p>
                    <button className="mt-3 rounded-lg border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50">
                      Manage API Keys
                    </button>
                  </div>

                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h4 className="font-semibold text-red-900">Danger Zone</h4>
                    <p className="mt-1 text-sm text-red-600">
                      Permanently delete your store and all associated data
                    </p>
                    <button className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                      Delete Store
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
