'use client';

import { useEffect, useRef } from 'react';

interface SmoothScrollProps {
  children: React.ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentScroll = 0;
    let targetScroll = 0;
    let ease = 0.1;
    let animationId: number;

    const smoothScroll = () => {
      targetScroll = window.scrollY;
      currentScroll += (targetScroll - currentScroll) * ease;

      if (scrollRef.current) {
        scrollRef.current.style.transform = `translateY(-${currentScroll}px)`;
      }

      animationId = requestAnimationFrame(smoothScroll);
    };

    // Start smooth scroll on desktop only
    if (window.innerWidth > 768) {
      document.body.style.height = `${scrollRef.current?.scrollHeight}px`;
      animationId = requestAnimationFrame(smoothScroll);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      document.body.style.height = 'auto';
    };
  }, []);

  return (
    <div ref={scrollRef} className="will-change-transform">
      {children}
    </div>
  );
}
