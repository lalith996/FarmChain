'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import {
  CreditCardIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface PaymentMethod {
  id: string;
  type: 'Credit Card' | 'Debit Card' | 'PayPal' | 'Bank Account';
  provider: string;
  last4?: string;
  cardHolder?: string;
  expiryDate?: string;
  email?: string;
  isDefault: boolean;
  addedDate: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export default function PaymentMethodsPage() {
  const theme = getRoleTheme('CONSUMER');
  const user = { name: 'John Customer', email: 'john@example.com' };
  const [activeTab, setActiveTab] = useState<'payment-methods' | 'transactions' | 'add-method'>('payment-methods');

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'PM-001',
      type: 'Credit Card',
      provider: 'Visa',
      last4: '4242',
      cardHolder: 'JOHN CUSTOMER',
      expiryDate: '12/25',
      isDefault: true,
      addedDate: '2024-01-15',
    },
    {
      id: 'PM-002',
      type: 'PayPal',
      provider: 'PayPal',
      email: 'john@example.com',
      isDefault: false,
      addedDate: '2024-03-20',
    },
    {
      id: 'PM-003',
      type: 'Debit Card',
      provider: 'Mastercard',
      last4: '8888',
      cardHolder: 'JOHN CUSTOMER',
      expiryDate: '08/26',
      isDefault: false,
      addedDate: '2024-06-10',
    },
  ]);

  const transactions: Transaction[] = [
    { id: 'TXN-1234', date: '2025-11-06', description: 'Order #ORD-1234', amount: 45.67, paymentMethod: 'Visa •••• 4242', status: 'Completed' },
    { id: 'TXN-1233', date: '2025-11-05', description: 'Order #ORD-1233', amount: 23.45, paymentMethod: 'Visa •••• 4242', status: 'Completed' },
    { id: 'TXN-1232', date: '2025-11-04', description: 'Order #ORD-1232', amount: 56.78, paymentMethod: 'PayPal', status: 'Completed' },
    { id: 'TXN-1231', date: '2025-11-03', description: 'Order #ORD-1231', amount: 34.90, paymentMethod: 'Mastercard •••• 8888', status: 'Completed' },
    { id: 'TXN-1230', date: '2025-11-02', description: 'Order #ORD-1230', amount: 12.50, paymentMethod: 'Visa •••• 4242', status: 'Failed' },
  ];

  const setDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => ({ ...pm, isDefault: pm.id === id })));
  };

  const deletePaymentMethod = (id: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    }
  };

  const getCardBrandColor = (provider: string) => {
    switch (provider) {
      case 'Visa':
        return 'from-blue-500 to-blue-600';
      case 'Mastercard':
        return 'from-orange-500 to-red-500';
      case 'American Express':
        return 'from-teal-500 to-cyan-500';
      case 'PayPal':
        return 'from-blue-400 to-blue-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'id',
      label: 'Transaction ID',
      sortable: true,
      render: (t) => <span className="font-semibold text-purple-600">{t.id}</span>,
    },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (t) => <span className="text-sm text-gray-600">{t.paymentMethod}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (t) => <span className="font-semibold text-gray-900">${t.amount.toFixed(2)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (t) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            t.status === 'Completed'
              ? 'bg-green-100 text-green-800'
              : t.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {t.status}
        </span>
      ),
    },
  ];

  const totalMethods = paymentMethods.length;
  const totalSpent = transactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
  const successfulTransactions = transactions.filter(t => t.status === 'Completed').length;
  const failedTransactions = transactions.filter(t => t.status === 'Failed').length;

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <button
            onClick={() => setActiveTab('add-method')}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-bold text-white hover:shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Add Payment Method
          </button>
        </div>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Payment Methods"
            value={totalMethods}
            subtitle="Saved cards"
            icon={CreditCardIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Total Spent"
            value={`$${totalSpent.toFixed(2)}`}
            subtitle="All transactions"
            icon={BanknotesIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Successful"
            value={successfulTransactions}
            subtitle="Completed payments"
            icon={CheckCircleIcon}
            gradient="from-blue-500 to-cyan-500"
          />
          <AdvancedStatCard
            title="Failed"
            value={failedTransactions}
            subtitle="Failed attempts"
            icon={ArrowTrendingUpIcon}
            gradient="from-red-500 to-orange-500"
          />
        </StatCardsGrid>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'payment-methods', label: 'Payment Methods', count: paymentMethods.length },
            { id: 'transactions', label: 'Transaction History', count: transactions.length },
            { id: 'add-method', label: 'Add New Method' },
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

        {/* Payment Methods Tab */}
        {activeTab === 'payment-methods' && (
          <>
            {/* Security Notice */}
            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-bold text-gray-900">Your payments are secure</h3>
                  <p className="text-sm text-gray-600">All payment information is encrypted and securely stored</p>
                </div>
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`rounded-xl p-6 shadow-lg ${method.isDefault ? 'border-2 border-purple-500' : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${
                      method.type === 'PayPal' ? '#0070ba' : '#1a1a1a'
                    } 0%, ${method.type === 'PayPal' ? '#003087' : '#4a4a4a'} 100%)`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCardIcon className="h-6 w-6 text-white" />
                        <span className="font-bold text-white">{method.provider}</span>
                        {method.isDefault && (
                          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-purple-600">
                            DEFAULT
                          </span>
                        )}
                      </div>

                      {method.type !== 'PayPal' ? (
                        <>
                          <div className="text-2xl font-mono tracking-wider text-white mb-4">
                            •••• •••• •••• {method.last4}
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-gray-300 mb-1">Card Holder</div>
                              <div className="text-sm font-semibold text-white">{method.cardHolder}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-300 mb-1">Expires</div>
                              <div className="text-sm font-semibold text-white">{method.expiryDate}</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-semibold text-white mb-4">{method.email}</div>
                          <div className="text-sm text-gray-300">PayPal Account</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2 border-t border-white/20 pt-4">
                    {!method.isDefault && (
                      <button
                        onClick={() => setDefaultPayment(method.id)}
                        className="flex-1 rounded-lg bg-white/20 py-2 text-sm font-medium text-white hover:bg-white/30"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => deletePaymentMethod(method.id)}
                      className="rounded-lg bg-red-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'transactions' && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Transaction History</h2>
            <AdvancedDataTable data={transactions} columns={transactionColumns} searchPlaceholder="Search transactions..." />
          </div>
        )}

        {/* Add Payment Method Tab */}
        {activeTab === 'add-method' && (
          <div className="rounded-xl bg-white p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Payment Method</h2>

            {/* Payment Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Type</label>
              <div className="grid grid-cols-2 gap-4">
                {['Credit Card', 'Debit Card', 'PayPal', 'Bank Account'].map((type) => (
                  <button
                    key={type}
                    className="rounded-lg border-2 border-purple-300 p-4 hover:bg-purple-50"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCardIcon className="h-6 w-6 text-purple-600" />
                      <span className="font-medium">{type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Details Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="JOHN CUSTOMER"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Billing ZIP Code</label>
                <input
                  type="text"
                  placeholder="94102"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              {/* Set as Default */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="default-payment" className="h-4 w-4 rounded text-purple-600" />
                <label htmlFor="default-payment" className="text-sm font-medium text-gray-700">
                  Set as default payment method
                </label>
              </div>

              {/* Security Notice */}
              <div className="rounded-lg bg-purple-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <strong>Secure Payment:</strong> Your payment information is encrypted with industry-standard SSL
                    technology and will never be shared.
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-bold text-white hover:shadow-lg">
                  Add Payment Method
                </button>
                <button
                  onClick={() => setActiveTab('payment-methods')}
                  className="rounded-lg border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
