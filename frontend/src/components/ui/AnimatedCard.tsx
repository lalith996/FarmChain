'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap-config';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 50,
      scale: 0.9,
      duration: 0.8,
      delay,
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 85%',
      },
    });

    // Hover animation
    const card = cardRef.current;
    if (card) {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -10,
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    }
  }, { scope: cardRef });

  return (
    <div ref={cardRef} className={`cursor-pointer ${className}`}>
      {children}
    </div>
  );
}
