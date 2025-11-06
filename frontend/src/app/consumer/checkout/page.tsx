'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { getRoleTheme } from '@/config/roleThemes';
import { CheckCircleIcon, CreditCardIcon, TruckIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const theme = getRoleTheme('CONSUMER');
  const [step, setStep] = useState(1);
  const user = { name: 'John Customer', email: 'john@example.com' };

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4">
          {[
            { num: 1, label: 'Delivery', icon: MapPinIcon },
            { num: 2, label: 'Payment', icon: CreditCardIcon },
            { num: 3, label: 'Confirm', icon: CheckCircleIcon },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.num}>
                <div className={`flex items-center gap-2 ${step >= s.num ? 'text-purple-600' : 'text-gray-400'}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= s.num ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}><Icon className="h-5 w-5" /></div>
                  <span className="font-medium">{s.label}</span>
                </div>
                {idx < 2 && <div className={`h-0.5 w-16 ${step > s.num ? 'bg-purple-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            {step === 1 && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" className="rounded-lg border border-gray-300 px-4 py-2" />
                    <input type="text" placeholder="Last Name" className="rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <input type="text" placeholder="Street Address" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" placeholder="City" className="rounded-lg border border-gray-300 px-4 py-2" />
                    <input type="text" placeholder="State" className="rounded-lg border border-gray-300 px-4 py-2" />
                    <input type="text" placeholder="ZIP" className="rounded-lg border border-gray-300 px-4 py-2" />
                  </div>
                  <input type="tel" placeholder="Phone Number" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
                </div>
              </div>
            )}

            {/* Payment Method */}
            {step === 2 && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-4">
                  {['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'].map((method) => (
                    <label key={method} className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:border-purple-500">
                      <input type="radio" name="payment" className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Order Confirmation */}
            {step === 3 && (
              <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-8 text-center">
                <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Order Confirmed!</h2>
                <p className="mt-2 text-gray-600">Your order #1234 has been placed successfully</p>
                <button className="mt-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-bold text-white">Track Order</button>
              </div>
            )}

            <div className="flex gap-4">
              {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 rounded-lg border-2 border-gray-300 py-3 font-semibold hover:bg-gray-50">Back</button>}
              {step < 3 && <button onClick={() => setStep(step + 1)} className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-bold text-white">Continue</button>}
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-xl bg-white p-6 shadow-lg h-fit sticky top-6">
            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">$23.96</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className="font-semibold text-green-600">FREE</span></div>
              <div className="border-t pt-3 flex justify-between text-lg"><span className="font-bold">Total</span><span className="font-bold text-purple-600">$23.96</span></div>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
