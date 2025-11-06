'use client';

import { motion } from 'framer-motion';
import { ShieldCheckIcon, CheckBadgeIcon, DocumentCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CompliancePage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const complianceStandards = [
    {
      name: 'GDPR',
      description: 'General Data Protection Regulation',
      status: 'Compliant',
      icon: '🇪🇺',
      details: 'Full compliance with EU data protection laws'
    },
    {
      name: 'SOC 2 Type II',
      description: 'Security & Availability',
      status: 'Certified',
      icon: '🔒',
      details: 'Third-party audited security controls'
    },
    {
      name: 'ISO 27001',
      description: 'Information Security Management',
      status: 'In Progress',
      icon: '🏆',
      details: 'International security standard certification'
    },
    {
      name: 'CCPA',
      description: 'California Consumer Privacy Act',
      status: 'Compliant',
      icon: '🇺🇸',
      details: 'California data privacy compliance'
    },
    {
      name: 'HIPAA',
      description: 'Healthcare Data Protection',
      status: 'Compliant',
      icon: '🏥',
      details: 'Protected health information security'
    },
    {
      name: 'PCI DSS',
      description: 'Payment Card Industry Security',
      status: 'Level 1',
      icon: '💳',
      details: 'Highest level of payment security'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      {/* Hero Section */}
      <motion.div
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center justify-center mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.5 }}
          >
            <ShieldCheckIcon className="h-24 w-24" />
          </motion.div>
          <motion.h1
            className="text-6xl font-bold text-center mb-6"
            {...fadeIn}
          >
            Compliance & Certifications
          </motion.h1>
          <motion.p
            className="text-2xl text-center text-indigo-100 max-w-3xl mx-auto"
            {...fadeIn}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            We maintain the highest standards of security, privacy, and regulatory compliance
          </motion.p>
        </div>
      </motion.div>

      {/* Compliance Standards Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {complianceStandards.map((standard, index) => (
            <motion.div
              key={standard.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:border-indigo-200 transition-all"
            >
              <div className="text-5xl mb-4">{standard.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{standard.name}</h3>
              <p className="text-gray-600 mb-4">{standard.description}</p>
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  standard.status === 'Compliant' || standard.status === 'Certified' || standard.status === 'Level 1'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {standard.status}
                </span>
                <CheckBadgeIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <p className="text-sm text-gray-500 mt-4">{standard.details}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Security Practices */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-16"
        >
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <div className="flex items-center mb-8">
              <DocumentCheckIcon className="h-10 w-10 text-indigo-600 mr-4" />
              <h2 className="text-4xl font-bold text-gray-900">Our Security Practices</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Protection</h3>
                <ul className="space-y-3">
                  {[
                    'End-to-end encryption for all sensitive data',
                    'Regular security audits and penetration testing',
                    'Secure data centers with 24/7 monitoring',
                    'Automated backup and disaster recovery',
                    'Multi-factor authentication (MFA)',
                    'Role-based access control (RBAC)'
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="flex items-start text-gray-700"
                    >
                      <CheckBadgeIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Operational Excellence</h3>
                <ul className="space-y-3">
                  {[
                    'ISO 27001 compliant processes',
                    'Annual third-party security assessments',
                    'Incident response and management',
                    'Employee security training programs',
                    'Vendor security risk assessments',
                    'Continuous compliance monitoring'
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 + i * 0.1 }}
                      className="flex items-start text-gray-700"
                    >
                      <CheckBadgeIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Blockchain Compliance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-10 text-white">
            <div className="flex items-center mb-6">
              <GlobeAltIcon className="h-10 w-10 mr-4" />
              <h2 className="text-4xl font-bold">Blockchain Compliance</h2>
            </div>
            <p className="text-indigo-100 mb-8 text-lg">
              Our blockchain infrastructure adheres to international standards for decentralized systems
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Smart Contract Audits',
                  description: 'All contracts audited by leading security firms'
                },
                {
                  title: 'Regulatory Compliance',
                  description: 'Compliant with global crypto regulations'
                },
                {
                  title: 'Transparency',
                  description: 'Public blockchain records and open-source code'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-indigo-100">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Certifications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mb-16"
        >
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Certifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'SOC 2', year: '2024' },
                { name: 'GDPR', year: '2024' },
                { name: 'CCPA', year: '2024' },
                { name: 'PCI DSS', year: '2024' }
              ].map((cert, i) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + i * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200"
                >
                  <CheckBadgeIcon className="h-16 w-16 text-indigo-600 mb-3" />
                  <h3 className="text-xl font-bold text-gray-900">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.year}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="bg-gradient-to-r from-indigo-600 to-pink-600 rounded-2xl shadow-2xl p-12 text-white text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Have Questions About Our Compliance?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Our compliance team is here to answer your questions about our security practices and certifications
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl"
            >
              Contact Compliance Team
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-indigo-700 text-white font-bold rounded-lg hover:bg-indigo-800 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
