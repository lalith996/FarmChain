'use client';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'info' | 'error';
  };
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function PageHeader({ title, description, badge, action }: PageHeaderProps) {
  const badgeColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {badge && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColors[badge.variant || 'info']}`}>
                  {badge.text}
                </span>
              )}
            </div>
            {description && (
              <p className="text-gray-600">{description}</p>
            )}
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
