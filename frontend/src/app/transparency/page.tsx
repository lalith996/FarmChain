'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  CubeIcon,
  ChartBarIcon,
  UsersIcon,
  TruckIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function TransparencyPage() {
  // Mock data - In production, this would come from your API
  const stats = {
    totalTransactions: 12547,
    verifiedProducts: 3421,
    activeParticipants: 567,
    totalDeliveries: 2103,
    blockchainVerifications: 12547,
    supplyChainEvents: 25894,
    averageVerificationTime: '3.2s',
    transparencyScore: 98.7,
  };

  const recentActivity = [
    { type: 'Product Verified', count: 23, change: '+12%', color: 'green' },
    { type: 'Ownership Transfer', count: 45, change: '+8%', color: 'blue' },
    { type: 'Quality Checks', count: 18, change: '+15%', color: 'purple' },
    { type: 'Deliveries Completed', count: 31, change: '+6%', color: 'emerald' },
  ];

  const blockchainMetrics = [
    { label: 'Average Block Time', value: '12.3s', icon: ClockIcon },
    { label: 'Total Gas Used', value: '2.4M', icon: CubeIcon },
    { label: 'Smart Contracts', value: '12', icon: DocumentTextIcon },
    { label: 'Network Uptime', value: '99.98%', icon: GlobeAltIcon },
  ];

  const transparencyPrinciples = [
    {
      title: 'Immutable Records',
      description: 'All data is permanently stored on blockchain and cannot be altered',
      icon: ShieldCheckIcon,
    },
    {
      title: 'Complete Traceability',
      description: 'Track products from farm to table with full supply chain visibility',
      icon: TruckIcon,
    },
    {
      title: 'Public Verification',
      description: 'Anyone can verify product authenticity and transaction history',
      icon: CheckCircleIcon,
    },
    {
      title: 'Real-time Updates',
      description: 'Live blockchain data ensures up-to-date information at all times',
      icon: ArrowTrendingUpIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <ShieldCheckIcon className="h-12 w-12" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Blockchain Transparency</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              FarmChain leverages blockchain technology to provide complete transparency, traceability, and trust in the agricultural supply chain
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Platform Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={CubeIcon}
              label="Total Transactions"
              value={stats.totalTransactions.toLocaleString()}
              color="purple"
            />
            <StatCard
              icon={CheckCircleIcon}
              label="Verified Products"
              value={stats.verifiedProducts.toLocaleString()}
              color="green"
            />
            <StatCard
              icon={UsersIcon}
              label="Active Participants"
              value={stats.activeParticipants.toLocaleString()}
              color="blue"
            />
            <StatCard
              icon={TruckIcon}
              label="Total Deliveries"
              value={stats.totalDeliveries.toLocaleString()}
              color="emerald"
            />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-7 w-7 mr-3 text-blue-600" />
              Recent Activity (Last 24 Hours)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className={`bg-gradient-to-br from-${activity.color}-50 to-${activity.color}-100 rounded-xl p-6 border-2 border-${activity.color}-200`}
                >
                  <p className="text-sm text-gray-700 mb-2">{activity.type}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{activity.count}</p>
                  <p className="text-sm font-medium text-green-600 flex items-center">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    {activity.change}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Blockchain Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <CubeIcon className="h-7 w-7 mr-3" />
              Blockchain Network Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {blockchainMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  >
                    <Icon className="h-8 w-8 mb-3" />
                    <p className="text-sm text-white/80 mb-2">{metric.label}</p>
                    <p className="text-3xl font-bold">{metric.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Transparency Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Transparency Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transparencyPrinciples.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <div className="flex items-start">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{principle.title}</h3>
                      <p className="text-gray-600">{principle.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Transparency Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Platform Transparency Score</h2>
            <div className="inline-block relative">
              <div className="text-8xl font-bold mb-4">{stats.transparencyScore}%</div>
              <div className="absolute -top-4 -right-4">
                <CheckCircleIcon className="h-16 w-16 text-white animate-pulse" />
              </div>
            </div>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Our commitment to transparency ensures every transaction, product movement, and quality check is recorded immutably on the blockchain
            </p>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Experience True Transparency
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join FarmChain and be part of the agricultural revolution. Every product, every transaction, every step - fully transparent and verifiable.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl">
                View Blockchain Explorer
              </button>
              <button className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl p-6 border-2 border-${color}-200 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`h-12 w-12 text-${color}-600`} />
        <div className={`w-3 h-3 bg-${color}-600 rounded-full animate-pulse`}></div>
      </div>
      <p className="text-gray-700 text-sm mb-2">{label}</p>
      <p className="text-4xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
