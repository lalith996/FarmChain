'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { CheckCircleIcon, ArrowTrendingUpIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      id: 1,
      title: 'Rajesh Kumar: From Local Farmer to Regional Supplier',
      farmer: 'Rajesh Kumar',
      location: 'Punjab, India',
      category: 'Grains',
      image: '🌾',
      stats: {
        revenue: '+250%',
        reach: '500+ buyers',
        rating: '4.9/5',
      },
      story: 'Rajesh started with just 5 acres of land and struggled to find fair prices for his organic rice. After joining FarmChain, he gained direct access to buyers across India, eliminating middlemen and increasing his profits by 250%.',
      quote: 'FarmChain transformed my farming business. I now get fair prices and have built lasting relationships with buyers.',
    },
    {
      id: 2,
      title: 'Priya Sharma: Building Trust Through Blockchain',
      farmer: 'Priya Sharma',
      location: 'Maharashtra, India',
      category: 'Vegetables',
      image: '🥬',
      stats: {
        revenue: '+180%',
        reach: '300+ buyers',
        rating: '4.8/5',
      },
      story: 'Priya\'s organic vegetables were always high quality, but buyers were skeptical. With blockchain verification on FarmChain, she proved her product authenticity and built a loyal customer base.',
      quote: 'Blockchain verification gave my buyers confidence. My sales tripled within 6 months!',
    },
    {
      id: 3,
      title: 'Amit Patel: Scaling with Technology',
      farmer: 'Amit Patel',
      location: 'Gujarat, India',
      category: 'Fruits',
      image: '🍎',
      stats: {
        revenue: '+320%',
        reach: '800+ buyers',
        rating: '5.0/5',
      },
      story: 'Amit used FarmChain\'s analytics to understand market demand and optimize his production. He expanded from 10 acres to 50 acres and now supplies to major retailers.',
      quote: 'The analytics helped me make data-driven decisions. I knew exactly what to grow and when to sell.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Success Stories"
        description="Real farmers, real results with FarmChain"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Stats */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-white mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Impact by Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">10,000+</p>
              <p>Farmers Empowered</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">₹100Cr+</p>
              <p>Revenue Generated</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">95%</p>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </div>

        {/* Case Studies */}
        <div className="space-y-12">
          {caseStudies.map((study, index) => (
            <div key={study.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} md:flex`}>
              <div className="md:w-1/3 bg-gradient-to-br from-green-100 to-blue-100 p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">{study.image}</div>
                  <h4 className="text-xl font-bold text-gray-900">{study.farmer}</h4>
                  <p className="text-gray-600">{study.location}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                    {study.category}
                  </span>
                </div>
              </div>

              <div className="md:w-2/3 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{study.title}</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{study.stats.revenue}</p>
                    <p className="text-sm text-gray-600">Revenue Growth</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{study.stats.reach}</p>
                    <p className="text-sm text-gray-600">Buyers Reached</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{study.stats.rating}</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{study.story}</p>

                <div className="bg-gray-50 border-l-4 border-green-600 p-4 rounded">
                  <p className="text-gray-700 italic">"{study.quote}"</p>
                  <p className="text-sm text-gray-600 mt-2">- {study.farmer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Write Your Success Story?</h3>
          <p className="text-gray-600 mb-6">Join thousands of farmers who are transforming their businesses with FarmChain</p>
          <a
            href="/auth/register"
            className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </div>
  );
}
