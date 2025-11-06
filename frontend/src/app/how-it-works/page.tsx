'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { UserGroupIcon, ShoppingBagIcon, TruckIcon, CheckCircleIcon, ShieldCheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: UserGroupIcon,
      title: 'Register & Verify',
      description: 'Create your account and complete KYC verification. Connect your Web3 wallet to get started.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: ShoppingBagIcon,
      title: 'List or Browse Products',
      description: 'Farmers can list their products with details and certifications. Buyers can browse the marketplace.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Blockchain Registration',
      description: 'Products are registered on the blockchain for transparency and traceability.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Secure Payment',
      description: 'Make payments using cryptocurrency. Funds are held in smart contracts until delivery.',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: TruckIcon,
      title: 'Track Delivery',
      description: 'Track your order in real-time through the supply chain with blockchain verification.',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: CheckCircleIcon,
      title: 'Confirm & Release',
      description: 'Confirm delivery and funds are automatically released to the farmer.',
      color: 'bg-green-100 text-green-600',
    },
  ];

  const roles = [
    {
      title: 'For Farmers',
      icon: '👨‍🌾',
      features: [
        'List products with blockchain verification',
        'Set your own prices',
        'Receive payments directly',
        'Track sales and analytics',
        'Build your reputation',
      ],
    },
    {
      title: 'For Buyers',
      icon: '🛒',
      features: [
        'Browse verified products',
        'Track product journey',
        'Secure cryptocurrency payments',
        'Quality assurance',
        'Direct farmer connection',
      ],
    },
    {
      title: 'For Distributors',
      icon: '🚚',
      features: [
        'Source products efficiently',
        'Manage logistics',
        'Track shipments',
        'Supplier management',
        'Bulk ordering',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="How FarmChain Works"
        description="Learn how our blockchain-powered platform connects farmers with buyers"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Steps Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Simple Steps to Get Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${step.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold text-gray-300">0{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roles Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Built for Everyone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="text-5xl mb-4 text-center">{role.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{role.title}</h3>
                <ul className="space-y-3">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain Benefits */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-white mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Why Blockchain?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <ShieldCheckIcon className="h-12 w-12 mx-auto mb-3" />
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p>Every transaction is recorded on the blockchain, ensuring complete transparency</p>
            </div>
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-3" />
              <h3 className="text-xl font-semibold mb-2">Traceability</h3>
              <p>Track products from farm to table with immutable records</p>
            </div>
            <div className="text-center">
              <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-3" />
              <h3 className="text-xl font-semibold mb-2">Security</h3>
              <p>Smart contracts ensure secure and automated transactions</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of farmers and buyers on FarmChain today
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a
              href="/auth/register"
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Sign Up Now
            </a>
            <a
              href="/marketplace"
              className="px-8 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              Browse Marketplace
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
