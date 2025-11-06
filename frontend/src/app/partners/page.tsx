'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { BuildingOfficeIcon, TruckIcon, BanknotesIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export default function PartnersPage() {
  const partnerCategories = [
    {
      title: 'Technology Partners',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-100 text-blue-600',
      partners: [
        { name: 'Polygon Network', description: 'Blockchain infrastructure', logo: '⬡' },
        { name: 'IPFS', description: 'Decentralized storage', logo: '📦' },
        { name: 'Chainlink', description: 'Oracle services', logo: '🔗' },
      ],
    },
    {
      title: 'Logistics Partners',
      icon: TruckIcon,
      color: 'bg-green-100 text-green-600',
      partners: [
        { name: 'Delhivery', description: 'Nationwide delivery', logo: '🚚' },
        { name: 'BlueDart', description: 'Express shipping', logo: '📮' },
        { name: 'India Post', description: 'Rural connectivity', logo: '✉️' },
      ],
    },
    {
      title: 'Financial Partners',
      icon: BanknotesIcon,
      color: 'bg-yellow-100 text-yellow-600',
      partners: [
        { name: 'HDFC Bank', description: 'Banking services', logo: '🏦' },
        { name: 'PayTM', description: 'Digital payments', logo: '💳' },
        { name: 'Razorpay', description: 'Payment gateway', logo: '💰' },
      ],
    },
    {
      title: 'Educational Partners',
      icon: AcademicCapIcon,
      color: 'bg-purple-100 text-purple-600',
      partners: [
        { name: 'ICAR', description: 'Agricultural research', logo: '🎓' },
        { name: 'NABARD', description: 'Rural development', logo: '🌱' },
        { name: 'Krishi Vigyan Kendra', description: 'Farmer training', logo: '📚' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Our Partners"
        description="Collaborating with industry leaders to serve you better"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-white mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Building the Future Together</h2>
          <p className="text-lg">We partner with the best to bring you world-class services</p>
        </div>

        {/* Partner Categories */}
        <div className="space-y-12">
          {partnerCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {category.partners.map((partner, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                      <div className="text-5xl mb-4 text-center">{partner.logo}</div>
                      <h4 className="text-lg font-bold text-gray-900 text-center mb-2">{partner.name}</h4>
                      <p className="text-gray-600 text-center text-sm">{partner.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Become a Partner CTA */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Interested in Partnering?</h3>
            <p className="text-gray-600 mb-6">
              Join our ecosystem and help us revolutionize agriculture
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Contact Partnership Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
