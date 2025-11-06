'use client';

import { useState, useEffect } from 'react';
import { ScaleIcon } from '@heroicons/react/24/outline';
import { ScaleIcon as ScaleSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface ComparisonButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ComparisonButton({ 
  productId, 
  size = 'md',
  showLabel = false
}: ComparisonButtonProps) {
  const [inComparison, setInComparison] = useState(false);
  const [count, setCount] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  useEffect(() => {
    loadComparisonState();
  }, [productId]);

  const loadComparisonState = () => {
    const comparison = localStorage.getItem('comparison');
    if (comparison) {
      const products = JSON.parse(comparison);
      setInComparison(products.includes(productId));
      setCount(products.length);
    }
  };

  const toggleComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const comparison = localStorage.getItem('comparison');
    let products = comparison ? JSON.parse(comparison) : [];

    if (products.includes(productId)) {
      // Remove from comparison
      products = products.filter((id: string) => id !== productId);
      setInComparison(false);
      toast.success('Removed from comparison');
    } else {
      // Add to comparison
      if (products.length >= 4) {
        toast.error('Maximum 4 products can be compared');
        return;
      }
      products.push(productId);
      setInComparison(true);
      toast.success('Added to comparison');
    }

    localStorage.setItem('comparison', JSON.stringify(products));
    setCount(products.length);

    // Dispatch event for other components
    window.dispatchEvent(new Event('comparison-updated'));
  };

  return (
    <button
      onClick={toggleComparison}
      className={`
        flex items-center space-x-2 p-2 rounded-full 
        hover:bg-gray-100 transition-all duration-200
        ${inComparison ? 'text-blue-500' : 'text-gray-600'}
      `}
      title={inComparison ? 'Remove from comparison' : 'Add to comparison'}
    >
      {inComparison ? (
        <ScaleSolidIcon className={`${sizeClasses[size]} animate-pulse`} />
      ) : (
        <ScaleIcon className={sizeClasses[size]} />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {inComparison ? 'In Comparison' : 'Compare'}
        </span>
      )}
      {count > 0 && !showLabel && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
