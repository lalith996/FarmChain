'use client';

import { AdvancedNavbar } from '@/components/landing-v2/AdvancedNavbar';
import { HeroSection } from '@/components/landing-v2/HeroSection';
import { StatsSection } from '@/components/landing-v2/StatsSection';
import { FeaturesSection } from '@/components/landing-v2/FeaturesSection';
import { TechnologySection } from '@/components/landing-v2/TechnologySection';
import { TestimonialsSection } from '@/components/landing-v2/TestimonialsSection';
import { CTASection } from '@/components/landing-v2/CTASection';
import { FooterSection } from '@/components/landing-v2/FooterSection';
import { ChatWidget } from '@/components/chatbot/ChatWidget';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <AdvancedNavbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TechnologySection />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
      <ChatWidget />
    </div>
  );
}
