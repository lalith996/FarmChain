'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  interactive = false,
  onChange
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);
        const isPartial = starValue > rating && starValue - 1 < rating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={`
              ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              transition-transform duration-150
              ${!interactive && 'pointer-events-none'}
            `}
          >
            {isFilled ? (
              <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
            ) : isPartial ? (
              <div className="relative">
                <StarOutlineIcon className={`${sizeClasses[size]} text-yellow-400`} />
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${(rating % 1) * 100}%` }}>
                  <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
                </div>
              </div>
            ) : (
              <StarOutlineIcon className={`${sizeClasses[size]} text-gray-300`} />
            )}
          </button>
        );
      })}
      {showNumber && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
