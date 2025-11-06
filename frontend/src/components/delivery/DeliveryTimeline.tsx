'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import toast from 'react-hot-toast';

interface TimelineStep {
  status: string;
  message: string;
  location: string | null;
  timestamp: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  isCompleted: boolean;
}

interface DeliveryTimelineProps {
  orderId: string;
}

export function DeliveryTimeline({ orderId }: DeliveryTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [currentStatus, setCurrentStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [orderId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery/timeline/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTimeline(response.data.data.timeline);
      setCurrentStatus(response.data.data.currentStatus);
    } catch (error: any) {
      console.error('Error fetching timeline:', error);
      toast.error('Failed to load delivery timeline');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      order_placed: 'bg-blue-500',
      confirmed: 'bg-blue-600',
      preparing: 'bg-yellow-500',
      ready_for_pickup: 'bg-yellow-600',
      picked_up: 'bg-purple-500',
      in_transit: 'bg-purple-600',
      out_for_delivery: 'bg-green-500',
      delivered: 'bg-green-600',
      cancelled: 'bg-red-500',
      failed: 'bg-red-600'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Delivery Timeline</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Timeline steps */}
        <div className="space-y-6">
          {timeline.map((step, index) => (
            <div key={index} className="relative flex items-start space-x-4">
              {/* Icon */}
              <div className={`
                relative z-10 flex items-center justify-center h-10 w-10 rounded-full
                ${step.isCompleted ? getStatusColor(step.status) : 'bg-gray-300'}
              `}>
                {step.isCompleted ? (
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                ) : (
                  <ClockIcon className="h-6 w-6 text-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center justify-between">
                  <p className={`
                    text-sm font-medium
                    ${step.isCompleted ? 'text-gray-900' : 'text-gray-500'}
                  `}>
                    {step.message}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-gray-500">
                      {formatDate(step.timestamp)}
                    </p>
                  )}
                </div>

                {step.location && (
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {step.location}
                  </p>
                )}

                {step.estimatedDelivery && !step.actualDelivery && (
                  <p className="text-xs text-gray-500 mt-1">
                    Est. delivery: {formatDate(step.estimatedDelivery)}
                  </p>
                )}

                {step.actualDelivery && (
                  <p className="text-xs text-green-600 mt-1">
                    Delivered: {formatDate(step.actualDelivery)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Status Badge */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Status:</span>
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium text-white
            ${getStatusColor(currentStatus)}
          `}>
            {currentStatus.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
