'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap-config';

export function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;

      setProgress(progress);

      if (progressRef.current) {
        gsap.to(progressRef.current, {
          width: `${progress}%`,
          duration: 0.1,
          ease: 'none',
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          ref={progressRef}
          className="h-full bg-gradient-to-r from-green-500 to-blue-500"
          style={{ width: '0%' }}
        />
      </div>

      {/* Scroll percentage indicator */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold shadow-lg">
          {Math.round(progress)}%
        </div>
      </div>
    </>
  );
}
