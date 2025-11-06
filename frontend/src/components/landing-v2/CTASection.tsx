'use client';

import { useEffect, useRef } from 'react';
import { anime } from '@/lib/anime-config';
import Link from 'next/link';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (contentRef.current) {
              anime({
                targets: contentRef.current.children,
                translateY: [50, 0],
                opacity: [0, 1],
                duration: 1000,
                delay: anime.stagger(150),
                easing: 'easeOutExpo',
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
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600"></div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">🌾</div>
        <div className="absolute top-40 right-20 text-7xl opacity-10 animate-float animation-delay-1000">🚜</div>
        <div className="absolute bottom-20 left-1/4 text-6xl opacity-10 animate-float animation-delay-2000">🌱</div>
        <div className="absolute bottom-40 right-1/3 text-7xl opacity-10 animate-float animation-delay-3000">🥕</div>
      </div>

      <div ref={contentRef} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-8">
          <SparklesIcon className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">Join the Revolution</span>
        </div>

        {/* Heading */}
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
          Ready to Transform
          <br />
          Your Agricultural Business?
        </h2>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-green-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of farmers, distributors, and retailers who trust FarmChain
          for transparent, secure, and efficient agricultural trade.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Link
            href="/auth/register"
            className="group relative px-10 py-5 bg-white text-green-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Get Started Free
              <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          <Link
            href="/marketplace"
            className="px-10 py-5 bg-transparent text-white border-2 border-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
          >
            Explore Marketplace
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-white/90">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Free Forever Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
