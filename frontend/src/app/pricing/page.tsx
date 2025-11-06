'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function PricingPage() {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      description: 'Perfect for small farmers getting started',
      features: [
        'List up to 10 products',
        'Basic analytics',
        'Blockchain verification',
        'Standard support',
        '2% transaction fee',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Professional',
      price: '₹999/month',
      description: 'For growing farms and distributors',
      features: [
        'Unlimited product listings',
        'Advanced analytics',
        'Priority blockchain verification',
        'Priority support',
        '1.5% transaction fee',
        'Featured listings',
        'Bulk order management',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations and cooperatives',
      features: [
        'Everything in Professional',
        'Custom integrations',
        'Dedicated account manager',
        'API access',
        '1% transaction fee',
        'White-label options',
        'Custom contracts',
        '24/7 support',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Pricing Plans"
        description="Choose the perfect plan for your farming business"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-8 ${
                plan.popular ? 'ring-2 ring-green-600 relative' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
                  plan.popular
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept cryptocurrency payments (MATIC) and traditional payment methods.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">Yes, Professional plan comes with a 14-day free trial.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What are transaction fees?</h4>
              <p className="text-gray-600">Transaction fees are charged on successful sales and vary by plan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
