'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap-config';

const steps = [
  { title: 'Register Crop', icon: '🌱', description: 'Farmers register their crops on the blockchain' },
  { title: 'Blockchain Records', icon: '⛓️', description: 'Immutable records created for traceability' },
  { title: 'Quality Check', icon: '✅', description: 'AI-powered quality verification' },
  { title: 'Distribution', icon: '🚚', description: 'Track shipment in real-time' },
  { title: 'Consumer Purchase', icon: '🛒', description: 'End consumers verify product authenticity' },
];

export function HorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const sections = gsap.utils.toArray('.step-card');
    
    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => '+=' + (scrollContainerRef.current?.offsetWidth || 0),
      },
    });
  }, { scope: containerRef });

  return (
    <div className="bg-gray-900 py-20">
      <div className="text-center mb-10">
        <h2 className="text-5xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-xl text-gray-300">Scroll to see the journey from farm to table</p>
      </div>
      
      <div ref={containerRef} className="overflow-hidden">
        <div ref={scrollContainerRef} className="flex w-fit">
          {steps.map((step, i) => (
            <div key={i} className="step-card w-screen h-screen flex items-center justify-center px-20">
              <div className="text-center max-w-2xl">
                <div className="text-9xl mb-8 animate-bounce">{step.icon}</div>
                <h3 className="text-5xl font-bold text-white mb-6">{step.title}</h3>
                <p className="text-2xl text-gray-300">{step.description}</p>
                <div className="mt-8 text-green-400 text-xl font-semibold">
                  Step {i + 1} of {steps.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
