'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap-config';

const testimonials = [
  {
    name: 'John Smith',
    role: 'Organic Farmer',
    location: 'California, USA',
    image: '👨‍🌾',
    quote: 'FarmChain has transformed how I manage my farm. The transparency it provides has increased my sales by 40%!',
    rating: 5,
  },
  {
    name: 'Maria Garcia',
    role: 'Cooperative Manager',
    location: 'Mexico',
    image: '👩‍💼',
    quote: 'Managing 50+ farmers was a nightmare. Now everything is automated and transparent. Game changer!',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Distributor',
    location: 'Singapore',
    image: '👨‍💻',
    quote: 'The real-time tracking and smart contracts have reduced our operational costs by 30%. Highly recommend!',
    rating: 5,
  },
  {
    name: 'Sarah Johnson',
    role: 'Retail Chain Owner',
    location: 'UK',
    image: '👩‍🦰',
    quote: 'Our customers love being able to trace their food back to the farm. Trust has never been higher.',
    rating: 5,
  },
];

export function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray('.testimonial-card');

    // Stagger reveal
    gsap.from(cards, {
      opacity: 0,
      x: -100,
      stagger: 0.2,
      duration: 0.8,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
    });

    // Infinite scroll animation
    const carousel = carouselRef.current;
    if (carousel) {
      const totalWidth = carousel.scrollWidth / 2;

      gsap.to(carousel, {
        x: -totalWidth,
        duration: 30,
        ease: 'none',
        repeat: -1,
      });

      // Pause on hover
      carousel.addEventListener('mouseenter', () => {
        gsap.to(carousel, { timeScale: 0, duration: 0.5 });
      });

      carousel.addEventListener('mouseleave', () => {
        gsap.to(carousel, { timeScale: 1, duration: 0.5 });
      });
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="py-20 bg-gradient-to-b from-white to-green-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-5xl font-bold text-center mb-4 text-gray-800">
          What Farmers Say
        </h2>
        <p className="text-xl text-center text-gray-600">
          Join thousands of satisfied users worldwide
        </p>
      </div>

      <div className="relative">
        <div ref={carouselRef} className="flex gap-8 px-4">
          {/* Duplicate for infinite scroll */}
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card flex-shrink-0 w-96 bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="text-6xl mr-4">{testimonial.image}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{testimonial.name}</h3>
                  <p className="text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-2xl">⭐</span>
                ))}
              </div>

              <p className="text-gray-700 text-lg italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600">Hover to pause • Auto-scrolling testimonials</p>
      </div>
    </div>
  );
}
