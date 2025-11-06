'use client';

import { useEffect, useRef } from 'react';
import { animate as anime } from 'animejs';

export function SupplyChainFlow() {
  const pathRef = useRef<SVGPathElement>(null);
  const particlesRef = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    // Animate the path drawing
    if (pathRef.current) {
      const pathLength = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = `${pathLength}`;
      pathRef.current.style.strokeDashoffset = `${pathLength}`;

      anime(pathRef.current, {
        strokeDashoffset: [pathLength, 0],
        duration: 2000,
        easing: 'easeInOutQuad',
        delay: 500,
      });
    }

    // Animate particles flowing along the path
    const animateParticles = () => {
      particlesRef.current.forEach((particle, index) => {
        if (particle && pathRef.current) {
          const pathLength = pathRef.current.getTotalLength();
          
          anime(particle, {
            translateX: () => {
              const progress = (index / particlesRef.current.length);
              const point = pathRef.current!.getPointAtLength(progress * pathLength);
              return point.x - 400;
            },
            translateY: () => {
              const progress = (index / particlesRef.current.length);
              const point = pathRef.current!.getPointAtLength(progress * pathLength);
              return point.y - 150;
            },
            opacity: [0, 1, 1, 0],
            duration: 3000,
            delay: index * 300 + 2000,
            easing: 'linear',
            loop: true,
          });
        }
      });
    };

    animateParticles();
  }, []);

  const stages = [
    { icon: '🌾', label: 'Farm', x: 50, y: 150 },
    { icon: '✓', label: 'Quality Check', x: 250, y: 100 },
    { icon: '⛓️', label: 'Blockchain', x: 450, y: 150 },
    { icon: '📦', label: 'Package', x: 650, y: 100 },
    { icon: '🚚', label: 'Delivery', x: 850, y: 150 },
  ];

  return (
    <div className="w-full py-16 bg-gradient-to-b from-green-50 to-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Track Your Product Journey
        </h3>
        
        <svg
          width="900"
          height="300"
          viewBox="0 0 900 300"
          className="mx-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        >
          {/* Animated path */}
          <path
            ref={pathRef}
            d="M 50 150 Q 150 50, 250 100 T 450 150 Q 550 200, 650 100 T 850 150"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Flowing particles */}
          {[...Array(5)].map((_, i) => (
            <circle
              key={i}
              ref={(el) => { particlesRef.current[i] = el; }}
              cx="400"
              cy="150"
              r="4"
              fill="#10b981"
              opacity="0"
            />
          ))}

          {/* Stage markers */}
          {stages.map((stage, index) => (
            <g key={index}>
              <circle
                cx={stage.x}
                cy={stage.y}
                r="30"
                fill="white"
                stroke="#10b981"
                strokeWidth="3"
                className="animate-pulse"
                style={{ animationDelay: `${index * 200}ms` }}
              />
              <text
                x={stage.x}
                y={stage.y + 5}
                textAnchor="middle"
                fontSize="24"
              >
                {stage.icon}
              </text>
              <text
                x={stage.x}
                y={stage.y + 60}
                textAnchor="middle"
                fontSize="14"
                fill="#4b5563"
                fontWeight="600"
              >
                {stage.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
