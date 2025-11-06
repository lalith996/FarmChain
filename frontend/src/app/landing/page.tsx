'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { Navigation } from '@/components/landing/Navigation';
import { ScrollProgress } from '@/components/landing/ScrollProgress';
import { Hero } from '@/components/landing/Hero';
import { Stats } from '@/components/landing/Stats';
import { Features } from '@/components/landing/Features';
import { HorizontalScroll } from '@/components/landing/HorizontalScroll';
import { BlockchainViz } from '@/components/landing/BlockchainViz';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';

export default function LandingPage() {
  useSmoothScroll();

  return (
    <>
      <Navigation />
      <ScrollProgress />
      
      <main className="overflow-x-hidden">
        <section id="home">
          <Hero />
        </section>

        <Stats />

        <section id="features">
          <Features />
        </section>

        <section id="how-it-works">
          <HorizontalScroll />
        </section>

        <BlockchainViz />

        <section id="testimonials">
          <Testimonials />
        </section>

        <section id="faq">
          <FAQ />
        </section>

        <CTA />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-3xl">🌾</span>
                <span className="text-2xl font-bold">FarmChain</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing agriculture with blockchain technology.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
                <li><a href="#" className="hover:text-white">Discord</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FarmChain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
