'use client';

import { motion } from 'framer-motion';
import { CogIcon, CookieIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

export default function CookiePolicyPage() {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false
  });

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const saveCookiePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Cookie preferences saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className="relative">
              <CogIcon className="h-20 w-20 text-white" />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2">
                <svg className="h-8 w-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8 8 8 0 018 8 8 8 0 01-8 8 8 8 0 01-8-8zm8-3a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z" />
                </svg>
              </div>
            </div>
          </motion.div>
          <motion.h1
            className="text-5xl font-bold text-center mb-4"
            {...fadeIn}
          >
            Cookie Policy
          </motion.h1>
          <motion.p
            className="text-xl text-center text-purple-100"
            {...fadeIn}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Learn how we use cookies to improve your experience
          </motion.p>
          <motion.p
            className="text-sm text-center text-purple-200 mt-4"
            {...fadeIn}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Last Updated: November 6, 2024
          </motion.p>
        </div>
      </motion.div>

      {/* Cookie Preferences Widget */}
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cookie Preferences</h3>
          <div className="space-y-4">
            {[
              { key: 'necessary', name: 'Necessary Cookies', description: 'Essential for site functionality', locked: true },
              { key: 'functional', name: 'Functional Cookies', description: 'Enable enhanced functionality', locked: false },
              { key: 'analytics', name: 'Analytics Cookies', description: 'Help us understand site usage', locked: false },
              { key: 'marketing', name: 'Marketing Cookies', description: 'Used for targeted advertising', locked: false }
            ].map((cookie) => (
              <div key={cookie.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{cookie.name}</h4>
                  <p className="text-sm text-gray-600">{cookie.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cookiePreferences[cookie.key as keyof typeof cookiePreferences]}
                    onChange={(e) => !cookie.locked && setCookiePreferences({
                      ...cookiePreferences,
                      [cookie.key]: e.target.checked
                    })}
                    disabled={cookie.locked}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 ${cookie.locked ? 'opacity-50' : ''}`}></div>
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={saveCookiePreferences}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
          >
            Save Preferences
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* What Are Cookies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website.
              They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-gray-700 leading-relaxed">
              FarmChain uses cookies to enhance your browsing experience, analyze site traffic, and personalize content
              and advertisements. This Cookie Policy explains what cookies are, how we use them, and how you can control them.
            </p>
          </div>
        </motion.section>

        {/* Types of Cookies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>

            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Necessary Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies are essential for the website to function properly. They enable core functionality
                  such as security, network management, and accessibility.
                </p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-medium mb-2">Examples:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Session authentication cookies</li>
                    <li>• Security cookies to prevent fraudulent use</li>
                    <li>• Load balancing cookies</li>
                    <li>• Wallet connection state</li>
                  </ul>
                </div>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Functional Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies allow the website to remember choices you make and provide enhanced, personalized features.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-medium mb-2">Examples:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Language preferences</li>
                    <li>• Theme settings (dark/light mode)</li>
                    <li>• Shopping cart contents</li>
                    <li>• Recently viewed products</li>
                  </ul>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Analytics Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and reporting
                  information anonymously.
                </p>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-medium mb-2">Examples:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Google Analytics cookies</li>
                    <li>• Page view statistics</li>
                    <li>• User journey tracking</li>
                    <li>• Performance monitoring</li>
                  </ul>
                </div>
              </div>

              <div className="border-l-4 border-pink-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Marketing Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies track your online activity to help advertisers deliver more relevant advertising
                  or to limit how many times you see an ad.
                </p>
                <div className="bg-pink-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-medium mb-2">Examples:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Retargeting cookies</li>
                    <li>• Social media cookies</li>
                    <li>• Advertising network cookies</li>
                    <li>• Conversion tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Third-Party Cookies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Some cookies on our site are set by third-party services that appear on our pages. These third parties
              may use cookies to collect information about your online activities across different websites.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Service Providers</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Google Analytics</li>
                  <li>• Stripe (Payment Processing)</li>
                  <li>• SendGrid (Email Services)</li>
                  <li>• Cloudflare (CDN)</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Social Media</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Facebook Pixel</li>
                  <li>• Twitter Analytics</li>
                  <li>• LinkedIn Insights</li>
                  <li>• YouTube Embed</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Managing Cookies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Manage Cookies</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Browser Settings</h3>
                <p className="text-gray-700 mb-4">
                  Most web browsers allow you to control cookies through their settings. You can set your browser to:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Block all cookies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Allow only first-party cookies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Delete cookies when you close your browser</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Notify you when a website tries to set a cookie</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Important Note</h3>
                <p className="text-sm text-gray-700">
                  Blocking or deleting cookies may impact your experience on FarmChain. Some features may not
                  work properly, and you may need to manually adjust preferences each time you visit.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Browser-Specific Instructions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-900">Chrome</span>
                    <span className="text-gray-500">→</span>
                  </a>
                  <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-900">Firefox</span>
                    <span className="text-gray-500">→</span>
                  </a>
                  <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-900">Safari</span>
                    <span className="text-gray-500">→</span>
                  </a>
                  <a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-900">Edge</span>
                    <span className="text-gray-500">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Questions About Cookies?</h2>
            <p className="mb-6">
              If you have any questions about our use of cookies, please contact us.
            </p>
            <div className="space-y-2">
              <p>Email: <a href="mailto:privacy@farmchain.com" className="underline">privacy@farmchain.com</a></p>
              <p>Address: FarmChain Inc., 123 Blockchain Ave, San Francisco, CA 94102</p>
            </div>
          </div>
        </motion.section>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center"
        >
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
