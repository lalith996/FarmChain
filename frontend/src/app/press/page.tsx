'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { NewspaperIcon, DocumentArrowDownIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function PressPage() {
  const pressReleases = [
    {
      id: 1,
      title: 'FarmChain Raises $10M in Series A Funding',
      date: '2024-11-01',
      excerpt: 'Leading agritech platform secures funding to expand blockchain-powered supply chain solutions across India.',
      category: 'Funding',
    },
    {
      id: 2,
      title: 'FarmChain Reaches 10,000 Registered Farmers Milestone',
      date: '2024-10-15',
      excerpt: 'Platform celebrates major growth milestone as farmers embrace blockchain technology for transparent trading.',
      category: 'Milestone',
    },
    {
      id: 3,
      title: 'Partnership with Polygon Network Announced',
      date: '2024-09-20',
      excerpt: 'Strategic partnership to enhance blockchain infrastructure and reduce transaction costs for farmers.',
      category: 'Partnership',
    },
  ];

  const mediaKit = [
    { name: 'Company Logo (PNG)', icon: PhotoIcon, size: '2.5 MB' },
    { name: 'Brand Guidelines', icon: DocumentArrowDownIcon, size: '5.1 MB' },
    { name: 'Product Screenshots', icon: PhotoIcon, size: '8.3 MB' },
    { name: 'Executive Photos', icon: PhotoIcon, size: '3.7 MB' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Press & Media"
        description="Latest news, press releases, and media resources"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Info */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-4">Media Inquiries</h2>
          <p className="mb-4">For press inquiries, interviews, or media requests, please contact:</p>
          <div className="space-y-2">
            <p><strong>Email:</strong> press@farmchain.com</p>
            <p><strong>Phone:</strong> +91 1234 567 890</p>
            <p><strong>Response Time:</strong> Within 24 hours</p>
          </div>
        </div>

        {/* Press Releases */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Press Releases</h3>
          <div className="space-y-4">
            {pressReleases.map((release) => (
              <div key={release.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {release.category}
                      </span>
                      <span className="text-sm text-gray-500">{new Date(release.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{release.title}</h4>
                    <p className="text-gray-600 mb-4">{release.excerpt}</p>
                  </div>
                  <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Kit */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Media Kit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaKit.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 text-center">
                  <Icon className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{item.size}</p>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured In */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">As Featured In</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {['TechCrunch', 'Economic Times', 'YourStory', 'Inc42'].map((outlet, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">📰</div>
                <p className="font-semibold text-gray-700">{outlet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
