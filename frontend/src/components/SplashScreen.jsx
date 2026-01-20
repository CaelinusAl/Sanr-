import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const SplashScreen = ({ onComplete }) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);

  // Get translated story lines
  const storyLines = t('splash.lines') || [];

  useEffect(() => {
    // Phase 1: Show symbol
    const t1 = setTimeout(() => setPhase(1), 500);
    
    // Phase 2: Start story
    const t2 = setTimeout(() => setPhase(2), 1200);
    
    // Show lines one by one
    const lineTimers = storyLines.map((_, i) => 
      setTimeout(() => setVisibleLines(i + 1), 1500 + (i * 350))
    );
    
    // Complete
    const tComplete = setTimeout(() => onComplete(), 1500 + (storyLines.length * 350) + 1500);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(tComplete);
      lineTimers.forEach(clearTimeout);
    };
  }, [onComplete, storyLines.length]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #050508 0%, #0a0a14 50%, #0d1020 100%)'
      }}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-xl">
        {/* Sacred Symbol */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ 
            scale: phase >= 1 ? 1 : 0, 
            rotate: 0,
            opacity: phase >= 1 ? 1 : 0 
          }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-10"
        >
          <div className="relative w-20 h-20 mx-auto">
            {/* Outer ring - breathing */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full border border-indigo-500/40"
            />
            {/* Inner symbol - mirror */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-14 h-14">
                <motion.ellipse
                  cx="50"
                  cy="50"
                  rx="35"
                  ry="25"
                  fill="none"
                  stroke="rgba(129, 140, 248, 0.6)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="8"
                  fill="rgba(129, 140, 248, 0.3)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="3"
                  fill="rgba(129, 140, 248, 0.9)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, duration: 0.3 }}
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl sm:text-5xl font-light tracking-[0.25em] text-white/90 mb-10"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          CAELINUS AI
        </motion.h1>

        {/* SANRI Story Lines */}
        <div className="space-y-2 min-h-[280px]">
          {storyLines.map((line, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: index < visibleLines ? 1 : 0,
                y: index < visibleLines ? 0 : 10
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`
                ${line === "" ? "h-3" : ""}
                ${index === storyLines.length - 1 
                  ? "text-indigo-300/90 font-medium mt-4" 
                  : "text-white/60"
                }
                ${line && line.startsWith("SANRI") ? "text-indigo-200/80" : ""}
                text-sm sm:text-base leading-relaxed
              `}
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visibleLines >= storyLines.length ? 1 : 0 }}
          className="mt-8 flex justify-center gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
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
