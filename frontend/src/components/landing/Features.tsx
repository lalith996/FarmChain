'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap-config';

const features = [
  {
    icon: '🌱',
    title: 'Crop Registration',
    description: 'Register your crops on the blockchain for complete traceability',
  },
  {
    icon: '⛓️',
    title: 'Blockchain Records',
    description: 'Immutable records of every transaction and movement',
  },
  {
    icon: '✅',
    title: 'Quality Assurance',
    description: 'AI-powered quality checks at every stage',
  },
  {
    icon: '🚚',
    title: 'Supply Chain Tracking',
    description: 'Real-time tracking from farm to consumer',
  },
  {
    icon: '💰',
    title: 'Smart Payments',
    description: 'Automated payments with smart contracts',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    description: 'Comprehensive insights and reporting',
  },
];

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray('.feature-card');
    
    cards.forEach((card: any) => {
      gsap.from(card, {
        opacity: 0,
        y: 100,
        scale: 0.8,
        duration: 0.8,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          end: 'top 50%',
          scrub: 1,
        },
      });

      // Hover animation
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.05,
          y: -10,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="py-20 px-4 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-4 text-gray-800">
          Powerful Features
        </h2>
        <p className="text-xl text-center text-gray-600 mb-16">
          Everything you need to transform your agricultural supply chain
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow cursor-pointer"
            >
              <div className="text-6xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
