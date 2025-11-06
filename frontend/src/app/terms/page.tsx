'use client';

import { motion } from 'framer-motion';
import { DocumentTextIcon, ScaleIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function TermsOfServicePage() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20"
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
            <ScaleIcon className="h-20 w-20" />
          </motion.div>
          <motion.h1
            className="text-5xl font-bold text-center mb-4"
            {...fadeIn}
          >
            Terms of Service
          </motion.h1>
          <motion.p
            className="text-xl text-center text-blue-100"
            {...fadeIn}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Please read these terms carefully before using FarmChain
          </motion.p>
          <motion.p
            className="text-sm text-center text-blue-200 mt-4"
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
              { name: 'Acceptance', href: '#acceptance' },
              { name: 'User Obligations', href: '#obligations' },
              { name: 'Intellectual Property', href: '#ip' },
              { name: 'Termination', href: '#termination' }
            ].map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-center p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <span className="text-sm font-medium text-gray-700 hover:text-blue-600">
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
        {/* Acceptance */}
        <motion.section id="acceptance" variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing or using FarmChain's services, you agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
              using or accessing this site.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service apply to all users of the platform, including but not limited to farmers,
              distributors, retailers, consumers, and administrators.
            </p>
          </div>
        </motion.section>

        {/* User Accounts */}
        <motion.section variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <ClipboardDocumentCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">2. User Accounts</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Creation</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your wallet and account credentials</li>
                  <li>You must be at least 18 years old to create an account</li>
                  <li>One person or entity may not maintain more than one account</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                  <li>You may not transfer or sell your account to another party</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* User Obligations */}
        <motion.section id="obligations" variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">3. User Obligations and Conduct</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Activities</h3>
                <p className="text-gray-700 mb-3">You agree not to:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Use the platform for illegal activities</li>
                      <li>• Post false or misleading information</li>
                      <li>• Infringe on intellectual property rights</li>
                      <li>• Transmit viruses or malicious code</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Harass or harm other users</li>
                      <li>• Manipulate product information</li>
                      <li>• Interfere with platform functionality</li>
                      <li>• Attempt unauthorized access</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Product Listings</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>All product information must be accurate and truthful</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>You are responsible for ensuring product quality and safety</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Comply with all applicable food safety and agricultural regulations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Honor all confirmed orders and transactions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Blockchain and Transactions */}
        <motion.section variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Blockchain and Transactions</h2>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Smart Contract Terms</h3>
                <p className="text-gray-700 text-sm mb-2">
                  All transactions on FarmChain are recorded on the blockchain and governed by smart contracts.
                  Once a transaction is confirmed:
                </p>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• It is immutable and cannot be reversed</li>
                  <li>• You are bound by the terms of the smart contract</li>
                  <li>• Gas fees and transaction costs are your responsibility</li>
                  <li>• You acknowledge the inherent risks of blockchain technology</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Terms</h3>
                <p className="text-gray-700 text-sm">
                  Payments processed through FarmChain are subject to the terms of our payment processors.
                  We are not responsible for payment processing errors, delays, or disputes that occur outside
                  of our platform's control.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Intellectual Property */}
        <motion.section id="ip" variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Intellectual Property Rights</h2>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Our Content</h3>
                <p className="text-gray-700">
                  The FarmChain platform, including its original content, features, and functionality, is owned by
                  FarmChain Inc. and protected by international copyright, trademark, patent, trade secret, and other
                  intellectual property laws.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Your Content</h3>
                <p className="text-gray-700">
                  You retain all rights to the content you upload to FarmChain. By uploading content, you grant us
                  a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content for
                  the purpose of providing our services.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Trademarks</h3>
                <p className="text-gray-700">
                  FarmChain, our logos, and other marks are trademarks of FarmChain Inc. You may not use these
                  trademarks without our prior written permission.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Limitation of Liability */}
        <motion.section variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Limitation of Liability</h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <p className="text-gray-700 leading-relaxed mb-4">
                TO THE FULLEST EXTENT PERMITTED BY LAW, FARMCHAIN SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
                WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
                INTANGIBLE LOSSES.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our total liability for any claims arising out of or related to these terms or the services shall
                not exceed the amount you paid us in the 12 months prior to the event giving rise to the liability.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Some jurisdictions do not allow the exclusion of certain warranties or
                the limitation of liability for incidental or consequential damages. In such jurisdictions, our
                liability will be limited to the maximum extent permitted by law.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Termination */}
        <motion.section id="termination" variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Termination</h2>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and access to the platform immediately, without prior
                notice or liability, for any reason, including but not limited to:
              </p>

              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Breach of these Terms of Service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Fraudulent or illegal activities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Violation of applicable laws or regulations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Request by law enforcement or government agencies</span>
                </li>
              </ul>

              <p className="text-gray-700 leading-relaxed mt-4">
                Upon termination, your right to use the platform will cease immediately. You may also terminate
                your account at any time by contacting us or through your account settings.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Changes to Terms */}
        <motion.section variants={fadeIn} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify or replace these Terms of Service at any time. We will provide notice
              of any material changes by posting the new terms on this page and updating the "Last Updated" date.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Your continued use of the platform after any changes indicates your acceptance of the new terms.
              We encourage you to review these terms periodically.
            </p>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section variants={fadeIn} className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Questions About Our Terms?</h2>
            <p className="mb-6">
              If you have any questions about these Terms of Service, please contact us.
            </p>
            <div className="space-y-2">
              <p>Email: <a href="mailto:legal@farmchain.com" className="underline">legal@farmchain.com</a></p>
              <p>Address: FarmChain Inc., 123 Blockchain Ave, San Francisco, CA 94102</p>
            </div>
          </div>
        </motion.section>

        {/* Back to Home */}
        <motion.div variants={fadeIn} className="text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
