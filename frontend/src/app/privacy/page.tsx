'use client';

import { motion } from 'framer-motion';
import { ShieldCheckIcon, LockClosedIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <ShieldCheckIcon className="h-20 w-20" />
          </motion.div>
          <motion.h1
            className="text-5xl font-bold text-center mb-4"
            {...fadeIn}
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            className="text-xl text-center text-green-100"
            {...fadeIn}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Your privacy is our priority. Learn how we protect your data.
          </motion.p>
          <motion.p
            className="text-sm text-center text-green-200 mt-4"
            {...fadeIn}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Last Updated: November 6, 2024
          </motion.p>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Information We Collect', href: '#collect' },
              { name: 'How We Use Data', href: '#usage' },
              { name: 'Data Security', href: '#security' },
              { name: 'Your Rights', href: '#rights' }
            ].map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-center p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <span className="text-sm font-medium text-gray-700 hover:text-green-600">
                  {item.name}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        variants={staggerChildren}
        initial="initial"
        animate="animate"
      >
        {/* Introduction */}
        <motion.section variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to FarmChain. We are committed to protecting your personal information and your right to privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
              our blockchain-powered agricultural supply chain platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using FarmChain, you agree to the collection and use of information in accordance with this policy.
              If you do not agree with our policies and practices, please do not use our services.
            </p>
          </div>
        </motion.section>

        {/* Information We Collect */}
        <motion.section id="collect" variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Information We Collect</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Name, email address, and phone number</li>
                  <li>Wallet address and blockchain transaction data</li>
                  <li>Profile information and business details</li>
                  <li>Location data (city, state, country)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, features used, time spent)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log data and analytics</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Blockchain Data</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Public blockchain addresses</li>
                  <li>Transaction hashes and smart contract interactions</li>
                  <li>Product registration and ownership transfer records</li>
                  <li>Supply chain tracking data</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How We Use Your Information */}
        <motion.section id="usage" variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <EyeIcon className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Provide and Maintain Services</h3>
                  <p className="text-gray-700">
                    To create and manage your account, process transactions, and deliver the core functionality
                    of our platform including product registration and supply chain tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Improve User Experience</h3>
                  <p className="text-gray-700">
                    To understand how you use our platform, analyze trends, and improve our features and services
                    based on user feedback and behavior.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Communication</h3>
                  <p className="text-gray-700">
                    To send you important updates, transaction confirmations, security alerts, and marketing
                    communications (which you can opt out of at any time).
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Legal Compliance</h3>
                  <p className="text-gray-700">
                    To comply with legal obligations, resolve disputes, enforce our agreements, and protect
                    against fraudulent or illegal activities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Data Security */}
        <motion.section id="security" variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <LockClosedIcon className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Data Security</h2>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              We implement industry-standard security measures to protect your personal information from
              unauthorized access, disclosure, alteration, and destruction.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Technical Safeguards</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• End-to-end encryption</li>
                  <li>• Secure SSL/TLS connections</li>
                  <li>• Regular security audits</li>
                  <li>• Firewall protection</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Organizational Measures</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Limited access controls</li>
                  <li>• Employee training programs</li>
                  <li>• Incident response procedures</li>
                  <li>• Data backup and recovery</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> While we strive to protect your personal information, no method of
                transmission over the internet or electronic storage is 100% secure. We cannot guarantee
                absolute security.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Your Rights */}
        <motion.section id="rights" variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Privacy Rights</h2>

            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Access and Portability</h3>
                <p className="text-gray-700">
                  You have the right to request access to your personal data and receive a copy in a
                  structured, machine-readable format.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Correction</h3>
                <p className="text-gray-700">
                  You can update or correct your personal information at any time through your account settings.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Deletion</h3>
                <p className="text-gray-700">
                  You have the right to request deletion of your personal data, subject to legal and contractual
                  obligations.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Opt-Out</h3>
                <p className="text-gray-700">
                  You can opt out of marketing communications at any time by using the unsubscribe link in our
                  emails or contacting us directly.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Data Restriction</h3>
                <p className="text-gray-700">
                  You can request that we restrict the processing of your personal data under certain circumstances.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section variants={fadeIn} className="mb-12">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Questions About Your Privacy?</h2>
            <p className="mb-6">
              If you have any questions or concerns about our privacy practices, please don't hesitate to contact us.
            </p>
            <div className="space-y-2">
              <p>Email: <a href="mailto:privacy@farmchain.com" className="underline">privacy@farmchain.com</a></p>
              <p>Address: FarmChain Inc., 123 Blockchain Ave, San Francisco, CA 94102</p>
            </div>
          </div>
        </motion.section>

        {/* Back to Home */}
        <motion.div variants={fadeIn} className="text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
