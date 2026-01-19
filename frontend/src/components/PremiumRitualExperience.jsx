import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Heart,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Text-to-Speech Hook
const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text, onEnd) => {
    if (!isSupported) {
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.75; // Yavaş
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a Turkish female voice
    const voices = window.speechSynthesis.getVoices();
    const turkishVoice = voices.find(v => v.lang.startsWith('tr') && v.name.toLowerCase().includes('female')) ||
                         voices.find(v => v.lang.startsWith('tr')) ||
                         voices.find(v => v.name.toLowerCase().includes('female'));
    
    if (turkishVoice) {
      utterance.voice = turkishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
};

// Nefes Animasyonu Component
const BreathingCircle = ({ phase }) => {
  const isBreathPhase = phase === "nefes" || phase === "açılış";
  
  return (
    <motion.div
      animate={{
        scale: isBreathPhase ? [1, 1.4, 1] : [1, 1.1, 1],
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: isBreathPhase ? 8 : 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-primary/30 flex items-center justify-center"
    >
      <motion.div
        animate={{
          scale: isBreathPhase ? [0.6, 1, 0.6] : [0.7, 0.9, 0.7],
        }}
        transition={{
          duration: isBreathPhase ? 8 : 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20"
      />
    </motion.div>
  );
};

// Ana Premium Ritüel Deneyimi Component
const PremiumRitualExperience = ({ ritual, onClose, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 = intro
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis();
  const timerRef = useRef(null);

  // Ritüel akışını yükle
  useEffect(() => {
    const loadRitualFlow = async () => {
      try {
        // Map ritual type
        const typeMap = {
          "premium-1": "beyin-kalp",
          "premium-2": "his",
          "premium-3": "kundalini",
          "premium-4": "yaratim",
          "premium-5": "epifiz",
        };
        
        const response = await fetch(`${API_URL}/api/ritual/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ritual_id: ritual.id,
            ritual_title: ritual.title,
            ritual_type: typeMap[ritual.id] || "his",
            duration_seconds: ritual.durationSeconds || 480,
            intention: ritual.intention
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSteps(data.steps);
        } else {
          // Fallback to default
          const fallbackResponse = await fetch(`${API_URL}/api/ritual/default/${typeMap[ritual.id] || "his"}`);
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            setSteps(data.steps);
          }
        }
      } catch (error) {
        console.error("Ritual load error:", error);
        // Use ritual's own steps if available
        if (ritual.steps) {
          setSteps(ritual.steps.map(s => ({
            phase: s.phase || "ana",
            text: s.text,
            duration: s.duration || 6
          })));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadRitualFlow();

    // Cleanup on unmount
    return () => {
      stop();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [ritual, stop]);

  // Adım geçişi
  const proceedToNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentStepIndex, steps.length]);

  // Mevcut adımı işle
  useEffect(() => {
    if (isLoading || isPaused || isCompleted || currentStepIndex < 0) return;
    if (currentStepIndex >= steps.length) {
      setIsCompleted(true);
      return;
    }

    const currentStep = steps[currentStepIndex];
    setTimeLeft(currentStep.duration);

    // Sesli okuma
    if (!isMuted && isSupported) {
      speak(currentStep.text, () => {
        // Ses bittikten sonra bekleme
        timerRef.current = setTimeout(proceedToNextStep, 2000);
      });
    } else {
      // Sessiz modda zamanlayıcı
      timerRef.current = setTimeout(proceedToNextStep, currentStep.duration * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentStepIndex, isLoading, isPaused, isCompleted, isMuted, isSupported, speak, proceedToNextStep, steps]);

  // Countdown timer
  useEffect(() => {
    if (isPaused || isCompleted || currentStepIndex < 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isCompleted, currentStepIndex]);

  // Başla
  const handleStart = () => {
    setCurrentStepIndex(0);
  };

  // Duraklat/Devam
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      setIsPaused(true);
      stop();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  };

  // Ses aç/kapat
  const toggleMute = () => {
    if (!isMuted) {
      stop();
    }
    setIsMuted(!isMuted);
  };

  // Yeniden başla
  const handleRestart = () => {
    stop();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setCurrentStepIndex(-1);
    setIsCompleted(false);
    setIsPaused(false);
  };

  // Kapat
  const handleClose = () => {
    stop();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onClose();
  };

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length 
    ? steps[currentStepIndex] 
    : null;

  const progress = steps.length > 0 
    ? ((currentStepIndex + 1) / steps.length) * 100 
    : 0;

  // Loading State
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-6" />
          <p className="text-foreground/60 font-serif">Ritüel hazırlanıyor...</p>
        </div>
      </motion.div>
    );
  }

  // Intro State
  if (currentStepIndex < 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-background flex flex-col"
      >
        {/* Close Button */}
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-lg text-center">
            {/* Premium Badge */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-accent/60 uppercase tracking-[0.3em] mb-8"
            >
              Bu alan bir uygulama değil. Bir hatırlama alanıdır.
            </motion.p>

            {/* Breathing Circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-10"
            >
              <BreathingCircle phase="açılış" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-serif text-3xl sm:text-4xl text-foreground mb-4"
            >
              {ritual.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-foreground/60 mb-4"
            >
              {ritual.subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-sm text-foreground/40 mb-12"
            >
              {ritual.duration} • {steps.length} adım
            </motion.p>

            {/* Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <Button
                onClick={handleStart}
                size="lg"
                className="rounded-full px-12 py-6 text-lg"
              >
                <Play className="h-5 w-5 mr-3" />
                Başla
              </Button>
            </motion.div>

            {/* Voice Info */}
            {isSupported && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="text-xs text-foreground/30 mt-8"
              >
                <Volume2 className="h-3 w-3 inline mr-1" />
                Sesli rehberlik aktif
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Completed State
  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-background flex items-center justify-center px-6"
      >
        <div className="max-w-md text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <Heart className="h-14 w-14 text-accent mx-auto mb-8" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-serif text-3xl text-foreground mb-4"
          >
            Tamamlandı
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-foreground/60 mb-8"
          >
            {ritual.title}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-primary/5 rounded-2xl p-6 mb-10 border border-primary/10"
          >
            <p className="font-serif text-lg text-foreground/80 italic leading-relaxed">
              "Bugün... kendinle temas ettin...<br />Bu... yeterli..."
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex gap-4 justify-center"
          >
            <Button variant="outline" onClick={handleRestart} className="rounded-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Tekrarla
            </Button>
            <Button onClick={onComplete || handleClose} className="rounded-full">
              Bitir
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Active Ritual State
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
        <span className="text-sm text-foreground/50 font-serif">{ritual.title}</span>
        <span className="text-sm text-foreground/40">{currentStepIndex + 1}/{steps.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-muted mx-4 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-xl">
          {/* Breathing Animation */}
          <div className="flex justify-center mb-12">
            <BreathingCircle phase={currentStep?.phase || "ana"} />
          </div>

          {/* Phase Indicator */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="text-xs text-foreground/40 uppercase tracking-[0.2em] mb-6"
          >
            {currentStep?.phase === "açılış" && "Alan Açılıyor"}
            {currentStep?.phase === "nefes" && "Nefes Hizalama"}
            {currentStep?.phase === "ana" && "Ritüel"}
            {currentStep?.phase === "kapanış" && "Kapanış"}
          </motion.p>

          {/* Step Text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStepIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground leading-relaxed"
            >
              {currentStep?.text}
            </motion.p>
          </AnimatePresence>

          {/* Speaking Indicator */}
          {isSpeaking && !isMuted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 mt-8"
            >
              <div className="flex gap-1">
                <span className="w-1 h-4 bg-accent/50 rounded-full animate-pulse" />
                <span className="w-1 h-6 bg-accent/50 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <span className="w-1 h-3 bg-accent/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 flex justify-center gap-4">
        {/* Mute Button */}
        {isSupported && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        )}

        {/* Pause/Play Button */}
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-14 w-14"
          onClick={togglePause}
        >
          {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
        </Button>
      </div>

      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div className="text-center">
              <Pause className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
              <p className="text-foreground/60 font-serif mb-6">Duraklatıldı</p>
              <Button onClick={togglePause} className="rounded-full">
                <Play className="h-4 w-4 mr-2" />
                Devam Et
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PremiumRitualExperience;
