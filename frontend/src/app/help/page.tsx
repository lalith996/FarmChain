'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'getting-started', 'products', 'orders', 'payments', 'blockchain'];

  const faqs: FAQ[] = [
    {
      category: 'getting-started',
      question: 'How do I create an account on FarmChain?',
      answer: 'To create an account, click on the "Get Started" button and connect your Web3 wallet (MetaMask, WalletConnect, etc.). Complete your profile information and KYC verification to start using the platform.',
    },
    {
      category: 'getting-started',
      question: 'What is KYC verification and why is it required?',
      answer: 'KYC (Know Your Customer) verification helps us ensure the authenticity of all users on the platform. It involves submitting identity documents and business information. This process helps build trust and security in the marketplace.',
    },
    {
      category: 'products',
      question: 'How do I list my products as a farmer?',
      answer: 'Navigate to the "Register Product" page, fill in product details including name, category, quantity, price, and quality grade. Upload product images and certifications. Your product will be registered on the blockchain for transparency.',
    },
    {
      category: 'products',
      question: 'What are quality grades?',
      answer: 'Quality grades (A, B, C) indicate the quality level of agricultural products. Grade A represents premium quality, Grade B is standard quality, and Grade C is basic quality. Our AI system can also provide quality scores based on product images.',
    },
    {
      category: 'orders',
      question: 'How do I place an order?',
      answer: 'Browse products in the marketplace, select the product you want, specify the quantity, and click "Buy Now". Review the order details and confirm payment. You can track your order status in real-time.',
    },
    {
      category: 'orders',
      question: 'Can I cancel an order?',
      answer: 'Orders can be cancelled before they are shipped. Go to "My Orders", select the order, and click "Cancel Order". Refunds will be processed according to our refund policy.',
    },
    {
      category: 'payments',
      question: 'What payment methods are supported?',
      answer: 'We support cryptocurrency payments through your connected wallet (MATIC on Polygon network). Payments are secured through smart contracts and released to farmers upon successful delivery.',
    },
    {
      category: 'payments',
      question: 'How do I withdraw my earnings?',
      answer: 'Farmers can withdraw earnings from their wallet dashboard. Navigate to "Wallet", click "Withdraw", enter the amount, and confirm the transaction. Funds will be transferred to your connected wallet.',
    },
    {
      category: 'blockchain',
      question: 'What is blockchain verification?',
      answer: 'Blockchain verification ensures product authenticity and traceability. Each product is registered on the Polygon blockchain with a unique transaction hash. You can verify product history and ownership at any time.',
    },
    {
      category: 'blockchain',
      question: 'How can I track my product on the blockchain?',
      answer: 'Use the "Track Product" feature by entering the product ID. You\'ll see the complete supply chain journey including registration, transfers, and current status, all verified on the blockchain.',
    },
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Help Center"
        description="Find answers to common questions and get support"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-3.5" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto mb-8 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-4 mb-8">
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-600">No FAQs found matching your search.</p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
                  {expandedIndex === index ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                  )}
                </button>
                {expandedIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
          <p className="mb-6">Our support team is here to assist you</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/contact"
              className="flex items-center space-x-3 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <span>Live Chat</span>
            </a>
            <a
              href="mailto:support@farmchain.com"
              className="flex items-center space-x-3 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <EnvelopeIcon className="h-6 w-6" />
              <span>Email Us</span>
            </a>
            <a
              href="tel:+911234567890"
              className="flex items-center space-x-3 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <PhoneIcon className="h-6 w-6" />
              <span>Call Us</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
