'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  HomeIcon,
  SparklesIcon,
  CubeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { label: 'Home', href: '#home', icon: HomeIcon },
  { 
    label: 'Features', 
    href: '#features', 
    icon: SparklesIcon,
    submenu: [
      { label: 'Blockchain Tracking', href: '#blockchain' },
      { label: 'Smart Contracts', href: '#contracts' },
      { label: 'Supply Chain', href: '#supply-chain' },
    ]
  },
  { label: 'Technology', href: '#technology', icon: CubeIcon },
  { label: 'Community', href: '#community', icon: UserGroupIcon },
  { label: 'Contact', href: '#contact', icon: ChatBubbleLeftRightIcon },
];

export function AdvancedNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      
      // Update progress bar
      const progress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setScrollProgress(progress);
      
      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Animate navbar on mount
    if (navRef.current) {
      gsap.fromTo(navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out' }
      );
    }

    // Animate logo
    if (logoRef.current) {
      gsap.fromTo(logoRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 1.5, ease: 'elastic.out(1, 0.6)', delay: 0.3 }
      );
    }

    // Animate menu items
    if (menuRef.current) {
      gsap.fromTo(menuRef.current.children,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.5, ease: 'expo.out' }
      );
    }
  }, []);

  useEffect(() => {
    // Animate navbar background on scroll
    if (navRef.current) {
      gsap.to(navRef.current, {
        backgroundColor: isScrolled 
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'rgba(255, 255, 255, 0)',
        boxShadow: isScrolled
          ? '0 10px 30px rgba(0, 0, 0, 0.1)'
          : '0 0 0 rgba(0, 0, 0, 0)',
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, [isScrolled]);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ backdropFilter: isScrolled ? 'blur(20px)' : 'none' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div ref={logoRef} className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow">
                  <span className="text-2xl">🌾</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                  FarmChain
                </span>
                <div className="text-xs text-gray-500 font-medium">Blockchain Agriculture</div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div ref={menuRef} className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <div key={index} className="relative group">
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-300 font-medium"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.submenu && (
                      <ChevronDownIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                    )}
                  </button>

                  {/* Submenu */}
                  {item.submenu && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      <div className="p-2">
                        {item.submenu.map((subitem, subindex) => (
                          <button
                            key={subindex}
                            onClick={() => scrollToSection(subitem.href)}
                            className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 font-medium"
                          >
                            {subitem.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="px-6 py-2.5 text-gray-700 hover:text-green-600 font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="group relative px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={handleMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: '0%' }}
          ></div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleMobileMenuToggle}
          ></div>
          <div className="absolute top-20 left-0 right-0 bg-white shadow-2xl rounded-b-3xl p-6 space-y-2">
            {navItems.map((item, index) => (
              <div key={index}>
                <button
                  onClick={() => scrollToSection(item.href)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 font-medium"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
                {item.submenu && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((subitem, subindex) => (
                      <button
                        key={subindex}
                        onClick={() => scrollToSection(subitem.href)}
                        className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
                      >
                        {subitem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 space-y-2">
              <Link
                href="/auth/login"
                className="block w-full px-6 py-3 text-center text-gray-700 border-2 border-gray-200 rounded-full font-semibold hover:border-green-600 hover:text-green-600 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="block w-full px-6 py-3 text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-semibold shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
