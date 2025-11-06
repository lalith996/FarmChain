'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  TicketIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful: number;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  created: string;
  lastUpdate: string;
}

export default function SupportPage() {
  const theme = getRoleTheme('CONSUMER');
  const user = { name: 'John Customer', email: 'john@example.com' };
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets' | 'chat'>('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQ[] = [
    {
      id: 'FAQ-001',
      category: 'Orders',
      question: 'How do I track my order?',
      answer: 'You can track your order by going to My Orders page and clicking on the order you want to track. You will see real-time updates on your delivery status.',
      helpful: 45,
    },
    {
      id: 'FAQ-002',
      category: 'Orders',
      question: 'Can I modify my order after placing it?',
      answer: 'Orders can be modified within 30 minutes of placement. After that, please contact our support team for assistance.',
      helpful: 32,
    },
    {
      id: 'FAQ-003',
      category: 'Delivery',
      question: 'What are your delivery hours?',
      answer: 'We deliver Monday to Friday from 8 AM to 8 PM, and Saturday to Sunday from 10 AM to 6 PM. You can set your preferred delivery time in Delivery Preferences.',
      helpful: 58,
    },
    {
      id: 'FAQ-004',
      category: 'Delivery',
      question: 'Is there a minimum order for free delivery?',
      answer: 'Free delivery is available on orders over $30. Orders under $30 have a delivery fee of $5.99.',
      helpful: 67,
    },
    {
      id: 'FAQ-005',
      category: 'Payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, PayPal, and cash on delivery.',
      helpful: 41,
    },
    {
      id: 'FAQ-006',
      category: 'Payment',
      question: 'Is my payment information secure?',
      answer: 'Yes, all payment information is encrypted with industry-standard SSL technology. We never store your full card details.',
      helpful: 52,
    },
    {
      id: 'FAQ-007',
      category: 'Returns',
      question: 'What is your return policy?',
      answer: 'We offer a 100% satisfaction guarantee. If you are not happy with your order, contact us within 24 hours for a full refund or replacement.',
      helpful: 73,
    },
    {
      id: 'FAQ-008',
      category: 'Account',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email, and follow the instructions sent to your email.',
      helpful: 28,
    },
  ];

  const tickets: SupportTicket[] = [
    { id: 'TKT-1001', subject: 'Missing items in delivery', category: 'Orders', status: 'In Progress', priority: 'High', created: '2025-11-06', lastUpdate: '2025-11-06' },
    { id: 'TKT-1002', subject: 'Question about organic certification', category: 'Products', status: 'Resolved', priority: 'Low', created: '2025-11-05', lastUpdate: '2025-11-05' },
    { id: 'TKT-1003', subject: 'Delivery address change', category: 'Delivery', status: 'Closed', priority: 'Medium', created: '2025-11-03', lastUpdate: '2025-11-04' },
  ];

  const categories = ['all', 'Orders', 'Delivery', 'Payment', 'Returns', 'Account', 'Products'];
  const filteredFAQs = selectedCategory === 'all' ? faqs : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const ticketColumns: Column<SupportTicket>[] = [
    { key: 'id', label: 'Ticket ID', sortable: true, render: (t) => <span className="font-semibold text-purple-600">{t.id}</span> },
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (t) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            t.status === 'Open'
              ? 'bg-blue-100 text-blue-800'
              : t.status === 'In Progress'
              ? 'bg-yellow-100 text-yellow-800'
              : t.status === 'Resolved'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {t.status}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (t) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            t.priority === 'High'
              ? 'bg-red-100 text-red-800'
              : t.priority === 'Medium'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {t.priority}
        </span>
      ),
    },
    { key: 'lastUpdate', label: 'Last Update', sortable: true },
  ];

  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Support & Help</h1>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Open Tickets"
            value={openTickets}
            subtitle="Active support requests"
            icon={TicketIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Resolved"
            value={resolvedTickets}
            subtitle="Completed tickets"
            icon={CheckCircleIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Avg Response"
            value="< 2hrs"
            subtitle="Response time"
            icon={ClockIcon}
            gradient="from-blue-500 to-cyan-500"
          />
          <AdvancedStatCard
            title="FAQ Articles"
            value={faqs.length}
            subtitle="Help articles"
            icon={QuestionMarkCircleIcon}
            gradient="from-orange-500 to-amber-500"
          />
        </StatCardsGrid>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <button
            onClick={() => setActiveTab('chat')}
            className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-left text-white shadow-lg hover:shadow-xl transition-all"
          >
            <ChatBubbleLeftRightIcon className="h-8 w-8 mb-3" />
            <h3 className="font-bold text-lg mb-1">Live Chat</h3>
            <p className="text-sm text-purple-100">Get instant help from our team</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs">Available Now</span>
            </div>
          </button>

          <a
            href="tel:+15551234567"
            className="rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-purple-300"
          >
            <PhoneIcon className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-lg text-gray-900 mb-1">Call Us</h3>
            <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
            <p className="text-xs text-gray-500 mt-2">Mon-Fri 8AM-8PM</p>
          </a>

          <a
            href="mailto:support@farmchain.com"
            className="rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-purple-300"
          >
            <EnvelopeIcon className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-lg text-gray-900 mb-1">Email Us</h3>
            <p className="text-sm text-gray-600">support@farmchain.com</p>
            <p className="text-xs text-gray-500 mt-2">Response within 24hrs</p>
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'faq', label: 'FAQs', count: faqs.length },
            { id: 'contact', label: 'Contact Support' },
            { id: 'tickets', label: 'My Tickets', count: tickets.length },
            { id: 'chat', label: 'Live Chat' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-600'}`}
            >
              {tab.label}
              {tab.count && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />}
            </button>
          ))}
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <>
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="rounded-xl bg-white shadow-lg">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900">{faq.question}</h3>
                    </div>
                    {expandedFAQ === faq.id ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="border-t border-gray-200 px-6 pb-6 pt-4">
                      <p className="text-gray-600 mb-4">{faq.answer}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Was this helpful?</span>
                        <button className="rounded-lg border border-gray-300 px-4 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          👍 Yes
                        </button>
                        <button className="rounded-lg border border-gray-300 px-4 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          👎 No
                        </button>
                        <span className="ml-auto text-sm text-gray-500">{faq.helpful} found this helpful</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Contact Support Tab */}
        {activeTab === 'contact' && (
          <div className="rounded-xl bg-white p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Submit a Support Request</h2>

            <div className="space-y-4">
              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                    <option>Orders</option>
                    <option>Delivery</option>
                    <option>Payment</option>
                    <option>Returns</option>
                    <option>Account</option>
                    <option>Products</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="Brief description of your issue"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  placeholder="Please provide details about your issue..."
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-bold text-white hover:shadow-lg">
                Submit Request
              </button>
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Support Tickets</h2>
            <AdvancedDataTable data={tickets} columns={ticketColumns} searchPlaceholder="Search tickets..." />
          </div>
        )}

        {/* Live Chat Tab */}
        {activeTab === 'chat' && (
          <div className="rounded-xl bg-white shadow-lg overflow-hidden" style={{ height: '600px' }}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Support Team</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <span className="text-sm text-purple-100">Online</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between" style={{ height: 'calc(100% - 72px)' }}>
              <div className="flex-1 space-y-4 overflow-y-auto">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div className="rounded-lg bg-gray-100 p-3 max-w-xs">
                    <p className="text-sm text-gray-700">
                      Hi! I'm here to help. How can I assist you today?
                    </p>
                    <span className="text-xs text-gray-500 mt-1">Just now</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                />
                <button className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 font-bold text-white hover:shadow-lg">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
