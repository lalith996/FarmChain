'use client';

import { useState, useEffect } from 'react';
import { notificationAPI } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import toast from 'react-hot-toast';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  _id: string;
  type: 'order' | 'payment' | 'product' | 'kyc' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          _id: '1',
          type: 'order',
          title: 'New Order Received',
          message: 'You have received a new order for Organic Rice (50 kg)',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          type: 'payment',
          title: 'Payment Received',
          message: 'Payment of ₹5,000 has been credited to your wallet',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: '3',
          type: 'kyc',
          title: 'KYC Verification Approved',
          message: 'Your KYC documents have been verified successfully',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: '4',
          type: 'product',
          title: 'Product Stock Low',
          message: 'Your product "Fresh Tomatoes" is running low on stock',
          read: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type: string) => {
    const icons = {
      order: <ShoppingBagIcon className="h-6 w-6" />,
      payment: <CurrencyDollarIcon className="h-6 w-6" />,
      product: <ShoppingBagIcon className="h-6 w-6" />,
      kyc: <ShieldCheckIcon className="h-6 w-6" />,
      system: <ExclamationTriangleIcon className="h-6 w-6" />,
    };
    return icons[type as keyof typeof icons] || <BellIcon className="h-6 w-6" />;
  };

  const getIconColor = (type: string) => {
    const colors = {
      order: 'bg-blue-100 text-blue-600',
      payment: 'bg-green-100 text-green-600',
      product: 'bg-purple-100 text-purple-600',
      kyc: 'bg-yellow-100 text-yellow-600',
      system: 'bg-red-100 text-red-600',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Notifications"
        description="Stay updated with your latest activities"
        badge={unreadCount > 0 ? { text: `${unreadCount} Unread`, variant: 'warning' } : undefined}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'unread'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              >
                <CheckIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-grow space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? 'You\'re all caught up!'
                : 'You\'ll see notifications here when you have new activity'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-green-600' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getIconColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{notification.message}</p>
                    <div className="flex items-center space-x-3">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700"
                        >
                          <CheckIcon className="h-4 w-4" />
                          <span>Mark as read</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
