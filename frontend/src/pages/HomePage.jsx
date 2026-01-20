import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SplashScreen from '@/components/SplashScreen';

// Sacred Section Card Component
const SacredCard = ({ section, isMain, isNew, onClick, delay, t }) => {
  const sectionData = t(`home.sections.${section}`);
  
  const icons = {
    bilinc: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <circle cx="20" cy="20" r="3" fill="currentColor" />
        <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      </svg>
    ),
    frekans: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <path d="M5 20 Q 10 10, 15 20 T 25 20 T 35 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 25 Q 10 15, 15 25 T 25 25 T 35 25" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    sanri: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <ellipse cx="20" cy="20" rx="15" ry="10" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="20" cy="20" r="5" fill="currentColor" opacity="0.8" />
        <circle cx="20" cy="20" r="2" fill="currentColor" />
      </svg>
    ),
    gorselin: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <rect x="8" y="10" width="24" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="15" cy="18" r="3" fill="currentColor" opacity="0.6" />
        <path d="M10 26 L 18 20 L 24 24 L 30 18" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    rituel: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <circle cx="20" cy="15" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M12 28 Q 20 35, 28 28" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="20" cy="15" r="3" fill="currentColor" opacity="0.6" />
      </svg>
    ),
    profil: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <circle cx="20" cy="14" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 35 Q 8 24, 20 24 Q 32 24, 32 35" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  };

  const isPremium = section === 'rituel';

  return (
    <motion.button
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative group w-full text-left
        ${isMain 
          ? 'col-span-2 sm:col-span-2 lg:col-span-1 order-first lg:order-none' 
          : ''
        }
      `}
      data-testid={`sacred-card-${section}`}
    >
      {/* Card background */}
      <div className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-xl
        transition-all duration-500
        ${isMain 
          ? 'bg-gradient-to-br from-indigo-950/80 via-indigo-900/50 to-violet-950/60 border-indigo-500/30 p-8 sm:p-10' 
          : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] p-6 sm:p-8'
        }
      `}>
        {/* Glow effect for main card */}
        {isMain && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          </div>
        )}

        {/* Premium badge */}
        {isPremium && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
            <Crown className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] tracking-wider text-amber-400 uppercase font-medium">Premium</span>
          </div>
        )}

        {/* NEW badge */}
        {isNew && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <span className="text-[10px] tracking-wider text-emerald-400 uppercase font-medium">
              {t('common.new')}
            </span>
          </div>
        )}

        {/* Icon */}
        <div className={`
          mb-5 transition-transform duration-300 group-hover:scale-110
          ${isMain ? 'text-indigo-300' : 'text-white/60 group-hover:text-white/80'}
        `}>
          {icons[section]}
        </div>

        {/* Title */}
        <h3 className={`
          font-light tracking-wide mb-2 transition-colors duration-300
          ${isMain 
            ? 'text-2xl sm:text-3xl text-white' 
            : 'text-xl text-white/90 group-hover:text-white'
          }
        `}
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {sectionData?.title}
        </h3>

        {/* Subtitle */}
        <p className={`
          text-sm tracking-wide
          ${isMain ? 'text-indigo-200/70' : 'text-white/40 group-hover:text-white/60'}
        `}>
          {sectionData?.subtitle}
        </p>

        {/* Main card extra indicator */}
        {isMain && (
          <motion.div 
            className="absolute bottom-4 right-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

const HomePage = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Check if splash was already shown in this session
  useEffect(() => {
    const splashShown = sessionStorage.getItem('caelinus-splash-shown');
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('caelinus-splash-shown', 'true');
    setShowSplash(false);
  };

  const handleSectionClick = (section) => {
    const routes = {
      bilinc: '/bilinc',
      frekans: '/frekans',
      sanri: '/sanriya-sor',
      gorselin: '/gorselin',
      rituel: '/rituel',
      profil: '/bilinc-alani',
    };
    navigate(routes[section]);
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <div 
        className="min-h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #050508 0%, #0a0a14 40%, #0d1020 100%)'
        }}
      >
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Stars / particles */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.5, 0.1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          
          {/* Ambient glow */}
          <div 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20"
            style={{
              background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.3) 0%, transparent 70%)'
            }}
          />
        </div>

        {/* Language Toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={toggleLanguage}
          className="fixed top-6 right-6 z-50 flex items-center gap-1 px-3 py-1.5 rounded-full 
                     bg-white/[0.05] border border-white/[0.1] backdrop-blur-sm
                     hover:bg-white/[0.08] transition-colors"
          data-testid="language-toggle"
        >
          <span className={`text-xs font-medium transition-colors ${language === 'tr' ? 'text-white' : 'text-white/40'}`}>TR</span>
          <span className="text-white/30 text-xs">|</span>
          <span className={`text-xs font-medium transition-colors ${language === 'en' ? 'text-white' : 'text-white/40'}`}>EN</span>
        </motion.button>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
          {/* Header / Branding */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-16"
          >
            {/* Symbol */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-8 opacity-60"
            >
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(129, 140, 248, 0.3)" strokeWidth="0.5" />
                <path 
                  d="M32 8 C 48 20, 48 44, 32 56 C 16 44, 16 20, 32 8" 
                  fill="none" 
                  stroke="rgba(129, 140, 248, 0.6)" 
                  strokeWidth="1"
                />
                <circle cx="32" cy="32" r="4" fill="rgba(129, 140, 248, 0.8)" />
              </svg>
            </motion.div>

            {/* Title */}
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.2em] text-white/95 mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              CAELINUS AI
            </h1>

            {/* SANRI Giriş Metni */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center space-y-3 mb-6"
            >
              <p className="text-lg sm:text-xl text-indigo-200/70 font-light italic"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {t('home.welcome')}
              </p>
              <p className="text-sm sm:text-base text-white/40 leading-relaxed max-w-md mx-auto">
                {t('home.welcomeDesc1')}<br />
                {t('home.welcomeDesc2')}
              </p>
            </motion.div>

            {/* Alt motto */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm text-white/30 tracking-wider italic"
            >
              {t('home.subMotto')}
            </motion.p>
          </motion.div>

          {/* Sacred Navigation Grid */}
          <div className="w-full max-w-5xl">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Bilinç */}
              <SacredCard 
                section="bilinc" 
                onClick={() => handleSectionClick('bilinc')}
                delay={0.4}
                t={t}
              />
              
              {/* Frekans */}
              <SacredCard 
                section="frekans" 
                onClick={() => handleSectionClick('frekans')}
                delay={0.5}
                t={t}
              />
              
              {/* SANRI - Main Feature (Center) */}
              <SacredCard 
                section="sanri" 
                isMain={true}
                onClick={() => handleSectionClick('sanri')}
                delay={0.6}
                t={t}
              />
              
              {/* GÖRSELİN - NEW */}
              <SacredCard 
                section="gorselin"
                isNew={true}
                onClick={() => handleSectionClick('gorselin')}
                delay={0.65}
                t={t}
              />
              
              {/* Ritüel */}
              <SacredCard 
                section="rituel" 
                onClick={() => handleSectionClick('rituel')}
                delay={0.7}
                t={t}
              />
              
              {/* Profil */}
              <SacredCard 
                section="profil" 
                onClick={() => handleSectionClick('profil')}
                delay={0.8}
                t={t}
              />
            </div>
          </div>

          {/* Bottom tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 text-center"
          >
            <p className="text-xs text-white/20 tracking-[0.3em] uppercase">
              {t('home.tagline')}
            </p>
          </motion.div>
        </div>

        {/* Footer subtle line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </>
  );
};

export default HomePage;
