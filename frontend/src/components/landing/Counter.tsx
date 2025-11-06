'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap-config';

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export function Counter({ end, duration = 2, suffix = '', prefix = '' }: CounterProps) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const counter = { value: 0 };

    gsap.to(counter, {
      value: end,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        setCount(Math.floor(counter.value));
      },
      scrollTrigger: {
        trigger: counterRef.current,
        start: 'top 80%',
        once: true,
      },
    });
  }, [end, duration]);

  return (
    <span ref={counterRef} className="text-6xl font-bold text-green-600">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}
