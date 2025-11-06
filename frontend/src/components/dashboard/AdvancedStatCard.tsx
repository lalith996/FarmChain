'use client';

import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    direction: 'up' | 'down';
    value: string | number;
    label?: string;
  };
  gradient?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export default function AdvancedStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient = 'from-blue-500 to-blue-600',
  onClick,
  isLoading = false,
}: StatCardProps) {
  const cardClasses = `
    relative overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300
    ${onClick ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]' : ''}
    ${isLoading ? 'animate-pulse' : ''}
  `;

  return (
    <motion.div
      className={cardClasses}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { y: -4 } : {}}
    >
      {/* Background gradient decoration */}
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10`} />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {isLoading ? (
              <div className="mt-2 h-8 w-32 animate-pulse rounded bg-gray-200" />
            ) : (
              <p className="mt-2 text-3xl font-bold text-gray-900">
                <CountUpAnimation value={typeof value === 'number' ? value : 0}>
                  {value}
                </CountUpAnimation>
              </p>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>

          {Icon && (
            <div className={`rounded-lg bg-gradient-to-br ${gradient} p-3 shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {trend && !isLoading && (
          <div className="mt-4 flex items-center text-sm">
            <span
              className={`flex items-center gap-1 font-medium ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.direction === 'up' ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
              {trend.value}
            </span>
            <span className="ml-2 text-gray-500">
              {trend.label || 'from last period'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CountUpAnimation({ value, children }: { value: number; children: React.ReactNode }) {
  // If value is not a number, just render children
  if (typeof children !== 'number') {
    return <>{children}</>;
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.span>
  );
}

// Grid container for stat cards
export function StatCardsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}
