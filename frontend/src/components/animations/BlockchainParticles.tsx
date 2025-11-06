'use client';

import { useEffect, useRef } from 'react';
import { animate as anime } from 'animejs';

export function BlockchainParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const particleCount = 30;
    const container = containerRef.current;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 bg-green-400 rounded-full opacity-60';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      container.appendChild(particle);
      particlesRef.current.push(particle);

      // Animate each particle
      anime(particle, {
        translateX: () => Math.random() * 200 - 100,
        translateY: () => Math.random() * 200 - 100,
        scale: [0.5, 1, 0.5],
        opacity: [0.3, 0.8, 0.3],
        duration: () => Math.random() * 3000 + 3000,
        easing: 'easeInOutSine',
        loop: true,
        delay: () => Math.random() * 2000,
      });
    }

    // Create connection lines
    const drawConnections = () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'absolute inset-0 w-full h-full pointer-events-none');
      svg.style.zIndex = '0';
      
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const distance = Math.hypot(
            p1.offsetLeft - p2.offsetLeft,
            p1.offsetTop - p2.offsetTop
          );

          if (distance < 150) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', p1.offsetLeft.toString());
            line.setAttribute('y1', p1.offsetTop.toString());
            line.setAttribute('x2', p2.offsetLeft.toString());
            line.setAttribute('y2', p2.offsetTop.toString());
            line.setAttribute('stroke', '#10b981');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('opacity', '0.2');
            svg.appendChild(line);
          }
        });
      });

      container.insertBefore(svg, container.firstChild);
    };

    setTimeout(drawConnections, 100);

    return () => {
      particlesRef.current.forEach(p => p.remove());
      particlesRef.current = [];
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
