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
import { FarmChainLoader } from '@/components/shared/FarmChainLoader';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  return (
    <>
      {/* Full-screen FarmChain Loader */}
      {isLoading && (
        <FarmChainLoader
          onLoadingComplete={handleLoadingComplete}
          duration={3000} // 3 seconds
        />
      )}

      {/* Main Landing Page Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="min-h-screen bg-white overflow-x-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AdvancedNavbar />
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
            <TechnologySection />
            <TestimonialsSection />
            <CTASection />
            <FooterSection />
            <ChatWidget />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
