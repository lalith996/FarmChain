import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';

export default function Home() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Blockchain Verified',
      description: 'Every product is registered on blockchain for complete transparency and traceability.',
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Secure Payments',
      description: 'Escrow-based smart contract payments ensure safety for both buyers and sellers.',
    },
    {
      icon: ChartBarIcon,
      title: 'Supply Chain Tracking',
      description: 'Track your products from farm to table with real-time updates.',
    },
    {
      icon: UserGroupIcon,
      title: 'Direct Connection',
      description: 'Connect farmers directly with distributors, retailers, and consumers.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Agricultural Supply Chain
              <br />
              <span className="text-green-200">on Blockchain</span>
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              Transparent, secure, and efficient platform connecting farmers to consumers
              with blockchain-verified products and smart contract payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition"
              >
                Browse Products
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-green-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FarmChain?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge blockchain technology to revolutionize agricultural supply chain
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition"
              >
                <feature.icon className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600">500+</div>
              <div className="text-gray-600 mt-2">Registered Farmers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">1,200+</div>
              <div className="text-gray-600 mt-2">Products Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">3,500+</div>
              <div className="text-gray-600 mt-2">Orders Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">₹10M+</div>
              <div className="text-gray-600 mt-2">Transaction Volume</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join the Revolution?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re a farmer, distributor, retailer, or consumer, 
            FarmChain provides the tools you need for transparent trade.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-green-600 transition"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
}
