'use client';

import { useEffect, useRef } from 'react';
import SplitType from 'split-type';
import { gsap } from '@/lib/gsap-config';

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedText({ children, className = '', delay = 0 }: AnimatedTextProps) {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const text = new SplitType(textRef.current, {
      types: 'chars,words',
    });

    gsap.from(text.chars, {
      opacity: 0,
      y: 20,
      rotateX: -90,
      stagger: 0.02,
      duration: 0.8,
      delay,
      ease: 'back.out',
      scrollTrigger: {
        trigger: textRef.current,
        start: 'top 80%',
      },
    });

    return () => text.revert();
  }, [delay]);

  return (
    <div ref={textRef} className={className}>
      {children}
    </div>
  );
}
