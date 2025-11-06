'use client';

import { useEffect, useRef } from 'react';
import { anime } from '@/lib/anime-config';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Organic Farmer',
    location: 'Punjab, India',
    content: 'FarmChain has completely transformed how I sell my produce. Direct access to buyers and instant payments have increased my income by 40%!',
    avatar: '👨‍🌾',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Distributor',
    location: 'Mumbai, India',
    content: 'The transparency and traceability features have built incredible trust with our customers. We can now verify every product\'s journey.',
    avatar: '👩‍💼',
    rating: 5,
  },
  {
    name: 'Amit Patel',
    role: 'Retailer',
    location: 'Delhi, India',
    content: 'Blockchain verification gives us confidence in product quality. Our customers love knowing exactly where their food comes from.',
    avatar: '👨‍💻',
    rating: 5,
  },
  {
    name: 'Sarah Johnson',
    role: 'Consumer',
    location: 'Bangalore, India',
    content: 'I love being able to trace my food back to the farm. It\'s amazing to support farmers directly and know my food is authentic.',
    avatar: '👩‍🦰',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (cardsRef.current) {
              anime({
                targets: cardsRef.current.children,
                translateY: [100, 0],
                opacity: [0, 1],
                scale: [0.9, 1],
                duration: 1000,
                delay: anime.stagger(150, { start: 300 }),
                easing: 'easeOutExpo',
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

  return (
    <section
      id="community"
      ref={sectionRef}
      className="py-32 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2310b981" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-2 bg-white text-green-600 rounded-full font-semibold mb-6 shadow-lg">
            💬 Testimonials
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Trusted by{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
              Thousands
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our community has to say about their experience with FarmChain
          </p>
        </div>

        {/* Testimonial Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className="text-5xl">{testimonial.avatar}</div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-gray-500">{testimonial.location}</div>
                </div>
              </div>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-12 text-gray-600">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">4.9/5</div>
            <div className="text-sm font-medium">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">2,500+</div>
            <div className="text-sm font-medium">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-sm font-medium">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
