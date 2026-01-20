import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { getRandomFrekansText, getFrekansTexts } from "@/data/bilinc-frekans";
import { useLanguage } from "@/contexts/LanguageContext";

const FrekansPage = () => {
  const { t, language } = useLanguage();
  const [currentText, setCurrentText] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [breathPhase, setBreathPhase] = useState("in"); // in, hold, out

  useEffect(() => {
    setCurrentText(getRandomFrekansText(language));
  }, [language]);

  // Nefes döngüsü
  useEffect(() => {
    const breathCycle = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === "in") return "hold";
        if (prev === "hold") return "out";
        return "in";
      });
    }, 4000);

    return () => clearInterval(breathCycle);
  }, []);

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      const texts = getFrekansTexts(language);
      const currentIndex = texts.findIndex(t => t.id === currentText?.id);
      const nextIndex = (currentIndex + 1) % texts.length;
      setCurrentText(texts[nextIndex]);
      setIsTransitioning(false);
    }, 800);
  }, [currentText, language]);

  // Klavye ile geçiş
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext]);

  if (!currentText) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Çok Minimal */}
      <header className="pt-28 pb-4">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <span className="text-accent/40 text-xs tracking-[0.4em] uppercase">
              {t('frekans.title')}
            </span>
          </motion.div>
        </div>
      </header>

      {/* Ana İçerik - Tam Merkez */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <AnimatePresence mode="wait">
            {!isTransitioning && (
              <motion.div
                key={currentText.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="text-center"
              >
                {/* Mikro-Metin */}
                <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground leading-relaxed whitespace-pre-line mb-16">
                  {currentText.text}
                </p>

                {/* Nefes Göstergesi */}
                <motion.div
                  className="flex items-center justify-center mb-12"
                  animate={{
                    scale: breathPhase === "in" ? 1.2 : breathPhase === "hold" ? 1.2 : 1,
                    opacity: breathPhase === "hold" ? 1 : 0.6,
                  }}
                  transition={{ duration: 3.5, ease: "easeInOut" }}
                >
                  <div className="w-4 h-4 rounded-full bg-accent/30" />
                </motion.div>

                {/* İlerleme - Çok Minimal */}
                <motion.button
                  onClick={handleNext}
                  className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <ChevronRight className="h-6 w-6" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Alt - Neredeyse Görünmez */}
      <footer className="py-6">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground/20 tracking-wider">
              {t('frekans.navigation')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FrekansPage;
