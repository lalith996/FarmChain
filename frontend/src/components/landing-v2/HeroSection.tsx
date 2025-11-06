'use client';

import { useEffect, useRef } from 'react';
import { anime } from '@/lib/anime-config';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);
  const parallaxImageRef = useRef<HTMLDivElement>(null);
  const parallaxOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate title with character stagger
    if (titleRef.current) {
      const title = titleRef.current;
      title.innerHTML = title.textContent!
        .split('')
        .map((char) => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');

      anime({
        targets: title.querySelectorAll('span'),
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 1200,
        delay: anime.stagger(30, { start: 500 }),
        easing: 'easeOutExpo',
      });
    }

    // Animate subtitle
    if (subtitleRef.current) {
      anime({
        targets: subtitleRef.current,
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 1200,
        delay: 1000,
        easing: 'easeOutExpo',
      });
    }

    // Animate CTA buttons
    if (ctaRef.current) {
      anime({
        targets: ctaRef.current.children,
        scale: [0, 1],
        opacity: [0, 1],
        duration: 800,
        delay: anime.stagger(150, { start: 1500 }),
        easing: 'easeOutElastic(1, .6)',
      });
    }

    // Animate floating elements
    if (floatingElementsRef.current) {
      const elements = floatingElementsRef.current.children;
      
      Array.from(elements).forEach((element, index) => {
        anime({
          targets: element,
          translateY: [
            { value: -20, duration: 2000 },
            { value: 0, duration: 2000 },
          ],
          translateX: [
            { value: -10, duration: 2000 },
            { value: 10, duration: 2000 },
          ],
          rotate: [
            { value: -5, duration: 2000 },
            { value: 5, duration: 2000 },
          ],
          loop: true,
          easing: 'easeInOutSine',
          delay: index * 200,
        });
      });
    }

    // Advanced Parallax effect on scroll
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      
      // Parallax for background image (slower movement)
      if (parallaxImageRef.current) {
        anime({
          targets: parallaxImageRef.current,
          translateY: scrolled * 0.3,
          scale: 1 + scrolled * 0.0001,
          duration: 0,
        });
      }

      // Parallax for overlay (medium speed)
      if (parallaxOverlayRef.current) {
        anime({
          targets: parallaxOverlayRef.current,
          translateY: scrolled * 0.4,
          duration: 0,
        });
      }

      // Parallax for content (faster movement)
      if (heroRef.current) {
        anime({
          targets: heroRef.current.querySelector('.hero-content'),
          translateY: scrolled * 0.5,
          opacity: 1 - scrolled * 0.002,
          duration: 0,
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Parallax Background Image */}
      <div 
        ref={parallaxImageRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{ willChange: 'transform' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/Screenshot 2025-11-06 at 5.31.56 AM.png"
          alt="Rice fields"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"></div>
      </div>

      {/* Animated Overlay Elements with Parallax */}
      <div 
        ref={parallaxOverlayRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ willChange: 'transform' }}
      >
        {/* Gradient Overlays */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-green-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-emerald-900/40 to-transparent"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-emerald-400 rounded-full animate-pulse animation-delay-1000"></div>
          <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-teal-400 rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-60 right-1/3 w-3 h-3 bg-green-300 rounded-full animate-pulse animation-delay-3000"></div>
        </div>
      </div>

      {/* Floating Elements */}
      <div ref={floatingElementsRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Icons with glow */}
        <div className="absolute top-1/4 left-1/4 text-6xl opacity-30 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">🌾</div>
        <div className="absolute top-1/3 right-1/4 text-5xl opacity-30 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">🚜</div>
        <div className="absolute bottom-1/3 left-1/3 text-7xl opacity-30 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">🌱</div>
        <div className="absolute bottom-1/4 right-1/3 text-6xl opacity-30 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">🥕</div>
        <div className="absolute top-1/2 right-1/2 text-5xl opacity-30 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">🍅</div>
      </div>

      {/* Main Content */}
      <div className="hero-content relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ willChange: 'transform, opacity' }}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-2xl mb-8 animate-bounce-slow border border-white/20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-semibold text-gray-800">
            Powered by Blockchain Technology
          </span>
        </div>

        {/* Main Heading */}
        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-8 leading-tight drop-shadow-2xl"
        >
          <span className="text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            Farm to Table
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 drop-shadow-[0_4px_20px_rgba(16,185,129,0.5)]">
            Revolutionized
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-xl md:text-3xl text-white mb-12 max-w-4xl mx-auto leading-relaxed font-light drop-shadow-lg"
        >
          Connect farmers directly to consumers with{' '}
          <span className="font-semibold text-green-300">blockchain-verified</span> products,{' '}
          <span className="font-semibold text-green-300">smart contracts</span>, and{' '}
          <span className="font-semibold text-green-300">complete transparency</span>
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            href="/auth/register"
            className="group relative px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-[0_20px_60px_rgba(16,185,129,0.5)] transition-all duration-300 overflow-hidden backdrop-blur-sm"
          >
            <span className="relative z-10 flex items-center gap-3">
              Get Started Free
              <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
          </Link>

          <button className="group flex items-center gap-3 px-10 py-5 bg-white/90 backdrop-blur-md text-gray-800 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] transition-all duration-300 border-2 border-white/30 hover:border-green-400">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <PlayIcon className="w-6 h-6 text-white ml-1" />
            </div>
            Watch Demo
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">500+ Farmers</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">10,000+ Products</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">100% Verified</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-sm text-white font-medium drop-shadow-lg">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex items-start justify-center p-2 backdrop-blur-sm bg-white/10">
              <div className="w-1.5 h-3 bg-white rounded-full animate-scroll"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
      
      {/* Side Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none"></div>
    </section>
  );
}
