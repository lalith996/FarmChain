'use client';

import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

function AnalyticsCard({ title, value, change, icon, color }: AnalyticsCardProps) {
  const isPositive = change >= 0;
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? (
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
          )}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface QuickAnalyticsProps {
  role?: 'admin' | 'farmer' | 'distributor' | 'retailer' | 'consumer';
}

export function QuickAnalytics({ role = 'farmer' }: QuickAnalyticsProps) {
  const getAnalyticsData = () => {
    switch (role) {
      case 'admin':
        return [
          { title: 'Total Revenue', value: '₹2.4M', change: 12.5, icon: <CurrencyDollarIcon className="h-5 w-5" />, color: 'green' as const },
          { title: 'Active Users', value: '1,234', change: 8.2, icon: <UsersIcon className="h-5 w-5" />, color: 'blue' as const },
          { title: 'Total Orders', value: '456', change: 15.3, icon: <ShoppingBagIcon className="h-5 w-5" />, color: 'purple' as const },
          { title: 'Products Listed', value: '89', change: 5.1, icon: <ChartBarIcon className="h-5 w-5" />, color: 'orange' as const },
        ];
      case 'farmer':
        return [
          { title: 'Total Earnings', value: '₹45.2K', change: 18.5, icon: <CurrencyDollarIcon className="h-5 w-5" />, color: 'green' as const },
          { title: 'Products Sold', value: '234', change: 12.3, icon: <ShoppingBagIcon className="h-5 w-5" />, color: 'blue' as const },
          { title: 'Active Listings', value: '12', change: 0, icon: <ChartBarIcon className="h-5 w-5" />, color: 'purple' as const },
          { title: 'Avg. Rating', value: '4.8', change: 2.1, icon: <ArrowTrendingUpIcon className="h-5 w-5" />, color: 'orange' as const },
        ];
      case 'distributor':
        return [
          { title: 'Total Revenue', value: '₹125K', change: 15.2, icon: <CurrencyDollarIcon className="h-5 w-5" />, color: 'green' as const },
          { title: 'Orders Processed', value: '89', change: 10.5, icon: <ShoppingBagIcon className="h-5 w-5" />, color: 'blue' as const },
          { title: 'Active Routes', value: '7', change: 16.7, icon: <ChartBarIcon className="h-5 w-5" />, color: 'purple' as const },
          { title: 'Suppliers', value: '23', change: 4.5, icon: <UsersIcon className="h-5 w-5" />, color: 'orange' as const },
        ];
      case 'retailer':
        return [
          { title: 'Total Sales', value: '₹78.5K', change: 14.8, icon: <CurrencyDollarIcon className="h-5 w-5" />, color: 'green' as const },
          { title: 'Orders', value: '156', change: 9.2, icon: <ShoppingBagIcon className="h-5 w-5" />, color: 'blue' as const },
          { title: 'Inventory Items', value: '45', change: -2.2, icon: <ChartBarIcon className="h-5 w-5" />, color: 'purple' as const },
          { title: 'Customers', value: '89', change: 11.3, icon: <UsersIcon className="h-5 w-5" />, color: 'orange' as const },
        ];
      default:
        return [
          { title: 'Total Spent', value: '₹12.3K', change: 5.5, icon: <CurrencyDollarIcon className="h-5 w-5" />, color: 'green' as const },
          { title: 'Orders', value: '23', change: 15.0, icon: <ShoppingBagIcon className="h-5 w-5" />, color: 'blue' as const },
          { title: 'Wishlist', value: '8', change: 0, icon: <ChartBarIcon className="h-5 w-5" />, color: 'purple' as const },
          { title: 'Saved', value: '₹2.1K', change: 8.7, icon: <ArrowTrendingUpIcon className="h-5 w-5" />, color: 'orange' as const },
        ];
    }
  };

  const data = getAnalyticsData();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((item, index) => (
        <AnalyticsCard key={index} {...item} />
      ))}
    </div>
  );
}
