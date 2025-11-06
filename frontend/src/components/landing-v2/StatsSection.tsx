'use client';

import { useEffect, useRef, useState } from 'react';
import { anime } from '@/lib/anime-config';
import {
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    icon: UserGroupIcon,
    value: 500,
    suffix: '+',
    label: 'Registered Farmers',
    color: 'from-green-400 to-emerald-600',
  },
  {
    icon: SparklesIcon,
    value: 10000,
    suffix: '+',
    label: 'Products Listed',
    color: 'from-blue-400 to-cyan-600',
  },
  {
    icon: CheckCircleIcon,
    value: 25000,
    suffix: '+',
    label: 'Orders Completed',
    color: 'from-purple-400 to-pink-600',
  },
  {
    icon: ChartBarIcon,
    value: 50,
    suffix: 'M+',
    label: 'Transaction Volume',
    color: 'from-orange-400 to-red-600',
  },
];

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [counters, setCounters] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            // Animate counters
            stats.forEach((stat, index) => {
              const obj = { value: 0 };
              anime({
                targets: obj,
                value: stat.value,
                duration: 2000,
                easing: 'easeOutExpo',
                round: 1,
                update: () => {
                  setCounters((prev) => {
                    const newCounters = [...prev];
                    newCounters[index] = obj.value;
                    return newCounters;
                  });
                },
              });
            });

            // Animate stat cards
            if (sectionRef.current) {
              anime({
                targets: sectionRef.current.querySelectorAll('.stat-card'),
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 1000,
                delay: anime.stagger(150),
                easing: 'easeOutElastic(1, .8)',
              });
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>

              {/* Icon Background */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="w-24 h-24 text-gray-900" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div
                  className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>

                <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 mb-2">
                  {counters[index].toLocaleString()}
                  {stat.suffix}
                </div>

                <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-400/20 to-transparent rounded-tr-full"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
