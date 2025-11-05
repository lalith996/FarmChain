'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ShoppingCartIcon,
  MapPinIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { productAPI, orderAPI } from '@/lib/api';
import { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      router.push('/auth/login');
      return;
    }

    const productId = searchParams.get('productId');
    const qty = parseInt(searchParams.get('quantity') || '1');

    if (!productId) {
      toast.error('Invalid product');
      router.push('/products');
      return;
    }

    setQuantity(qty);
    fetchProduct(productId);
  }, [isAuthenticated, searchParams]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await productAPI.getById(productId);
      setProduct(response.data);

      // Pre-fill delivery address if available
      if (user?.profile?.location) {
        setDeliveryAddress({
          street: user.profile.location.address || '',
          city: user.profile.location.city || '',
          state: user.profile.location.state || '',
          zipCode: '',
          country: user.profile.location.country || 'India',
        });
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    // Validate delivery address
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
      toast.error('Please fill in all delivery address fields');
      return;
    }

    try {
      setSubmitting(true);

      const orderData = {
        productId: product._id,
        quantity,
        totalAmount: product.currentPrice * quantity,
        deliveryAddress,
      };

      const response = await orderAPI.create(orderData);
      
      toast.success('Order placed successfully!');
      
      // Redirect to order details page
      router.push(`/orders/${response.data._id}`);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const totalAmount = product.currentPrice * quantity;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Page Title */}
        <div className="flex items-center space-x-3 mb-6">
          <ShoppingCartIcon className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handleSubmitOrder} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="flex items-start space-x-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    Quantity: <span className="font-medium text-gray-900">{quantity} {product.unit}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Price per unit: <span className="font-medium text-gray-900">₹{product.currentPrice}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPinIcon className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="street"
                  required
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your street address"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  value={deliveryAddress.city}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="City"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  required
                  value={deliveryAddress.state}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="State"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code *
                </label>
                <input
                  type="text"
                  id="zipCode"
                  required
                  value={deliveryAddress.zipCode}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Zip Code"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  required
                  value={deliveryAddress.country}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCardIcon className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Payment</h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Secure Escrow Payment</h3>
                  <p className="text-sm text-blue-800">
                    Your payment will be held in a secure blockchain escrow until you confirm delivery. 
                    The funds will only be released to the farmer after successful delivery confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
