'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap-config';
import { AnimatedText } from '../animations/AnimatedText';
import { MagneticButton } from '../ui/MagneticButton';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const tractorRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Sun animation
    gsap.to(sunRef.current, {
      y: -30,
      scale: 1.05,
      repeat: -1,
      yoyo: true,
      duration: 3,
      ease: 'sine.inOut',
    });

    // Tractor moving
    gsap.to(tractorRef.current, {
      x: '100vw',
      duration: 20,
      repeat: -1,
      ease: 'none',
    });

    // Parallax on scroll
    gsap.to(sunRef.current, {
      y: 200,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    // Particles floating up
    if (particlesRef.current) {
      const particles = particlesRef.current.children;
      gsap.to(particles, {
        y: -500,
        opacity: 0,
        duration: 3,
        stagger: 0.1,
        repeat: -1,
        ease: 'power1.out',
      });
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden bg-gradient-to-b from-blue-400 via-blue-300 to-green-200">
      {/* Sun */}
      <div ref={sunRef} className="absolute top-20 right-20 w-32 h-32 bg-yellow-400 rounded-full shadow-2xl" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <AnimatedText className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-lg">
          🌾 FarmChain
        </AnimatedText>
        
        <AnimatedText delay={0.3} className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
          Revolutionizing Agriculture with Blockchain & AI
        </AnimatedText>

        <div className="mt-4">
          <MagneticButton onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            Get Started 🚀
          </MagneticButton>
        </div>
      </div>

      {/* Tractor */}
      <div ref={tractorRef} className="absolute bottom-32 -left-20">
        <div className="text-6xl">🚜</div>
      </div>

      {/* Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-600 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%',
            }}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="text-white text-4xl">↓</div>
      </div>
    </div>
  );
}
