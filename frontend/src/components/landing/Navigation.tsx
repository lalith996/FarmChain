'use client';

import { useRef, useState, useEffect } from 'react';
import { gsap } from '@/lib/gsap-config';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.to(navRef.current, {
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0)',
        boxShadow: isScrolled ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 0 0 rgba(0, 0, 0, 0)',
        duration: 0.3,
      });
    }
  }, [isScrolled]);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🌾</span>
            <span className="text-2xl font-bold text-gray-800">FarmChain</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
