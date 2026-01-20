// CAELINUS AI - Auth Callback Component
// Processes Google OAuth session_id from URL fragment

import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processGoogleCallback } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use ref to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      // Extract session_id from URL fragment
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (!sessionIdMatch) {
        console.error('No session_id in URL');
        navigate('/giris', { replace: true });
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        const result = await processGoogleCallback(sessionId);
        
        if (result.success) {
          // Clear the URL fragment
          window.history.replaceState({}, '', window.location.pathname);
          
          if (result.isNewUser || !result.hasProfile) {
            // New user or no profile - go to onboarding
            navigate('/onboarding', { 
              replace: true,
              state: { user: result.user, isNewUser: result.isNewUser }
            });
          } else {
            // Existing user with profile - go to home
            navigate('/', { 
              replace: true,
              state: { user: result.user }
            });
          }
        } else {
          console.error('Auth callback failed:', result.error);
          navigate('/giris', { 
            replace: true,
            state: { error: result.error }
          });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/giris', { replace: true });
      }
    };

    processAuth();
  }, [location, processGoogleCallback, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        {/* Animated infinity symbol */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6"
        >
          <span className="text-5xl text-amber-500/80">∞</span>
        </motion.div>
        
        <h2 
          className="text-xl text-white/80 mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Bilinç alanına bağlanılıyor...
        </h2>
        
        <p className="text-white/40 text-sm">
          Lütfen bekleyin
        </p>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
