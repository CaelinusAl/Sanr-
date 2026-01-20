import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Lock,
  Unlock,
  X,
  Infinity,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Flame,
  Moon,
  Sun,
  BookOpen,
  AlertCircle,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium, FEATURES } from "@/contexts/PremiumContext";
import { UpgradeModal, FeatureGate, LockedContent } from "@/components/premium/PremiumComponents";
import { 
  getKapilar,
  ritueller, 
  girisEsigi, 
  rituelAsamalari,
  getRituellerByKapi,
  getBilincKatmani,
  getRandomFrekansTitresim,
  getRandomMuhurYansima,
  getRandomRituelSonuSoru,
  kapiGecis
} from "@/data/rituel-data";
import {
  getMikroRitueller,
  getDerinRitueller,
  getKapanisRitueller,
  get112Ritueller,
  getBugunRitueli,
  getRituelById
} from "@/data/rituel-112-data";
import RitualPlayer from "@/components/RitualPlayer";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const IS_PREMIUM = process.env.REACT_APP_DEMO_PREMIUM === 'true';

// ============================================
// YENİ: Premium Ritüel Hatları Componenti
// ============================================

const PremiumRitualLines = ({ onSelectRitual }) => {
  const [lines, setLines] = useState([]);
  const [rituals, setRituals] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [linesRes, ritualsRes] = await Promise.all([
        axios.get(`${API_URL}/api/premium-ritual/lines`),
        axios.get(`${API_URL}/api/premium-ritual/rituals`)
      ]);
      setLines(linesRes.data.lines || []);
      setRituals(ritualsRes.data.rituals || []);
      if (linesRes.data.lines?.length > 0) {
        setSelectedLine(linesRes.data.lines[0].id);
      }
    } catch (error) {
      console.error('Error fetching premium rituals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRituals = rituals.filter(r => r.line_id === selectedLine);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 3 Hat Seçimi */}
      <div className="grid grid-cols-3 gap-3">
        {lines.map((line) => (
          <button
            key={line.id}
            onClick={() => setSelectedLine(line.id)}
            className={`p-4 rounded-xl border text-center transition-all ${
              selectedLine === line.id
                ? 'bg-accent/10 border-accent/50'
                : 'bg-card/50 border-border/50 hover:bg-card/80'
            }`}
          >
            <span className="text-2xl block mb-2">{line.icon}</span>
            <span className="text-sm font-medium text-foreground block">{line.name_tr.split(' & ')[0]}</span>
            <span className="text-xs text-foreground/50 block mt-1">{line.description_tr}</span>
          </button>
        ))}
      </div>

      {/* Seçili Hat Ritüelleri */}
      <div className="space-y-4">
        {filteredRituals.map((ritual) => {
          const hasSteps = ritual.steps && ritual.steps.length > 0;
          const isLocked = !IS_PREMIUM;
          
          return (
            <Card 
              key={ritual.id} 
              className={`border-border/50 bg-card/50 relative overflow-hidden ${!hasSteps ? 'opacity-60' : ''}`}
            >
              {/* Locked Overlay for non-premium */}
              {isLocked && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="h-8 w-8 text-accent/60 mx-auto mb-2" />
                    <p className="text-sm text-foreground/60 mb-3">Premium ile aç</p>
                    <Button size="sm" className="rounded-full bg-accent hover:bg-accent/90">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium&apos;a Geç
                    </Button>
                  </div>
                </div>
              )}

              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      ritual.is_featured ? 'bg-amber-500/20' : 'bg-accent/10'
                    }`}>
                      <span className="text-2xl">{ritual.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-lg text-foreground">{ritual.name_tr}</h4>
                        {ritual.is_featured && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded-full">
                            ÖNE ÇIKAN
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/50 line-clamp-1">{ritual.description_tr}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-foreground/40">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ritual.duration_minutes} dk
                        </span>
                        <span>{ritual.steps?.length || 0} adım</span>
                        <span className="px-2 py-0.5 rounded bg-accent/10 text-accent">{ritual.level}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="rounded-full" 
                    size="sm"
                    onClick={() => hasSteps && !isLocked && onSelectRitual(ritual)}
                    disabled={!hasSteps || isLocked}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {hasSteps ? 'Başlat' : 'Yakında'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// YENİ: Ritüel Modülleri Componenti
// ============================================

const RituelModulleri = ({ onStartRituel, t, language }) => {
  const bugunRitueli = getBugunRitueli(language);
  const mikroRitueller = getMikroRitueller(language);
  const derinRitueller = getDerinRitueller(language);
  const kapanisRituelleri = getKapanisRitueller(language);

  return (
    <div className="space-y-8">
      {/* Bugünün Ritüeli */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                <Sun className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-accent uppercase tracking-wider font-medium">{t('rituel.today')}</span>
                  <span className="text-xs text-foreground/50 bg-foreground/10 px-2 py-0.5 rounded-full">
                    {bugunRitueli.duration}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-foreground mb-2">{bugunRitueli.title}</h3>
                <p className="text-sm text-foreground/60 mb-4">{bugunRitueli.intention}</p>
                <Button 
                  onClick={() => onStartRituel(bugunRitueli)}
                  className="rounded-full bg-accent hover:bg-accent/90"
                  data-testid="bugun-rituel-btn"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {t('common.start')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Üç Ana Modül */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Mikro Ritüel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full border-border/50 bg-card/50 hover:bg-card transition-all group">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-serif text-lg text-foreground mb-1">{t('rituel.modules.micro.title')}</h4>
              <p className="text-xs text-foreground/50 mb-3">{t('rituel.modules.micro.duration')}</p>
              <p className="text-sm text-foreground/60 mb-4">
                {t('rituel.modules.micro.description')}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full rounded-full"
                onClick={() => onStartRituel(mikroRitueller[0])}
                data-testid="mikro-rituel-btn"
              >
                {t('common.explore')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Derin Ritüel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full border-border/50 bg-card/50 hover:bg-card transition-all group">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-emphasis/10 flex items-center justify-center mb-4 group-hover:bg-emphasis/20 transition-colors">
                <Flame className="h-5 w-5 text-emphasis" />
              </div>
              <h4 className="font-serif text-lg text-foreground mb-1">{t('rituel.modules.deep.title')}</h4>
              <p className="text-xs text-foreground/50 mb-3">{t('rituel.modules.deep.duration')}</p>
              <p className="text-sm text-foreground/60 mb-4">
                {t('rituel.modules.deep.description')}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full rounded-full"
                onClick={() => onStartRituel(derinRitueller[0])}
                data-testid="derin-rituel-btn"
              >
                {t('common.explore')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Niyet & Kapanış */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full border-border/50 bg-card/50 hover:bg-card transition-all group">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-anatolian/10 flex items-center justify-center mb-4 group-hover:bg-anatolian/20 transition-colors">
                <Moon className="h-5 w-5 text-anatolian" />
              </div>
              <h4 className="font-serif text-lg text-foreground mb-1">{t('rituel.modules.closing.title')}</h4>
              <p className="text-xs text-foreground/50 mb-3">{t('rituel.modules.closing.duration')}</p>
              <p className="text-sm text-foreground/60 mb-4">
                {t('rituel.modules.closing.description')}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full rounded-full"
                onClick={() => onStartRituel(kapanisRituelleri[0])}
                data-testid="kapanis-rituel-btn"
              >
                {t('common.explore')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

// ============================================
// YENİ: 112 Ritüelleri Listesi
// ============================================

const Rituel112Listesi = ({ onStartRituel, t, language }) => {
  const kitap112Rituelleri = get112Ritueller(language);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-serif text-xl text-foreground">{t('rituel.book112.title')}</h3>
          <p className="text-sm text-foreground/60">{t('rituel.book112.subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {kitap112Rituelleri.map((rituel, index) => (
          <motion.div
            key={rituel.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all cursor-pointer group"
              onClick={() => onStartRituel(rituel)}
              data-testid={`rituel-112-${rituel.id}`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <span className="font-serif text-primary">{rituel.chapter}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-serif text-base text-foreground truncate">{rituel.title}</h4>
                    <span className="text-xs text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded-full shrink-0">
                      {rituel.duration}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/50 truncate">{rituel.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-foreground/30 group-hover:text-primary transition-colors shrink-0" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Güvenlik Notu */}
      <Alert className="border-accent/20 bg-accent/5 mt-6">
        <AlertCircle className="h-4 w-4 text-accent" />
        <AlertDescription className="text-sm text-foreground/60">
          {t('rituel.entry.warning')}
        </AlertDescription>
      </Alert>
    </div>
  );
};

// ============================================
// YENİ: Adım Adım Ritüel Deneyimi
// ============================================

const RituelDeneyimi = ({ rituel, onClose, onComplete, t }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(rituel.steps[0]?.duration || 10);
  const [isCompleted, setIsCompleted] = useState(false);

  const step = rituel.steps[currentStep];
  const totalSteps = rituel.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    if (isPaused || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Sonraki adıma geç
          if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
            return rituel.steps[currentStep + 1]?.duration || 10;
          } else {
            // Ritüel tamamlandı
            setIsCompleted(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, isPaused, isCompleted, rituel.steps, totalSteps]);

  const handleRestart = () => {
    setCurrentStep(0);
    setTimeLeft(rituel.steps[0]?.duration || 10);
    setIsCompleted(false);
    setIsPaused(false);
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background flex items-center justify-center px-6"
      >
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <Heart className="h-12 w-12 text-accent mx-auto mb-6" />
          </motion.div>
          
          <h2 className="font-serif text-3xl text-foreground mb-4">{t('rituel.complete.title')}</h2>
          <p className="text-foreground/60 mb-8">{rituel.title}</p>
          
          <p className="font-serif text-lg text-foreground/80 italic mb-8">
            &ldquo;{t('rituel.complete.note')}&rdquo;
          </p>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={handleRestart} className="rounded-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('rituel.complete.repeat')}
            </Button>
            <Button onClick={onComplete || onClose} className="rounded-full">
              {t('rituel.complete.finish')}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <span className="text-sm text-foreground/50">{rituel.title}</span>
        <span className="text-sm text-foreground/50">{currentStep + 1}/{totalSteps}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-muted mx-4 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          {/* Nefes Animasyonu */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: 10,
              ease: "easeInOut",
            }}
            className="w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-12"
          >
            <motion.div
              animate={{
                scale: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 6,
                repeat: 10,
                ease: "easeInOut",
              }}
              className="w-10 h-10 rounded-full bg-primary/20"
            />
          </motion.div>

          {/* Adım Metni */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="font-serif text-2xl sm:text-3xl text-foreground leading-relaxed"
            >
              {step.text}
            </motion.p>
          </AnimatePresence>

          {/* Zamanlayıcı */}
          <motion.div 
            className="mt-12 text-4xl font-light text-foreground/30"
            key={timeLeft}
          >
            {timeLeft}
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 flex justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-12 w-12"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </Button>
      </div>
    </motion.div>
  );
};

// ============================================
// MEVCUT: Giriş Eşiği Component
// ============================================

const GirisEsigi = ({ onReady, t }) => {
  const [breathPhase, setBreathPhase] = useState("in");
  const [breathCount, setBreathCount] = useState(0);
  const [showInvitation, setShowInvitation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === "in") return "hold";
        if (prev === "hold") return "out";
        return "in";
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (breathPhase === "in") {
      setBreathCount(prev => prev + 1);
    }
    if (breathCount >= 2 && !showInvitation) {
      setTimeout(() => setShowInvitation(true), 2000);
    }
  }, [breathPhase, breathCount, showInvitation]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center px-6"
    >
      <motion.div
        animate={{
          scale: breathPhase === "in" ? 1.4 : breathPhase === "hold" ? 1.4 : 1,
          opacity: breathPhase === "hold" ? 1 : 0.6,
        }}
        transition={{ duration: 2.8, ease: "easeInOut" }}
        className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center mb-6"
      >
        <motion.div
          animate={{
            scale: breathPhase === "in" ? 1.3 : breathPhase === "hold" ? 1.3 : 0.7,
            backgroundColor: breathPhase === "hold" 
              ? "hsl(var(--primary) / 0.3)" 
              : "hsl(var(--primary) / 0.15)"
          }}
          transition={{ duration: 2.8, ease: "easeInOut" }}
          className="w-8 h-8 rounded-full"
        />
      </motion.div>

      <motion.p
        key={breathPhase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        className="text-sm text-muted-foreground mb-12 h-6"
      >
        {t(`rituel.breath.${breathPhase === 'in' ? 'in' : breathPhase === 'hold' ? 'hold' : 'out'}`)}
      </motion.p>

      <AnimatePresence>
        {showInvitation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-center max-w-md"
          >
            <h1 className="font-serif text-3xl text-foreground mb-2">
              {t('rituel.entry.title')}
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              {t('rituel.entry.subtitle')}
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-primary/5 rounded-lg p-4 mb-8 border-l-2 border-primary/20"
            >
              <p className="text-foreground font-serif italic">
                {t('rituel.entry.intention')}
              </p>
            </motion.div>

            <Button
              onClick={onReady}
              size="lg"
              className="rounded-full px-12 mb-8"
              data-testid="giris-hazir-btn"
            >
              {t('rituel.entry.button')}
            </Button>

            <p className="text-xs text-muted-foreground/50 max-w-sm mx-auto">
              {t('rituel.entry.warning')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!showInvitation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute bottom-12"
        >
          <p className="text-xs text-muted-foreground">
            {breathCount < 3 ? (t('common.minutes') === 'min' ? `${3 - breathCount} more breaths...` : `${3 - breathCount} nefes daha...`) : ""}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================
// MEVCUT: Kapı Seçimi Component (Kısaltılmış)
// ============================================

const KapiSecimi = ({ onSelectKapi, t, language }) => {
  const kapilar = getKapilar(language);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <div className="text-center mb-12">
        <span className="text-primary/60 text-xs tracking-[0.3em] uppercase mb-2 block">
          {language === 'en' ? '7 Sacred Gates' : '7 Kutsal Kapı'}
        </span>
        <h2 className="font-serif text-3xl text-foreground mb-4">
          {t('rituel.gates.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('rituel.gates.subtitle')}
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {kapilar.map((kapi, index) => (
          <motion.div
            key={kapi.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300 cursor-pointer group"
              onClick={() => onSelectKapi(kapi)}
              data-testid={`kapi-${kapi.id}`}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <motion.div 
                  className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="font-serif text-2xl text-primary">{kapi.symbol}</span>
                </motion.div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{kapi.subtitle}</p>
                  <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">
                    {kapi.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                    {kapi.element}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-12"
      >
        <p className="text-xs text-muted-foreground/50">
          {t('rituel.gates.note')}
        </p>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// ANA SAYFA
// ============================================

const RituelAlaniPage = () => {
  const { t, language } = useLanguage();
  const { 
    isPremium, 
    hasFeature, 
    showUpgradeModal,
    isUpgradeModalOpen,
    hideUpgradeModal
  } = usePremium();
  
  const [screen, setScreen] = useState("ana"); // ana, giris, kapilar, deneyim
  const [selectedKapi, setSelectedKapi] = useState(null);
  const [activeRituel, setActiveRituel] = useState(null);
  const [activeTab, setActiveTab] = useState("moduller");
  const [premiumRitualPlayer, setPremiumRitualPlayer] = useState({ open: false, ritual: null });

  const handleStartRituel = (rituel) => {
    // Check if this is a deep ritual that requires premium
    const isDeepRitual = rituel.type === 'deep' || rituel.type === 'kapanis';
    if (isDeepRitual && !isPremium) {
      showUpgradeModal(FEATURES.RITUAL_DEEP);
      return;
    }
    setActiveRituel(rituel);
  };

  const handleCloseRituel = () => {
    setActiveRituel(null);
  };

  const handleStartPremiumRitual = (ritual) => {
    if (!isPremium) {
      showUpgradeModal(FEATURES.RITUAL_DEEP);
      return;
    }
    setPremiumRitualPlayer({ open: true, ritual });
  };

  const handleClosePremiumRitual = () => {
    setPremiumRitualPlayer({ open: false, ritual: null });
  };

  const handleReady = () => {
    setScreen("kapilar");
  };

  const handleSelectKapi = (kapi) => {
    setSelectedKapi(kapi);
    setScreen("deneyim");
  };

  const handleBack = () => {
    setSelectedKapi(null);
    setScreen("kapilar");
  };

  const handleComplete = () => {
    setSelectedKapi(null);
    setScreen("ana");
  };

  const handleEnterKapilar = () => {
    setScreen("giris");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-6">
        
        {/* Ana Ekran */}
        {screen === "ana" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-breathe">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-4">
                  {t('rituel.title')}
                </h1>
                <p className="text-foreground/60 max-w-lg mx-auto">
                  {t('rituel.subtitle')}
                  <br />
                  <span className="text-sm">{t('rituel.subNote')}</span>
                </p>
              </motion.div>
            </div>

            {/* Ritüele Başla - Ana Buton */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <Button 
                size="lg" 
                className="rounded-full px-12 py-6 text-lg shadow-lg"
                onClick={handleEnterKapilar}
                data-testid="rituel-basla-ana-btn"
              >
                <Infinity className="h-5 w-5 mr-3" />
                {t('rituel.mainButton')}
              </Button>
            </motion.div>

            <Separator className="max-w-2xl mx-auto mb-12" />

            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="premium" className="text-base flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  {t('rituel.tabs.premium')}
                  {!isPremium && <Lock className="h-3 w-3 ml-1 text-muted-foreground" />}
                </TabsTrigger>
                <TabsTrigger value="moduller" className="text-base">{t('rituel.tabs.quick')}</TabsTrigger>
                <TabsTrigger value="112" className="text-base flex items-center gap-2">
                  {t('rituel.tabs.book112')}
                  {!hasFeature(FEATURES.BOOK_112_FULL) && <Lock className="h-3 w-3 ml-1 text-muted-foreground" />}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="premium">
                <FeatureGate 
                  feature={FEATURES.RITUAL_DEEP}
                  fallback={
                    <LockedContent
                      title={language === 'en' ? 'Premium Rituals' : 'Premium Ritüeller'}
                      description={language === 'en' 
                        ? 'Deep ritual activations, frequency work, and consciousness journeys are available with premium access.'
                        : 'Derin ritüel aktivasyonları, frekans çalışmaları ve bilinç yolculukları premium erişimle açılır.'}
                      onUpgrade={() => showUpgradeModal(FEATURES.RITUAL_DEEP)}
                    />
                  }
                >
                  <PremiumRitualLines onSelectRitual={handleStartPremiumRitual} />
                </FeatureGate>
              </TabsContent>

              <TabsContent value="moduller">
                <RituelModulleri onStartRituel={handleStartRituel} t={t} language={language} />
              </TabsContent>

              <TabsContent value="112">
                <FeatureGate 
                  feature={FEATURES.BOOK_112_FULL}
                  fallback={
                    <LockedContent
                      title={language === 'en' ? 'Book 112: The Self-Creating Goddess' : '112. Kitap: Kendini Yaratan Tanrıça'}
                      description={language === 'en' 
                        ? 'Ancient wisdom and deep consciousness rituals from the 112th Book. Unlock full access to continue your journey.'
                        : '112. Kitap\'tan kadim bilgelik ve derin bilinç ritüelleri. Yolculuğuna devam etmek için tam erişimi aç.'}
                      onUpgrade={() => showUpgradeModal(FEATURES.BOOK_112_FULL)}
                    />
                  }
                >
                  <Rituel112Listesi onStartRituel={handleStartRituel} t={t} language={language} />
                </FeatureGate>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {/* Giriş Eşiği */}
        <AnimatePresence mode="wait">
          {screen === "giris" && (
            <motion.div key="giris">
              <Button
                variant="ghost"
                onClick={() => setScreen("ana")}
                className="mb-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
              <GirisEsigi onReady={handleReady} t={t} />
            </motion.div>
          )}
          
          {screen === "kapilar" && (
            <motion.div key="kapilar">
              <Button
                variant="ghost"
                onClick={() => setScreen("ana")}
                className="mb-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
              <KapiSecimi onSelectKapi={handleSelectKapi} t={t} language={language} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ritüel Deneyimi Overlay */}
      <AnimatePresence>
        {activeRituel && (
          <RituelDeneyimi
            rituel={activeRituel}
            onClose={handleCloseRituel}
            onComplete={handleCloseRituel}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Premium Ritual Player */}
      <RitualPlayer
        ritual={premiumRitualPlayer.ritual}
        isOpen={premiumRitualPlayer.open}
        onClose={handleClosePremiumRitual}
        isPremium={isPremium}
        language={language}
      />
      
      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={hideUpgradeModal}
        feature={FEATURES.RITUAL_DEEP}
      />
    </div>
  );
};

export default RituelAlaniPage;
