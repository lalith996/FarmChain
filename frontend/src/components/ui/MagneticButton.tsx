'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap-config';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MagneticButton({ children, className = '', onClick }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const { left, top, width, height } = button.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (e.clientX - centerX) * 0.3;
    const deltaY = (e.clientY - centerY) * 0.3;

    gsap.to(button, {
      x: deltaX,
      y: deltaY,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out',
    });
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
