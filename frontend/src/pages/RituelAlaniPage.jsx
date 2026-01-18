import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Lock,
  Unlock,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  kapilar, 
  ritueller, 
  girisEsigi, 
  rituelAsamalari,
  getRituellerByKapi 
} from "@/data/rituel-data";

// Giriş Eşiği - Niyet Kapısı
const GirisEsigi = ({ onReady }) => {
  const [breathPhase, setBreathPhase] = useState("in");

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase(prev => prev === "in" ? "out" : "in");
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      {/* Nefes animasyonu */}
      <motion.div
        animate={{
          scale: breathPhase === "in" ? 1.3 : 1,
          opacity: breathPhase === "in" ? 1 : 0.5,
        }}
        transition={{ duration: 3.5, ease: "easeInOut" }}
        className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center mb-12"
      >
        <motion.div
          animate={{
            scale: breathPhase === "in" ? 1.2 : 0.8,
          }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
          className="w-6 h-6 rounded-full bg-primary/20"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center max-w-md"
      >
        <h1 className="font-serif text-3xl text-foreground mb-2">
          {girisEsigi.baslik}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {girisEsigi.altBaslik}
        </p>

        <p className="font-serif text-lg text-foreground whitespace-pre-line mb-12 leading-relaxed">
          {girisEsigi.metin}
        </p>

        <Button
          onClick={onReady}
          size="lg"
          className="rounded-full px-12 mb-8"
        >
          {girisEsigi.buton}
        </Button>

        <p className="text-xs text-muted-foreground/50 max-w-sm mx-auto">
          {girisEsigi.uyari}
        </p>
      </motion.div>
    </motion.div>
  );
};

