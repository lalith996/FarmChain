'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  onClick?: () => void;
}

export function StatCard({ title, value, icon, trend, color = 'blue', onClick }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
      {trend && (
        <div className="flex items-center text-sm">
          <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-gray-500 ml-2">from last month</span>
        </div>
      )}
    </div>
  );
}
