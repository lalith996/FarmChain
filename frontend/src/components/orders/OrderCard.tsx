'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { Order } from '@/types';
import { format } from 'date-fns';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const getStatusColor = (status: string) => {
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
      case 'disputed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Link href={`/orders/${order._id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Product Image */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {order.productSnapshot?.images?.[0] ? (
                <Image
                  src={order.productSnapshot.images[0]}
                  alt={order.productSnapshot.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Order Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {order.productSnapshot?.name || 'Product'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Order #{order.orderId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span className="truncate">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span className="truncate">
                    ₹{order.orderDetails.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ShoppingBagIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span className="truncate">
                    {order.orderDetails.quantity} {order.orderDetails.unit}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TruckIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span className="truncate">
                    {order.delivery.address.city}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="ml-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        {order.delivery.expectedDate && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Expected Delivery:{' '}
              <span className="font-medium text-gray-900">
                {format(new Date(order.delivery.expectedDate), 'MMM dd, yyyy')}
              </span>
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
