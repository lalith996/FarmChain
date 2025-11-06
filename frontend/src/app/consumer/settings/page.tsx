'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { getRoleTheme } from '@/config/roleThemes';
import {
  Cog6ToothIcon,
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  LinkIcon,
  SunIcon,
  MoonIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const theme = getRoleTheme('CONSUMER');
  const user = { name: 'John Customer', email: 'john@example.com' };
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'data'>('general');

  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    autoPlayVideos: true,
    showPriceWithTax: true,
    rememberCart: true,
  });

  const [notifications, setNotifications] = useState({
    email: {
      orderUpdates: true,
      promotions: true,
      newsletter: false,
      priceDrops: true,
      backInStock: true,
    },
    push: {
      orderUpdates: true,
      promotions: false,
      deliveryArrival: true,
    },
    sms: {
      orderUpdates: true,
      deliveryUpdates: true,
      promotions: false,
    },
  });

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'general', label: 'General', icon: Cog6ToothIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheckIcon },
            { id: 'data', label: 'Data Management', icon: DocumentArrowDownIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-6 py-3 text-sm font-medium ${
                  activeTab === tab.id ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Appearance */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'light', label: 'Light', icon: SunIcon },
                      { value: 'dark', label: 'Dark', icon: MoonIcon },
                      { value: 'auto', label: 'Auto', icon: DevicePhoneMobileIcon },
                    ].map((themeOption) => {
                      const Icon = themeOption.icon;
                      return (
                        <button
                          key={themeOption.value}
                          onClick={() => setSettings({ ...settings, theme: themeOption.value })}
                          className={`rounded-lg border-2 p-4 ${
                            settings.theme === themeOption.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-6 w-6 mx-auto mb-2 text-gray-700" />
                          <div className="text-sm font-medium">{themeOption.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Display Preferences */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Display Preferences</h2>
              <div className="space-y-4">
                {[
                  {
                    key: 'autoPlayVideos',
                    label: 'Auto-play product videos',
                    description: 'Automatically play videos when browsing products',
                  },
                  {
                    key: 'showPriceWithTax',
                    label: 'Show prices with tax included',
                    description: 'Display final prices including applicable taxes',
                  },
                  {
                    key: 'rememberCart',
                    label: 'Remember cart items',
                    description: 'Keep items in cart between sessions',
                  },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                    <div>
                      <div className="font-semibold text-gray-900">{pref.label}</div>
                      <div className="text-sm text-gray-600">{pref.description}</div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={settings[pref.key as keyof typeof settings] as boolean}
                        onChange={(e) => setSettings({ ...settings, [pref.key]: e.target.checked })}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-purple-600 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Email Notifications</h2>
              <div className="space-y-4">
                {[
                  { key: 'orderUpdates', label: 'Order Updates', description: 'Confirmations, shipping updates, and delivery notifications' },
                  { key: 'promotions', label: 'Promotional Offers', description: 'Special deals, discounts, and seasonal offers' },
                  { key: 'newsletter', label: 'Weekly Newsletter', description: 'Recipes, tips, and featured products' },
                  { key: 'priceDrops', label: 'Price Drop Alerts', description: 'Notifications when wishlist items go on sale' },
                  { key: 'backInStock', label: 'Back in Stock', description: 'Alerts when out-of-stock items are available' },
                ].map((notif) => (
                  <div key={notif.key} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                    <div>
                      <div className="font-semibold text-gray-900">{notif.label}</div>
                      <div className="text-sm text-gray-600">{notif.description}</div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={notifications.email[notif.key as keyof typeof notifications.email]}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            email: { ...notifications.email, [notif.key]: e.target.checked },
                          })
                        }
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-purple-600 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Push Notifications */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Push Notifications</h2>
              <div className="space-y-4">
                {[
                  { key: 'orderUpdates', label: 'Order Updates', description: 'Real-time order status updates' },
                  { key: 'promotions', label: 'Promotions', description: 'Flash sales and limited-time offers' },
                  { key: 'deliveryArrival', label: 'Delivery Arrival', description: 'When your order is about to arrive' },
                ].map((notif) => (
                  <div key={notif.key} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                    <div>
                      <div className="font-semibold text-gray-900">{notif.label}</div>
                      <div className="text-sm text-gray-600">{notif.description}</div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={notifications.push[notif.key as keyof typeof notifications.push]}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            push: { ...notifications.push, [notif.key]: e.target.checked },
                          })
                        }
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-purple-600 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">SMS Notifications</h2>
              <div className="space-y-4">
                {[
                  { key: 'orderUpdates', label: 'Order Confirmations', description: 'Text confirmations for new orders' },
                  { key: 'deliveryUpdates', label: 'Delivery Updates', description: 'SMS alerts for delivery status' },
                  { key: 'promotions', label: 'Promotional Messages', description: 'Special offers via text' },
                ].map((notif) => (
                  <div key={notif.key} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                    <div>
                      <div className="font-semibold text-gray-900">{notif.label}</div>
                      <div className="text-sm text-gray-600">{notif.description}</div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={notifications.sms[notif.key as keyof typeof notifications.sms]}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            sms: { ...notifications.sms, [notif.key]: e.target.checked },
                          })
                        }
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-purple-600 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Privacy & Security Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            {/* Connected Apps */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Connected Apps & Services</h2>
              <div className="space-y-4">
                {[
                  { name: 'Google Account', connected: true, icon: '🔗', description: 'Sign in with Google' },
                  { name: 'Facebook', connected: false, icon: '📘', description: 'Share and connect' },
                  { name: 'Apple Health', connected: true, icon: '🍎', description: 'Sync dietary data' },
                ].map((app, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{app.icon}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{app.name}</div>
                        <div className="text-sm text-gray-600">{app.description}</div>
                      </div>
                    </div>
                    <button
                      className={`rounded-lg px-6 py-2 font-semibold ${
                        app.connected
                          ? 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                      }`}
                    >
                      {app.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Management */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Active Sessions</h2>
              <div className="space-y-4">
                {[
                  { device: 'Chrome on Windows', location: 'San Francisco, CA', current: true, lastActive: 'Active now' },
                  { device: 'Safari on iPhone', location: 'San Francisco, CA', current: false, lastActive: '2 hours ago' },
                ].map((session, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.location} • {session.lastActive}
                      </div>
                    </div>
                    {!session.current && (
                      <button className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Download Data */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <DocumentArrowDownIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Download Your Data</h3>
                    <p className="text-sm text-gray-600">Get a copy of your account data, orders, and activity</p>
                  </div>
                </div>
                <button className="rounded-lg border-2 border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50">
                  Request Download
                </button>
              </div>
            </div>

            {/* Clear Cache */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-orange-100 p-3">
                    <Cog6ToothIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Clear Cache & Cookies</h3>
                    <p className="text-sm text-gray-600">Remove stored data to improve performance</p>
                  </div>
                </div>
                <button className="rounded-lg border-2 border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50">
                  Clear Cache
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Delete Account</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Permanently delete your account and all associated data
                    </p>
                    <div className="text-sm text-red-700">
                      <strong>Warning:</strong> This action cannot be undone. All your orders, reviews, and loyalty
                      points will be permanently deleted.
                    </div>
                  </div>
                </div>
                <button className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700">
                  Delete Account
                </button>
              </div>
            </div>

            {/* Terms & Privacy */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Legal & Policies</h2>
              <div className="space-y-3">
                {[
                  { label: 'Terms of Service', icon: DocumentArrowDownIcon },
                  { label: 'Privacy Policy', icon: ShieldCheckIcon },
                  { label: 'Cookie Policy', icon: Cog6ToothIcon },
                  { label: 'Community Guidelines', icon: GlobeAltIcon },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={idx}
                      href="#"
                      className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4 hover:border-purple-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button className="rounded-lg border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-50">
            Reset to Default
          </button>
          <button className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-bold text-white hover:shadow-lg">
            Save All Changes
          </button>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
