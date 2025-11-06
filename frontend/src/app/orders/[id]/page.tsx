'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { orderAPI } from '@/lib/api';
import { Order } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, params.id, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getById(params.id as string);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order details');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm('Are you sure you want to cancel this order?')) return;

    try {
      setActionLoading(true);
      await orderAPI.cancel(order._id, { reason: 'Cancelled by user' });
      toast.success('Order cancelled successfully');
      fetchOrderDetails();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;

    try {
      setActionLoading(true);
      await orderAPI.updateStatus(order._id, { status: 'delivered' });
      toast.success('Delivery confirmed successfully');
      fetchOrderDetails();
      setShowRatingModal(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to confirm delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      setActionLoading(true);
      await orderAPI.rate(order._id, { rating, review });
      toast.success('Rating submitted successfully');
      setShowRatingModal(false);
      fetchOrderDetails();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
      case 'in_transit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return 'text-gray-600';
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusTimeline = () => {
    if (!order) return [];

    const timeline = [
      {
        status: 'pending',
        label: 'Order Placed',
        date: order.createdAt,
        completed: true,
      },
      {
        status: 'confirmed',
        label: 'Confirmed',
        date: order.statusHistory?.find(h => h.status === 'confirmed')?.timestamp,
        completed: ['confirmed', 'shipped', 'in_transit', 'delivered'].includes(order.status),
      },
      {
        status: 'shipped',
        label: 'Shipped',
        date: order.statusHistory?.find(h => h.status === 'shipped')?.timestamp,
        completed: ['shipped', 'in_transit', 'delivered'].includes(order.status),
      },
      {
        status: 'delivered',
        label: 'Delivered',
        date: order.statusHistory?.find(h => h.status === 'delivered')?.timestamp || order.delivery?.actualDate,
        completed: order.status === 'delivered',
      },
    ];

    return timeline;
  };

  const canCancelOrder = () => {
    return order && ['pending', 'confirmed'].includes(order.status);
  };

  const canConfirmDelivery = () => {
    return order && order.status === 'shipped' && order.buyer._id === user?._id;
  };

  const canRateOrder = () => {
    return order && order.status === 'delivered' && !order.rating && order.buyer._id === user?._id;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/orders"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.orderId}
              </h1>
              <p className="text-gray-600">
                Placed on {order.createdAt ? format(new Date(order.createdAt), 'MMMM dd, yyyy') : 'N/A'}
              </p>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
              {order.status ? order.status.replace(/_/g, ' ').toUpperCase() : 'PENDING'}
            </span>
          </div>

          {/* Status Timeline */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Order Status</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {getStatusTimeline().map((step) => (
                  <div key={step.status} className="relative flex items-start">
                    <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      step.completed 
                        ? 'bg-green-600 border-green-600' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {step.completed && (
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(step.date), 'MMM dd, yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Product Details</h2>
              <div className="flex items-start space-x-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {order.productSnapshot?.images?.[0] ? (
                    <Image
                      src={order.productSnapshot.images[0]}
                      alt={order.productSnapshot.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {order.productSnapshot?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Category: {order.productSnapshot?.category}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Quantity: {order.orderDetails?.quantity || 0} {order.orderDetails?.unit || 'units'}</span>
                    <span>Price: ₹{order.orderDetails?.pricePerUnit || 0}/{order.orderDetails?.unit || 'unit'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <MapPinIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
              </div>
              <div className="text-gray-600 space-y-1">
                <p>{order.delivery?.address?.street || 'N/A'}</p>
                <p>{order.delivery?.address?.city || 'N/A'}, {order.delivery?.address?.state || 'N/A'}</p>
                <p>{order.delivery?.address?.zipCode || 'N/A'}</p>
                <p>{order.delivery?.address?.country || 'N/A'}</p>
              </div>
              {order.delivery?.expectedDate && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Expected Delivery: {' '}
                    <span className="font-medium text-gray-900">
                      {format(new Date(order.delivery.expectedDate), 'MMMM dd, yyyy')}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Seller/Buyer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {user?._id === order.seller._id ? 'Buyer Information' : 'Seller Information'}
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Name:</span>{' '}
                  {user?._id === order.seller._id 
                    ? order.buyer.profile?.name 
                    : order.seller.profile?.name}
                </p>
                {order.seller.profile?.location && (
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">Location:</span>{' '}
                    {order.seller.profile.location.city}, {order.seller.profile.location.state}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {(canCancelOrder() || canConfirmDelivery() || canRateOrder()) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
                <div className="flex flex-wrap gap-3">
                  {canCancelOrder() && (
                    <button
                      onClick={handleCancelOrder}
                      disabled={actionLoading}
                      className="px-6 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  )}
                  {canConfirmDelivery() && (
                    <button
                      onClick={handleConfirmDelivery}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Confirm Delivery
                    </button>
                  )}
                  {canRateOrder() && (
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Rate Order
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.orderDetails.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{order.orderDetails.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">Payment</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${getPaymentStatusColor(order.payment?.status || 'pending')}`}>
                    {(order.payment?.status || 'pending').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium text-gray-900">Escrow</span>
                </div>
              </div>
              {order.payment?.transactionHash && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Transaction Hash:</p>
                  <a
                    href={`https://www.oklink.com/amoy/tx/${order.payment.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 break-all"
                  >
                    {order.payment.transactionHash}
                  </a>
                </div>
              )}
            </div>

            {/* Blockchain Verification */}
            {order.blockchainTxHash && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-green-900">Blockchain Verified</h3>
                </div>
                <p className="text-xs text-green-800 mb-3">
                  This order is recorded on the blockchain for transparency and security.
                </p>
                <a
                  href={`https://www.oklink.com/amoy/tx/${order.blockchainTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  View on Explorer →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Your Order</h2>
              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                        aria-label={`Rate ${star} stars`}
                        title={`${star} star${star > 1 ? 's' : ''}`}
                      >
                        <StarIcon
                          className={`h-8 w-8 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                    Review (Optional)
                  </label>
                  <textarea
                    id="review"
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Share your experience..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Submit Rating
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
