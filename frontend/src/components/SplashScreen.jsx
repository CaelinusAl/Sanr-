import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 500);
    const timer2 = setTimeout(() => setPhase(2), 1500);
    const timer3 = setTimeout(() => onComplete(), 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #050508 0%, #0a0a14 50%, #0d1020 100%)'
      }}
    >
      {/* Subtle animated background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="relative z-10 text-center">
        {/* Sacred Symbol / Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: phase >= 0 ? 1 : 0, rotate: 0 }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-8"
        >
          <div className="relative w-24 h-24 mx-auto">
            {/* Outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-indigo-500/30"
            />
            {/* Inner symbol */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-16 h-16">
                <motion.path
                  d="M50 10 C 70 30, 70 70, 50 90 C 30 70, 30 30, 50 10"
                  fill="none"
                  stroke="url(#spiralGradient)"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="4"
                  fill="#818cf8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl font-light tracking-[0.3em] text-white/95 mb-4"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          CAELINUS AI
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="text-sm tracking-[0.25em] text-indigo-300/70 uppercase"
        >
          {t('tagline')}
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          className="mt-12 flex justify-center gap-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400/50"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
