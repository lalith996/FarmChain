'use client';

import { useEffect, useRef, useState } from 'react';
import { animate as anime } from 'animejs';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({ 
  end, 
  duration = 2000, 
  suffix = '', 
  prefix = '',
  decimals = 0 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            
            const obj = { value: 0 };
            anime(obj, {
              value: end,
              duration,
              easing: 'easeOutExpo',
              round: decimals === 0 ? 1 : Math.pow(10, decimals),
              onUpdate: () => {
                setCount(obj.value);
              },
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, decimals]);

  return (
    <span ref={elementRef}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
}
