'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-config';

interface ParticleSystemProps {
  count?: number;
  color?: string;
  className?: string;
}

export function ParticleSystem({ 
  count = 50, 
  color = '#10b981',
  className = ''
}: ParticleSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 rounded-full opacity-60';
      particle.style.backgroundColor = color;
      container.appendChild(particle);
      particles.push(particle);

      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      });

      gsap.to(particle, {
        y: '-=100',
        opacity: 0,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        delay: Math.random() * 2,
        ease: 'power1.out',
      });
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, [count, color]);

  return <div ref={containerRef} className={`fixed inset-0 pointer-events-none ${className}`} />;
}
