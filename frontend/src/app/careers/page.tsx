'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { MapPinIcon, ClockIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

export default function CareersPage() {
  const openings = [
    {
      id: 1,
      title: 'Senior Blockchain Developer',
      department: 'Engineering',
      location: 'Mumbai, India',
      type: 'Full-time',
      experience: '3-5 years',
      description: 'Build and maintain our blockchain infrastructure on Polygon network.',
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Bangalore, India',
      type: 'Full-time',
      experience: '4-6 years',
      description: 'Lead product strategy and roadmap for our farmer-facing features.',
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      experience: '2-4 years',
      description: 'Design intuitive interfaces for farmers and buyers.',
    },
    {
      id: 4,
      title: 'Agricultural Specialist',
      department: 'Operations',
      location: 'Delhi, India',
      type: 'Full-time',
      experience: '5+ years',
      description: 'Work with farmers to improve product quality and farming practices.',
    },
    {
      id: 5,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Mumbai, India',
      type: 'Full-time',
      experience: '3-5 years',
      description: 'Drive growth and farmer acquisition strategies.',
    },
  ];

  const benefits = [
    { icon: '💰', title: 'Competitive Salary', description: 'Industry-leading compensation packages' },
    { icon: '🏥', title: 'Health Insurance', description: 'Comprehensive health coverage for you and family' },
    { icon: '🏖️', title: 'Flexible Time Off', description: 'Unlimited PTO and work-life balance' },
    { icon: '📚', title: 'Learning Budget', description: 'Annual budget for courses and conferences' },
    { icon: '🚀', title: 'Growth Opportunities', description: 'Clear career progression paths' },
    { icon: '🌍', title: 'Remote Work', description: 'Work from anywhere in India' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Careers at FarmChain"
        description="Join us in revolutionizing agriculture with blockchain"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg">
            We're building technology that empowers farmers and creates transparency in the agricultural supply chain.
            Join us in making a real impact on millions of lives.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Join Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h3>
          <div className="space-y-4">
            {openings.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h4>
                    <p className="text-gray-600 mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <BriefcaseIcon className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {job.experience}
                      </span>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold whitespace-nowrap">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Don't See a Perfect Fit?</h3>
          <p className="text-gray-600 mb-6">
            We're always looking for talented people. Send us your resume!
          </p>
          <a
            href="mailto:careers@farmchain.com"
            className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Email Us
          </a>
        </div>
      </div>
    </div>
  );
}
