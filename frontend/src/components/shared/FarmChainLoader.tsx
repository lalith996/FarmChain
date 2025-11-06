'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FarmChainLoaderProps {
  onLoadingComplete?: () => void;
  duration?: number;
}

export function FarmChainLoader({ onLoadingComplete, duration = 3000 }: FarmChainLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const text = "FARMCHAIN";
  const letters = text.split('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation to complete before calling onLoadingComplete
      setTimeout(() => {
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }, 800);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onLoadingComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Animated Leaf Icon */}
          <motion.div
            className="mb-12 relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: 1,
              rotate: 0,
              transition: {
                duration: 0.8,
                ease: [0.34, 1.56, 0.64, 1], // Custom spring easing
              }
            }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 w-32 h-32 -m-4"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 blur-2xl" />
            </motion.div>

            {/* Leaf SVG Icon */}
            <motion.div
              className="relative z-10"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-2xl"
              >
                {/* Leaf shape with gradient */}
                <defs>
                  <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Main leaf body */}
                <motion.path
                  d="M60 10 C 80 20, 100 40, 105 65 C 108 80, 100 95, 85 100 C 70 105, 60 95, 60 95 L 60 10 Z"
                  fill="url(#leafGradient)"
                  filter="url(#shadow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
                <motion.path
                  d="M60 10 C 40 20, 20 40, 15 65 C 12 80, 20 95, 35 100 C 50 105, 60 95, 60 95 L 60 10 Z"
                  fill="url(#leafGradient)"
                  filter="url(#shadow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
                />

                {/* Leaf vein - center line */}
                <motion.path
                  d="M 60 15 L 60 95"
                  stroke="#047857"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.5 }}
                />

                {/* Leaf veins - side branches */}
                {[
                  "M 60 30 Q 75 35, 85 45",
                  "M 60 45 Q 75 48, 88 58",
                  "M 60 60 Q 75 63, 90 73",
                  "M 60 30 Q 45 35, 35 45",
                  "M 60 45 Q 45 48, 32 58",
                  "M 60 60 Q 45 63, 30 73"
                ].map((d, i) => (
                  <motion.path
                    key={i}
                    d={d}
                    stroke="#047857"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.7 + i * 0.05 }}
                  />
                ))}
              </svg>
            </motion.div>

            {/* Rotating ring around leaf */}
            <motion.div
              className="absolute inset-0 w-32 h-32 -m-6 border-4 border-transparent border-t-green-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* Animated Text - FARMCHAIN */}
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            {letters.map((letter, index) => (
              <motion.span
                key={index}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-wider"
                style={{
                  fontFamily: "'Inter', 'Roboto', sans-serif",
                  fontWeight: 800,
                  letterSpacing: '0.1em'
                }}
                initial={{
                  opacity: 0,
                  y: 30,
                  scale: 0.5,
                  filter: "blur(10px)"
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  transition: {
                    duration: 0.6,
                    delay: 0.8 + index * 0.08, // Stagger effect
                    ease: [0.34, 1.56, 0.64, 1] // Bouncy easing
                  }
                }}
              >
                <span className="bg-gradient-to-b from-green-600 via-emerald-600 to-green-800 bg-clip-text text-transparent">
                  {letter}
                </span>
              </motion.span>
            ))}
          </div>

          {/* Subtitle text */}
          <motion.p
            className="mt-6 text-sm sm:text-base md:text-lg text-gray-500 font-medium tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            Blockchain-Powered Agriculture
          </motion.p>

          {/* Loading progress bar */}
          <motion.div
            className="mt-8 w-48 h-1 bg-gray-200 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: duration / 1000 - 0.5,
                ease: "easeInOut",
                delay: 1.5
              }}
            />
          </motion.div>

          {/* Floating particles effect */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full opacity-30"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
