'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  KeyIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      orderUpdates: true,
      productAlerts: true,
      paymentNotifications: true,
      marketing: false,
    },
    privacy: {
      showProfile: true,
      showRating: true,
      showLocation: true,
    },
    preferences: {
      language: 'en',
      theme: 'light',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, [isAuthenticated, router]);

  const handleNotificationChange = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications],
      },
    }));
  };

  const handlePrivacyChange = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key as keyof typeof prev.privacy],
      },
    }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        language: e.target.value,
      },
    }));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: e.target.value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // In a real app, you would also save to backend
      // await userAPI.updateSettings(settings);
      
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      // In a real app, call API to delete account
      toast.error('Account deletion is not available in demo mode');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BellIcon className="w-6 h-6 text-gray-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Choose what notifications you want to receive
            </p>

            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">
                    Receive notifications via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                    className="sr-only peer"
                    aria-label="Toggle email notifications"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Order Updates */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Order Updates</p>
                  <p className="text-sm text-gray-600">
                    Get notified about order status changes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.orderUpdates}
                    onChange={() => handleNotificationChange('orderUpdates')}
                    className="sr-only peer"
                    aria-label="Toggle order update notifications"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Product Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Product Alerts</p>
                  <p className="text-sm text-gray-600">
                    Alerts about new products and restocks
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.productAlerts}
                    onChange={() => handleNotificationChange('productAlerts')}
                    className="sr-only peer"
                    aria-label="Toggle product alert notifications"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Payment Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Payment Notifications</p>
                  <p className="text-sm text-gray-600">
                    Notifications about payments and transactions
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.paymentNotifications}
                    onChange={() => handleNotificationChange('paymentNotifications')}
                    className="sr-only peer"
                    aria-label="Toggle payment notifications"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Marketing Emails</p>
                  <p className="text-sm text-gray-600">
                    Receive tips, offers, and updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.marketing}
                    onChange={() => handleNotificationChange('marketing')}
                    className="sr-only peer"
                    aria-label="Toggle marketing email notifications"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-gray-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Privacy</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Control what information is visible to others
            </p>

            <div className="space-y-4">
              {/* Show Profile */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Public Profile</p>
                  <p className="text-sm text-gray-600">
                    Make your profile visible to other users
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showProfile}
                    onChange={() => handlePrivacyChange('showProfile')}
                    className="sr-only peer"
                    aria-label="Toggle public profile visibility"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Show Rating */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Rating</p>
                  <p className="text-sm text-gray-600">
                    Display your rating on your profile
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showRating}
                    onChange={() => handlePrivacyChange('showRating')}
                    className="sr-only peer"
                    aria-label="Toggle rating visibility"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Show Location */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Location</p>
                  <p className="text-sm text-gray-600">
                    Display your city and state
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showLocation}
                    onChange={() => handlePrivacyChange('showLocation')}
                    className="sr-only peer"
                    aria-label="Toggle location visibility"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <PaintBrushIcon className="w-6 h-6 text-gray-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
            </div>

            <div className="space-y-4">
              {/* Language */}
              <div>
                <label
                  htmlFor="language"
                  className="flex items-center text-sm font-medium text-gray-700 mb-2"
                >
                  <GlobeAltIcon className="w-5 h-5 mr-2" />
                  Language
                </label>
                <select
                  id="language"
                  value={settings.preferences.language}
                  onChange={handleLanguageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                </select>
              </div>

              {/* Theme */}
              <div>
                <label
                  htmlFor="theme"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Theme
                </label>
                <select
                  id="theme"
                  value={settings.preferences.theme}
                  onChange={handleThemeChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Dark mode coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Security Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <KeyIcon className="w-6 h-6 text-gray-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
            </div>

            <div className="space-y-4">
              {/* Change Wallet */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Connected Wallet</p>
                  <p className="text-sm text-gray-600">
                    Your account is secured with Web3 wallet authentication
                  </p>
                </div>
                <span className="text-sm text-gray-500 font-mono">
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <p className="font-medium">Logout</p>
                <p className="text-sm text-gray-600">
                  Sign out of your account
                </p>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <TrashIcon className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
            </div>
            <p className="text-red-800 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/profile"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
