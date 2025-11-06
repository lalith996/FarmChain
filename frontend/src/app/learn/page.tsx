'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { BookOpenIcon, AcademicCapIcon, VideoCameraIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'blockchain', 'farming', 'trading', 'technology'];

  const resources = [
    {
      id: 1,
      title: 'Introduction to Blockchain in Agriculture',
      description: 'Learn the basics of blockchain technology and how it revolutionizes agriculture supply chains.',
      category: 'blockchain',
      type: 'article',
      duration: '10 min read',
      level: 'Beginner',
    },
    {
      id: 2,
      title: 'Smart Contracts Explained',
      description: 'Understanding how smart contracts automate transactions and ensure trust in the FarmChain ecosystem.',
      category: 'blockchain',
      type: 'video',
      duration: '15 min',
      level: 'Intermediate',
    },
    {
      id: 3,
      title: 'Sustainable Farming Practices',
      description: 'Best practices for sustainable and organic farming to improve product quality and market value.',
      category: 'farming',
      type: 'article',
      duration: '12 min read',
      level: 'Beginner',
    },
    {
      id: 4,
      title: 'Product Quality Grading System',
      description: 'Learn about our AI-powered quality grading system and how to improve your product grades.',
      category: 'farming',
      type: 'guide',
      duration: '8 min read',
      level: 'Beginner',
    },
    {
      id: 5,
      title: 'Pricing Strategies for Farmers',
      description: 'How to price your products competitively while ensuring fair returns.',
      category: 'trading',
      type: 'article',
      duration: '15 min read',
      level: 'Intermediate',
    },
    {
      id: 6,
      title: 'Using Cryptocurrency Wallets',
      description: 'Step-by-step guide to setting up and using cryptocurrency wallets for transactions.',
      category: 'technology',
      type: 'video',
      duration: '20 min',
      level: 'Beginner',
    },
  ];

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(r => r.category === selectedCategory);

  const getTypeIcon = (type: string) => {
    const icons = {
      article: <DocumentTextIcon className="h-5 w-5" />,
      video: <VideoCameraIcon className="h-5 w-5" />,
      guide: <BookOpenIcon className="h-5 w-5" />,
    };
    return icons[type as keyof typeof icons] || <DocumentTextIcon className="h-5 w-5" />;
  };

  const getLevelColor = (level: string) => {
    const colors = {
      Beginner: 'bg-green-100 text-green-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Learning Center"
        description="Educational resources about blockchain, farming, and trading"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-white mb-12">
          <div className="flex items-center space-x-4 mb-4">
            <AcademicCapIcon className="h-12 w-12" />
            <div>
              <h2 className="text-2xl font-bold">Expand Your Knowledge</h2>
              <p className="text-green-100">Free resources to help you succeed on FarmChain</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto mb-8 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition capitalize ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  {getTypeIcon(resource.type)}
                  <span className="text-sm capitalize">{resource.type}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(resource.level)}`}>
                  {resource.level}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-gray-500">{resource.duration}</span>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                  Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <BookOpenIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Documentation</h3>
            <p className="text-gray-600 text-sm mb-4">
              Comprehensive guides and API documentation
            </p>
            <a href="#" className="text-green-600 hover:text-green-700 font-medium">
              View Docs →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <VideoCameraIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Video Tutorials</h3>
            <p className="text-gray-600 text-sm mb-4">
              Step-by-step video guides for all features
            </p>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Watch Videos →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <AcademicCapIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Webinars</h3>
            <p className="text-gray-600 text-sm mb-4">
              Live sessions with experts and community
            </p>
            <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
              Join Webinar →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
