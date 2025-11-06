'use client';

import { useEffect, useRef } from 'react';
import { anime } from '@/lib/anime-config';
import {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  BoltIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Blockchain Verified',
    description: 'Every product is registered on blockchain for complete transparency and traceability.',
    color: 'from-green-400 to-emerald-600',
    delay: 0,
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Smart Contracts',
    description: 'Automated escrow payments ensure safety and instant settlements for all parties.',
    color: 'from-blue-400 to-cyan-600',
    delay: 100,
  },
  {
    icon: ChartBarIcon,
    title: 'Supply Chain Tracking',
    description: 'Track your products from farm to table with real-time updates and analytics.',
    color: 'from-purple-400 to-pink-600',
    delay: 200,
  },
  {
    icon: UserGroupIcon,
    title: 'Direct Connection',
    description: 'Connect farmers directly with distributors, retailers, and consumers.',
    color: 'from-orange-400 to-red-600',
    delay: 300,
  },
  {
    icon: BoltIcon,
    title: 'Instant Settlements',
    description: 'Lightning-fast transactions with cryptocurrency and traditional payment methods.',
    color: 'from-yellow-400 to-orange-600',
    delay: 400,
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Network',
    description: 'Join a worldwide community of farmers, distributors, and conscious consumers.',
    color: 'from-teal-400 to-green-600',
    delay: 500,
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate title
            if (titleRef.current) {
              anime({
                targets: titleRef.current,
                translateY: [50, 0],
                opacity: [0, 1],
                duration: 1000,
                easing: 'easeOutExpo',
              });
            }

            // Animate cards
            if (cardsRef.current) {
              anime({
                targets: cardsRef.current.children,
                translateY: [100, 0],
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 1200,
                delay: anime.stagger(100, { start: 300 }),
                easing: 'easeOutElastic(1, .8)',
              });
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    
    anime({
      targets: card,
      scale: 1.05,
      translateY: -10,
      duration: 400,
      easing: 'easeOutExpo',
    });

    // Animate icon
    const icon = card.querySelector('.feature-icon');
    anime({
      targets: icon,
      rotate: [0, 360],
      scale: [1, 1.2, 1],
      duration: 600,
      easing: 'easeOutExpo',
    });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    
    anime({
      targets: card,
      scale: 1,
      translateY: 0,
      duration: 400,
      easing: 'easeOutExpo',
    });
  };

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-32 bg-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-2 bg-green-100 text-green-600 rounded-full font-semibold mb-6">
            ✨ Features
          </div>
          <h2
            ref={titleRef}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Why Choose{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
              FarmChain
            </span>
            ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built with cutting-edge blockchain technology to revolutionize the agricultural supply chain
          </p>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardLeave}
              className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>

              {/* Icon */}
              <div
                className={`feature-icon inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Hover Arrow */}
              <div className="flex items-center text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm">Learn more</span>
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-transparent rounded-bl-full"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
