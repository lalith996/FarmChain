'use client';

import { useRef } from 'react';
import { animate as anime } from 'animejs';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface AnimatedProductCardProps {
  title: string;
  price: string;
  image: string;
  verified?: boolean;
  delay?: number;
}

export function AnimatedProductCard({ 
  title, 
  price, 
  image, 
  verified = true,
  delay = 0 
}: AnimatedProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!cardRef.current) return;

    anime(cardRef.current, {
      scale: 1.05,
      translateY: -10,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      duration: 300,
      easing: 'easeOutCubic',
    });

    // Animate the badge
    const badge = cardRef.current.querySelector('.verified-badge');
    if (badge) {
      anime(badge, {
        rotate: [0, 360],
        scale: [1, 1.2, 1],
        duration: 600,
        easing: 'easeOutElastic(1, 0.6)',
      });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;

    anime(cardRef.current, {
      scale: 1,
      translateY: 0,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      duration: 300,
      easing: 'easeOutCubic',
    });
  };

  return (
    <div
      ref={cardRef}
      className="relative bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: 0,
        transform: 'translateY(30px)',
        animation: `fadeInUp 0.6s ease-out ${delay}ms forwards`,
      }}
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
        <div className="text-6xl">{image}</div>
        
        {/* Verified Badge */}
        {verified && (
          <div className="verified-badge absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 shadow-lg">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600">{price}</span>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
