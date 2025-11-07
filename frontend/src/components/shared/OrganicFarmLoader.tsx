'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface OrganicFarmLoaderProps {
  onLoadingComplete?: () => void;
  duration?: number;
}

export function OrganicFarmLoader({ onLoadingComplete, duration = 3500 }: OrganicFarmLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [growthStage, setGrowthStage] = useState(0); // 0: seed, 1: sprout, 2: plant
  const text = "FARMCHAIN";
  const letters = text.split('');

  useEffect(() => {
    // Growth stages animation
    const stage1 = setTimeout(() => setGrowthStage(1), 800);
    const stage2 = setTimeout(() => setGrowthStage(2), 1600);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }, 800);
    }, duration);

    return () => {
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(timer);
    };
  }, [duration, onLoadingComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #fef9ec 0%, #f5f3e8 50%, #e8f5e9 100%)'
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Animated sun in the background */}
          <motion.div
            className="absolute top-10 right-20"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 0.3,
              rotate: 360
            }}
            transition={{
              scale: { duration: 1, ease: "easeOut" },
              opacity: { duration: 1 },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 to-orange-300 blur-xl" />
          </motion.div>

          {/* Floating leaves in background */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              initial={{ opacity: 0, rotate: 0 }}
              animate={{
                opacity: [0, 0.4, 0],
                y: [0, -100],
                rotate: [0, 360],
                x: [0, Math.random() * 50 - 25]
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            >
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path
                  d="M15 5 C 20 7, 25 12, 26 17 C 27 20, 25 23, 21 25 C 18 26, 15 23, 15 23 L 15 5 Z"
                  fill="#84cc16"
                  opacity="0.6"
                />
              </svg>
            </motion.div>
          ))}

          {/* Main organic plant growth animation */}
          <motion.div
            className="mb-12 relative"
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              transition: {
                duration: 0.8,
                ease: [0.34, 1.56, 0.64, 1],
              }
            }}
          >
            {/* Soil base */}
            <motion.div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-4 rounded-full"
              style={{
                background: 'linear-gradient(to bottom, #8B7355 0%, #6B5344 100%)'
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />

            {/* Growing plant with stages */}
            <div className="relative z-10">
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="stemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#65a30d" />
                    <stop offset="100%" stopColor="#4d7c0f" />
                  </linearGradient>
                  <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#84cc16" />
                    <stop offset="50%" stopColor="#65a30d" />
                    <stop offset="100%" stopColor="#4d7c0f" />
                  </linearGradient>
                  <radialGradient id="organicBadge" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="100%" stopColor="#fcd34d" />
                  </radialGradient>
                </defs>

                {/* Main stem */}
                <motion.line
                  x1="80"
                  y1="140"
                  x2="80"
                  y2={growthStage >= 1 ? "60" : "140"}
                  stroke="url(#stemGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                />

                {/* Left leaf */}
                {growthStage >= 1 && (
                  <motion.path
                    d="M 80 90 Q 50 80, 35 75 Q 30 73, 35 70 Q 50 68, 80 85"
                    fill="url(#leafGradient)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                )}

                {/* Right leaf */}
                {growthStage >= 1 && (
                  <motion.path
                    d="M 80 85 Q 110 68, 125 70 Q 130 73, 125 75 Q 110 80, 80 90"
                    fill="url(#leafGradient)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
                  />
                )}

                {/* Top leaves (mature stage) */}
                {growthStage >= 2 && (
                  <>
                    <motion.path
                      d="M 80 70 Q 60 65, 50 62 Q 45 60, 48 57 Q 58 55, 80 67"
                      fill="url(#leafGradient)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                    />
                    <motion.path
                      d="M 80 67 Q 100 55, 112 57 Q 115 60, 110 62 Q 100 65, 80 70"
                      fill="url(#leafGradient)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
                    />

                    {/* Organic certification circle badge */}
                    <motion.g
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      <circle
                        cx="80"
                        cy="50"
                        r="18"
                        fill="url(#organicBadge)"
                        stroke="#84cc16"
                        strokeWidth="2"
                      />
                      <circle
                        cx="80"
                        cy="50"
                        r="14"
                        fill="none"
                        stroke="#65a30d"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      {/* Checkmark in the badge */}
                      <motion.path
                        d="M 73 50 L 77 54 L 87 44"
                        stroke="#65a30d"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                      />
                    </motion.g>
                  </>
                )}
              </svg>

              {/* Pulsing organic glow */}
              <motion.div
                className="absolute inset-0 w-40 h-40 -m-2 rounded-full -z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(132, 204, 22, 0.3) 0%, transparent 70%)'
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0.2, 0.6]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>

          {/* Animated Text - FARMCHAIN with organic colors */}
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-2">
            {letters.map((letter, index) => (
              <motion.span
                key={index}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider"
                style={{
                  fontFamily: "'Lora', 'Georgia', serif",
                  fontWeight: 800,
                  letterSpacing: '0.05em'
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
                    delay: 1.2 + index * 0.08,
                    ease: [0.34, 1.56, 0.64, 1]
                  }
                }}
              >
                <span className="bg-gradient-to-b from-lime-700 via-green-600 to-lime-800 bg-clip-text text-transparent">
                  {letter}
                </span>
              </motion.span>
            ))}
          </div>

          {/* Subtitle with organic tagline */}
          <motion.p
            className="text-base sm:text-lg md:text-xl font-semibold tracking-wide mb-2"
            style={{
              color: '#65a30d',
              fontFamily: "'Nunito', sans-serif"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.3 }}
          >
            100% Organic • Farm to Table
          </motion.p>

          <motion.p
            className="text-sm text-gray-600 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.5 }}
          >
            Blockchain-Powered Agriculture
          </motion.p>

          {/* Organic-themed loading progress bar */}
          <motion.div
            className="mt-8 w-64 h-2 bg-amber-100 rounded-full overflow-hidden shadow-inner"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%)'
              }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: duration / 1000 - 1,
                ease: "easeInOut",
                delay: 1.8
              }}
            />
          </motion.div>

          {/* Organic badges at bottom */}
          <motion.div
            className="absolute bottom-12 flex items-center space-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
          >
            {[
              { icon: '🌱', label: 'Certified Organic' },
              { icon: '🔗', label: 'Blockchain Verified' },
              { icon: '🌾', label: 'Farm Fresh' }
            ].map((badge, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.2 + i * 0.1, type: "spring", stiffness: 200 }}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <span className="text-xs font-medium text-gray-600">{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Sparkle effects around the plant */}
          {growthStage >= 2 && [...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: '50%',
                top: '30%',
                marginLeft: `${Math.cos((i * Math.PI * 2) / 6) * 80}px`,
                marginTop: `${Math.sin((i * Math.PI * 2) / 6) * 80}px`
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 2 + i * 0.15,
                ease: "easeInOut"
              }}
            >
              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
