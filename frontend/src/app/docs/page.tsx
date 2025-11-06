'use client';

import { motion } from 'framer-motion';
import { BookOpenIcon, CodeBracketIcon, RocketLaunchIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: RocketLaunchIcon,
      subsections: [
        { title: 'Quick Start Guide', time: '5 min' },
        { title: 'Account Setup', time: '10 min' },
        { title: 'Wallet Connection', time: '15 min' }
      ]
    },
    {
      id: 'api',
      name: 'API Reference',
      icon: CodeBracketIcon,
      subsections: [
        { title: 'Authentication', time: '10 min' },
        { title: 'Product API', time: '20 min' },
        { title: 'Blockchain API', time: '25 min' }
      ]
    },
    {
      id: 'guides',
      name: 'User Guides',
      icon: BookOpenIcon,
      subsections: [
        { title: 'Farmer Guide', time: '15 min' },
        { title: 'Distributor Guide', time: '15 min' },
        { title: 'Retailer Guide', time: '15 min' }
      ]
    },
    {
      id: 'integration',
      name: 'Integration',
      icon: WrenchScrewdriverIcon,
      subsections: [
        { title: 'Web3 Integration', time: '30 min' },
        { title: 'Payment Integration', time: '20 min' },
        { title: 'Webhook Setup', time: '15 min' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center justify-center mb-8"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <BookOpenIcon className="h-24 w-24" />
          </motion.div>
          <motion.h1
            className="text-6xl font-bold text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Documentation
          </motion.h1>
          <motion.p
            className="text-2xl text-center text-blue-100 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Everything you need to build on FarmChain
          </motion.p>
          <motion.div
            className="flex justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <input
              type="text"
              placeholder="Search documentation..."
              className="px-6 py-3 rounded-lg text-gray-900 w-full max-w-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            className="lg:w-64 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="sticky top-8 space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  <section.icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{section.name}</span>
                </button>
              ))}
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {sections.map((section) => (
              activeSection === section.id && (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center mb-6">
                      <section.icon className="h-10 w-10 text-blue-600 mr-4" />
                      <h2 className="text-4xl font-bold text-gray-900">{section.name}</h2>
                    </div>

                    <div className="space-y-4">
                      {section.subsections.map((subsection, index) => (
                        <motion.div
                          key={subsection.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 10 }}
                          className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-blue-200"
                        >
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {subsection.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Estimated time: {subsection.time}
                            </p>
                          </div>
                          <div className="text-blue-600">→</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            ))}

            {/* Code Example */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gray-900 rounded-2xl p-8 text-white overflow-hidden"
            >
              <h3 className="text-2xl font-bold mb-4">Quick Example</h3>
              <pre className="text-sm overflow-x-auto">
                <code className="text-green-400">{`// Connect to FarmChain
import { FarmChain } from '@farmchain/sdk';

const farmchain = new FarmChain({
  apiKey: process.env.FARMCHAIN_API_KEY,
  network: 'mainnet'
});

// Register a product on blockchain
const product = await farmchain.products.register({
  name: 'Organic Tomatoes',
  quantity: 100,
  unit: 'kg',
  price: 50,
  farmer: walletAddress
});

console.log('Product registered:', product.id);
console.log('Blockchain TX:', product.txHash);`}</code>
              </pre>
            </motion.div>
          </motion.main>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-white text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Need Help?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our developer community or reach out to our support team
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-lg"
            >
              Contact Support
            </Link>
            <button className="px-8 py-4 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-all">
              Join Discord
            </button>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
