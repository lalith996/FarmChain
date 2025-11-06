'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { getRoleTheme } from '@/config/roleThemes';
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  PrinterIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export default function RetailerPOSPage() {
  const theme = getRoleTheme('RETAILER');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const user = {
    name: 'Store Manager',
    email: 'manager@retailstore.com',
  };

  // Mock products
  const products: Product[] = [
    { id: '1', name: 'Organic Tomatoes', price: 4.99, category: 'Vegetables', stock: 50 },
    { id: '2', name: 'Fresh Lettuce', price: 2.99, category: 'Vegetables', stock: 30 },
    { id: '3', name: 'Red Apples', price: 3.49, category: 'Fruits', stock: 100 },
    { id: '4', name: 'Bananas', price: 1.99, category: 'Fruits', stock: 80 },
    { id: '5', name: 'Whole Milk', price: 4.49, category: 'Dairy', stock: 40 },
    { id: '6', name: 'Brown Eggs (12)', price: 5.99, category: 'Dairy', stock: 25 },
    { id: '7', name: 'Carrots', price: 2.49, category: 'Vegetables', stock: 60 },
    { id: '8', name: 'Orange Juice', price: 6.99, category: 'Beverages', stock: 35 },
  ];

  const categories = ['all', 'Vegetables', 'Fruits', 'Dairy', 'Beverages'];

  const filteredProducts = products.filter(p =>
    (selectedCategory === 'all' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleCheckout = (method: string) => {
    alert(`Processing payment via ${method}\nTotal: $${total.toFixed(2)}`);
    setCart([]);
  };

  return (
    <RoleBasedLayout role="RETAILER" user={user}>
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        {/* Products Section */}
        <div className="flex-1 flex flex-col space-y-4">
          {/* Search & Categories */}
          <div className="rounded-lg bg-white p-4 shadow">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="mt-3 flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto rounded-lg bg-white p-4 shadow">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="rounded-lg border-2 border-gray-200 p-4 text-left transition-all hover:border-amber-500 hover:shadow-lg"
                >
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 mb-3 flex items-center justify-center">
                    <ShoppingCartIcon className="h-12 w-12 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 flex flex-col space-y-4">
          {/* Cart Header */}
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Current Order</h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto rounded-lg bg-white p-4 shadow">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <ShoppingCartIcon className="h-16 w-16 mb-2" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="rounded-lg bg-gray-100 p-1 hover:bg-gray-200"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="rounded-lg bg-gray-100 p-1 hover:bg-gray-200"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals & Checkout */}
          {cart.length > 0 && (
            <div className="rounded-lg bg-white p-4 shadow">
              <div className="space-y-2 border-b border-gray-200 pb-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-amber-600">${total.toFixed(2)}</span>
              </div>

              {/* Payment Methods */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCheckout('Cash')}
                  className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600"
                >
                  <BanknotesIcon className="h-5 w-5" />
                  Cash
                </button>
                <button
                  onClick={() => handleCheckout('Card')}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white hover:bg-blue-600"
                >
                  <CreditCardIcon className="h-5 w-5" />
                  Card
                </button>
                <button
                  onClick={() => handleCheckout('Digital Wallet')}
                  className="flex items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-3 font-semibold text-white hover:bg-purple-600"
                >
                  <QrCodeIcon className="h-5 w-5" />
                  Wallet
                </button>
                <button
                  className="flex items-center justify-center gap-2 rounded-lg bg-gray-500 px-4 py-3 font-semibold text-white hover:bg-gray-600"
                >
                  <PrinterIcon className="h-5 w-5" />
                  Print
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleBasedLayout>
  );
}
