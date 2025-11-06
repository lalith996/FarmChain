'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { CheckCircleIcon, UserGroupIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
  const stats = [
    { label: 'Registered Farmers', value: '10,000+', icon: UserGroupIcon },
    { label: 'Products Listed', value: '50,000+', icon: GlobeAltIcon },
    { label: 'Transactions', value: '₹100Cr+', icon: CheckCircleIcon },
    { label: 'Verified Users', value: '95%', icon: ShieldCheckIcon },
  ];

  const team = [
    { name: 'Rajesh Kumar', role: 'CEO & Founder', avatar: '👨‍💼' },
    { name: 'Priya Sharma', role: 'CTO', avatar: '👩‍💻' },
    { name: 'Amit Patel', role: 'Head of Operations', avatar: '👨‍🔧' },
    { name: 'Sneha Reddy', role: 'Head of Marketing', avatar: '👩‍💼' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="About FarmChain"
        description="Revolutionizing agriculture through blockchain technology"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            FarmChain is dedicated to transforming the agricultural supply chain by leveraging blockchain technology
            to create transparency, trust, and efficiency. We connect farmers directly with buyers, eliminating
            intermediaries and ensuring fair prices for quality produce.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our platform empowers farmers with technology, provides consumers with traceable products, and builds
            a sustainable ecosystem for the future of agriculture.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Values Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 mb-12 text-white">
          <h2 className="text-3xl font-bold mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">🌱 Sustainability</h3>
              <p>Promoting sustainable farming practices and environmental responsibility</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">🤝 Transparency</h3>
              <p>Blockchain-verified traceability for every product on our platform</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">💪 Empowerment</h3>
              <p>Empowering farmers with technology and fair market access</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  {member.avatar}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-gray-600 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
