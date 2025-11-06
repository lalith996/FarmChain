'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap-config';
import { MagneticButton } from '../ui/MagneticButton';

export function CTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to(bgRef.current, {
      backgroundPosition: '200% 200%',
      duration: 20,
      repeat: -1,
      ease: 'none',
    });

    gsap.from(containerRef.current, {
      opacity: 0,
      y: 100,
      duration: 1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
    });
  }, { scope: containerRef });

  return (
    <div className="py-32 bg-gradient-to-b from-white to-green-50 relative overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      
      <div ref={containerRef} className="max-w-4xl mx-auto text-center px-4 relative z-10">
        <h2 className="text-6xl font-bold mb-6 text-gray-800">
          Ready to Transform Your Farm?
        </h2>
        <p className="text-2xl text-gray-600 mb-12">
          Join thousands of farmers already using FarmChain to revolutionize their supply chain
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <MagneticButton className="text-lg">
            Start Free Trial
          </MagneticButton>
          <MagneticButton className="text-lg bg-gray-800 hover:bg-gray-900">
            Schedule Demo
          </MagneticButton>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-bold mb-2">No Credit Card</h3>
            <p className="text-gray-600">Start your free trial today</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold mb-2">Quick Setup</h3>
            <p className="text-gray-600">Get started in minutes</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">Enterprise-grade security</p>
          </div>
        </div>
      </div>
    </div>
  );
}
