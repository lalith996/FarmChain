'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { getRoleTheme } from '@/config/roleThemes';
import { ShoppingCartIcon, TrashIcon, HeartIcon, TagIcon } from '@heroicons/react/24/outline';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  inStock: boolean;
}

export default function ShoppingCartPage() {
  const theme = getRoleTheme('CONSUMER');
  const user = { name: 'John Customer', email: 'john@example.com' };

  const [cart, setCart] = useState<CartItem[]>([
    { id: 'P-001', name: 'Organic Tomatoes', price: 3.99, quantity: 2, image: '🍅', inStock: true },
    { id: 'P-002', name: 'Fresh Strawberries', price: 5.99, quantity: 1, image: '🍓', inStock: true },
    { id: 'P-003', name: 'Farm Fresh Milk', price: 4.49, quantity: 3, image: '🥛', inStock: true },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = subtotal > 50 ? 0 : 5.99;
  const discount = 0;
  const total = subtotal + delivery - discount;

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart ({cart.length} items)</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="rounded-xl bg-white p-6 shadow-lg">
                <div className="flex gap-4">
                  <div className="text-6xl">{item.image}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.inStock ? 'In Stock' : 'Out of Stock'}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 rounded-lg border border-gray-300 font-bold hover:bg-gray-100">−</button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 rounded-lg border border-gray-300 font-bold hover:bg-gray-100">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"><TrashIcon className="h-4 w-4" /> Remove</button>
                      <button className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"><HeartIcon className="h-4 w-4" /> Save for Later</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">${item.price} each</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="sticky top-6 rounded-xl bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className="font-semibold">{delivery === 0 ? <span className="text-green-600">FREE</span> : `$${delivery.toFixed(2)}`}</span></div>
                {discount > 0 && <div className="flex justify-between"><span className="text-gray-600">Discount</span><span className="font-semibold text-green-600">-${discount.toFixed(2)}</span></div>}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg"><span className="font-bold text-gray-900">Total</span><span className="font-bold text-purple-600">${total.toFixed(2)}</span></div>
              </div>

              <div className="mt-4">
                <div className="flex gap-2">
                  <input type="text" placeholder="Promo code" className="flex-1 rounded-lg border border-gray-300 px-4 py-2" />
                  <button className="rounded-lg bg-gray-100 px-4 py-2 font-semibold hover:bg-gray-200">Apply</button>
                </div>
              </div>

              <button className="mt-6 w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-bold text-white shadow-lg hover:shadow-xl">
                Proceed to Checkout
              </button>

              {delivery > 0 && <p className="mt-3 text-center text-sm text-gray-600">Add ${(50 - subtotal).toFixed(2)} more for FREE delivery!</p>}
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