// KAPI Seçim Ekranı
const KapiSecimi = ({ onSelectKapi }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <div className="text-center mb-12">
        <span className="text-primary/60 text-xs tracking-[0.3em] uppercase mb-2 block">
          7 Kutsal Kapı
        </span>
        <h2 className="font-serif text-3xl text-foreground mb-4">
          Hangi Kapıyı Açmak İstiyorsun?
        </h2>
        <p className="text-sm text-muted-foreground">
          Her kapı farklı bir eşiğe götürür
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
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <span className="font-serif text-xl text-primary">{kapi.symbol}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{kapi.subtitle}</p>
                  <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">
                    {kapi.title}
                  </h3>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// KAPI Deneyimi - 3 Aşamalı Ritüel
const KapiDeneyimi = ({ kapi, onBack, onComplete }) => {
  const [asama, setAsama] = useState(0); // 0: giriş, 1: dur, 2: hisset, 3: mühür, 4: tamamlandı
  const [muhurMetin, setMuhurMetin] = useState("");
  const [showRituel, setShowRituel] = useState(false);
  const [selectedRituel, setSelectedRituel] = useState(null);

  const baglantiliRitueller = getRituellerByKapi(kapi.id);

  const handleDurComplete = useCallback(() => {
    setTimeout(() => setAsama(2), rituelAsamalari.dur.sure);
  }, []);

  const handleHissetComplete = useCallback(() => {
    setTimeout(() => setAsama(3), rituelAsamalari.hisset.sure);
  }, []);

  useEffect(() => {
    if (asama === 1) handleDurComplete();
    if (asama === 2) handleHissetComplete();
  }, [asama, handleDurComplete, handleHissetComplete]);

  const handleMuhur = () => {
    // Mühür kaydedilir ama analiz edilmez
    if (muhurMetin.trim()) {
      localStorage.setItem(`muhur-kapi-${kapi.id}`, muhurMetin);
    }
    setAsama(4);
  };

  // Giriş Aşaması
  if (asama === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute top-4 left-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>

        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <span className="font-serif text-3xl text-primary">{kapi.symbol}</span>
        </div>

        <p className="text-sm text-muted-foreground mb-2">{kapi.subtitle}</p>
        <h2 className="font-serif text-4xl text-foreground mb-8">{kapi.title}</h2>

        <div className="max-w-md mx-auto mb-8">
          <p className="font-serif text-lg text-foreground leading-relaxed mb-6">
            "{kapi.frekans}"
          </p>
          <p className="text-muted-foreground italic">
            {kapi.davet}
          </p>
        </div>

        <Separator className="max-w-xs mx-auto mb-8" />

        <div className="bg-accent/5 rounded-lg p-4 max-w-sm mx-auto mb-8 border-l-2 border-accent">
          <p className="text-sm text-muted-foreground mb-1">Sembolik Soru:</p>
          <p className="text-foreground font-medium">"{kapi.soru}"</p>
        </div>

        <Button onClick={() => setAsama(1)} className="rounded-full px-8">
          Ritüele Başla
        </Button>

        {/* Bağlantılı Ritüeller */}
        {baglantiliRitueller.length > 0 && (
          <div className="mt-12">
            <p className="text-xs text-muted-foreground mb-4">
              Bu kapıya bağlı ritüel:
            </p>
            {baglantiliRitueller.map(rituel => (
              <Button
                key={rituel.id}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setSelectedRituel(rituel);
                  setShowRituel(true);
                }}
              >
                {rituel.icon} {rituel.title}
              </Button>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // DUR Aşaması
  if (asama === 1) {
    return (
      <motion.div
        initial={{ opacity: 0, backgroundColor: "transparent" }}
        animate={{ opacity: 1, backgroundColor: "hsl(var(--background))" }}
        className="fixed inset-0 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h2 className="font-serif text-5xl text-foreground mb-8">
            {rituelAsamalari.dur.baslik}
          </h2>
          <p className="font-serif text-xl text-muted-foreground whitespace-pre-line">
            {rituelAsamalari.dur.metin}
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // HİSSET Aşaması
  if (asama === 2) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-background"
      >
        <div className="text-center">
          {/* Nefes animasyonu */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-12"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20" />
          </motion.div>

          <h2 className="font-serif text-3xl text-foreground mb-4">
            {rituelAsamalari.hisset.baslik}
          </h2>
          <p className="font-serif text-lg text-muted-foreground">
            {rituelAsamalari.hisset.metin}
          </p>
        </div>
      </motion.div>
    );
  }

  // MÜHÜR Aşaması
  if (asama === 3) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-background px-6"
      >
        <div className="max-w-md w-full text-center">
          <Lock className="h-8 w-8 text-primary mx-auto mb-6" />
          
          <h2 className="font-serif text-3xl text-foreground mb-4">
            {rituelAsamalari.muhur.baslik}
          </h2>
          <p className="text-muted-foreground whitespace-pre-line mb-8">
            {rituelAsamalari.muhur.metin}
          </p>

          <Textarea
            value={muhurMetin}
            onChange={(e) => setMuhurMetin(e.target.value)}
            placeholder={rituelAsamalari.muhur.placeholder}
            className="min-h-[100px] text-center mb-6 bg-muted/30 border-border/50"
          />

          <div className="flex gap-4 justify-center">
            <Button
              variant="ghost"
              onClick={handleMuhur}
            >
              Geç
            </Button>
            <Button
              onClick={handleMuhur}
              className="rounded-full"
              disabled={!muhurMetin.trim()}
            >
              Mühürle
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Tamamlandı
  if (asama === 4) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-background px-6"
      >
        <div className="max-w-md w-full text-center">
          <Unlock className="h-8 w-8 text-accent mx-auto mb-6" />
          
          <h2 className="font-serif text-3xl text-foreground mb-4">
            {kapi.title}
          </h2>
          <p className="text-muted-foreground mb-8">
            Bu kapı açıldı.
          </p>

          {muhurMetin && (
            <div className="bg-muted/30 rounded-lg p-4 mb-8 border-l-2 border-primary/30">
              <p className="text-xs text-muted-foreground mb-2">Senin mührün:</p>
              <p className="text-foreground italic">"{muhurMetin}"</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={onBack}
              className="rounded-full"
            >
              Diğer Kapılar
            </Button>
            <Button
              onClick={onComplete}
              className="rounded-full"
            >
              Bitir
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

// Mini Ritüel Modal
const RituelModal = ({ rituel, onClose }) => {
  const [asama, setAsama] = useState(0);

  if (!rituel) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center px-6"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4"
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">{rituel.icon}</span>
          <h2 className="font-serif text-2xl text-foreground">{rituel.title}</h2>
          <p className="text-sm text-muted-foreground">{rituel.subtitle}</p>
        </div>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-6">
            <p className="text-muted-foreground whitespace-pre-line mb-6">
              {rituel.giris}
            </p>

            <div className="bg-primary/5 rounded-lg p-4 mb-6">
              <p className="font-serif text-foreground whitespace-pre-line leading-relaxed">
                {rituel.metin}
              </p>
            </div>

            {rituel.sonMetin && (
              <p className="font-serif text-foreground whitespace-pre-line leading-relaxed mb-6">
                {rituel.sonMetin}
              </p>
            )}

            {rituel.soru && (
              <div className="bg-accent/5 rounded-lg p-4 border-l-2 border-accent">
                <p className="text-sm text-muted-foreground mb-1">SANRI soruyor:</p>
                <p className="text-foreground italic">"{rituel.soru}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button onClick={onClose} variant="outline" className="rounded-full">
            Kapat
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Ana Ritüel Alanı Sayfası
const RituelAlaniPage = () => {
  const [screen, setScreen] = useState("giris"); // giris, kapilar, deneyim
  const [selectedKapi, setSelectedKapi] = useState(null);
  const [showRituel, setShowRituel] = useState(false);
  const [selectedRituel, setSelectedRituel] = useState(null);

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
    setScreen("giris");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-6">
        <AnimatePresence mode="wait">
          {screen === "giris" && (
            <GirisEsigi key="giris" onReady={handleReady} />
          )}
          
          {screen === "kapilar" && (
            <motion.div key="kapilar">
              <Button
                variant="ghost"
                onClick={() => setScreen("giris")}
                className="mb-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <KapiSecimi onSelectKapi={handleSelectKapi} />
            </motion.div>
          )}
          
          {screen === "deneyim" && selectedKapi && (
            <KapiDeneyimi
              key="deneyim"
              kapi={selectedKapi}
              onBack={handleBack}
              onComplete={handleComplete}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Ritüel Modal */}
      <AnimatePresence>
        {showRituel && selectedRituel && (
          <RituelModal
            rituel={selectedRituel}
            onClose={() => {
              setShowRituel(false);
              setSelectedRituel(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RituelAlaniPage;
