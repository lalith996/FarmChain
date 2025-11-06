'use client';

import { motion } from 'framer-motion';
import { NewspaperIcon, CalendarIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Blockchain', 'Agriculture', 'Technology', 'Sustainability', 'Case Studies'];

  const blogPosts = [
    {
      id: 1,
      title: 'How Blockchain is Transforming Agricultural Supply Chains',
      excerpt: 'Discover how blockchain technology is revolutionizing transparency and trust in food supply chains.',
      author: 'Sarah Johnson',
      date: 'November 5, 2024',
      category: 'Blockchain',
      image: '🔗',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Smart Contracts for Fair Trade: A Farmers Perspective',
      excerpt: 'Learn how smart contracts ensure farmers receive fair prices for their produce.',
      author: 'Michael Chen',
      date: 'November 3, 2024',
      category: 'Agriculture',
      image: '🌾',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'Reducing Food Waste with Supply Chain Visibility',
      excerpt: 'How real-time tracking helps minimize waste from farm to table.',
      author: 'Emily Rodriguez',
      date: 'November 1, 2024',
      category: 'Sustainability',
      image: '♻️',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'Case Study: 50% Increase in Farmer Revenue with FarmChain',
      excerpt: 'A detailed look at how Indian farmers doubled their income using our platform.',
      author: 'Raj Patel',
      date: 'October 28, 2024',
      category: 'Case Studies',
      image: '📈',
      readTime: '10 min read'
    },
    {
      id: 5,
      title: 'The Future of Decentralized Agriculture',
      excerpt: 'Exploring emerging trends in blockchain-powered farming.',
      author: 'David Kim',
      date: 'October 25, 2024',
      category: 'Technology',
      image: '🚀',
      readTime: '8 min read'
    },
    {
      id: 6,
      title: 'Building Trust Through Transparent Food Tracking',
      excerpt: 'Why consumers demand transparency and how we deliver it.',
      author: 'Lisa Anderson',
      date: 'October 20, 2024',
      category: 'Blockchain',
      image: '🔍',
      readTime: '5 min read'
    }
  ];

  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Hero */}
      <motion.div
        className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center justify-center mb-8"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <NewspaperIcon className="h-24 w-24" />
          </motion.div>
          <motion.h1
            className="text-6xl font-bold text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            FarmChain Blog
          </motion.h1>
          <motion.p
            className="text-2xl text-center text-green-100 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Insights, stories, and updates from the future of agriculture
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-green-50 border-2 border-gray-200'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
            >
              <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-8xl">
                {post.image}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-green-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="mt-4 flex items-center text-green-600 font-semibold hover:text-green-700"
                >
                  Read More
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </motion.button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-12 text-white text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest insights on blockchain agriculture
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-300"
            />
            <button className="px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-green-50 transition-all shadow-lg">
              Subscribe
            </button>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
