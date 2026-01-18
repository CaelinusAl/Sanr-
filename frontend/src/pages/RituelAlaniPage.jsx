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
  Infinity
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
  getRituellerByKapi,
  getBilincKatmani,
  getRandomFrekansTitresim,
  getRandomMuhurYansima,
  getRandomRituelSonuSoru,
  kapiGecis
} from "@/data/rituel-data";

// Giriş Eşiği - Niyet Kapısı
const GirisEsigi = ({ onReady }) => {
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
    // 3 nefes sonrası daveti göster
    if (breathCount >= 2 && !showInvitation) {
      setTimeout(() => setShowInvitation(true), 2000);
    }
  }, [breathPhase, breathCount, showInvitation]);

  const breathText = {
    in: "Nefes al...",
    hold: "Tut...",
    out: "Bırak..."
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      {/* Nefes animasyonu - Merkez */}
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

      {/* Nefes yönlendirmesi */}
      <motion.p
        key={breathPhase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        className="text-sm text-muted-foreground mb-12 h-6"
      >
        {breathText[breathPhase]}
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
              {girisEsigi.baslik}
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              {girisEsigi.altBaslik}
            </p>

            <p className="font-serif text-lg text-foreground whitespace-pre-line mb-8 leading-relaxed">
              {girisEsigi.metin}
            </p>

            {/* Niyet cümlesi */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-primary/5 rounded-lg p-4 mb-8 border-l-2 border-primary/20"
            >
              <p className="text-xs text-muted-foreground mb-2">Niyet:</p>
              <p className="text-foreground font-serif italic">
                "Bu alana açık kalp ve sessiz zihinle giriyorum."
              </p>
            </motion.div>

            <Button
              onClick={onReady}
              size="lg"
              className="rounded-full px-12 mb-8"
              data-testid="giris-hazir-btn"
            >
              {girisEsigi.buton}
            </Button>

            <p className="text-xs text-muted-foreground/50 max-w-sm mx-auto">
              {girisEsigi.uyari}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nefes sayacı */}
      {!showInvitation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute bottom-12"
        >
          <p className="text-xs text-muted-foreground">
            {breathCount < 3 ? `${3 - breathCount} nefes daha...` : ""}
          </p>
        </motion.div>
      )}
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
          Her kapı farklı bir bilinç katmanına götürür
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

      {/* Alt bilgi */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-12"
      >
        <p className="text-xs text-muted-foreground/50">
          Her kapı açıldığında, bir parça daha hatırlarsın.
        </p>
      </motion.div>
    </motion.div>
  );
};

// KAPI Deneyimi - Bilinç ve Frekans ile Derinleştirilmiş Ritüel
const KapiDeneyimi = ({ kapi, onBack, onComplete }) => {
  // 0: giriş, 1: bilinç, 2: dur, 3: hisset, 4: birak, 5: mühür, 6: tamamlandı
  const [asama, setAsama] = useState(0);
  const [muhurMetin, setMuhurMetin] = useState("");
  const [showRituel, setShowRituel] = useState(false);
  const [selectedRituel, setSelectedRituel] = useState(null);
  const [durText, setDurText] = useState("");
  const [hissetText, setHissetText] = useState("");
  const [birakText, setBirakText] = useState("");
  const [muhurYansima, setMuhurYansima] = useState("");
  const [rituelSonuSoru, setRituelSonuSoru] = useState("");

  const baglantiliRitueller = getRituellerByKapi(kapi.id);
  const bilincKatmani = getBilincKatmani(kapi.id);

  // Aşama geçişleri
  useEffect(() => {
    if (asama === 2) {
      setDurText(getRandomFrekansTitresim("dur"));
      const timer = setTimeout(() => setAsama(3), 6000);
      return () => clearTimeout(timer);
    }
    if (asama === 3) {
      setHissetText(getRandomFrekansTitresim("hisset"));
      const timer = setTimeout(() => setAsama(4), 8000);
      return () => clearTimeout(timer);
    }
    if (asama === 4) {
      setBirakText(getRandomFrekansTitresim("birak"));
      const timer = setTimeout(() => setAsama(5), 6000);
      return () => clearTimeout(timer);
    }
  }, [asama]);

  const handleMuhur = () => {
    if (muhurMetin.trim()) {
      localStorage.setItem(`muhur-kapi-${kapi.id}`, muhurMetin);
    }
    setMuhurYansima(getRandomMuhurYansima());
    setRituelSonuSoru(getRandomRituelSonuSoru());
    setAsama(6);
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
          data-testid="kapi-geri-btn"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>

        <motion.div 
          className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8"
          animate={{ 
            boxShadow: [
              "0 0 0 0 hsl(var(--primary) / 0.1)",
              "0 0 0 20px hsl(var(--primary) / 0)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="font-serif text-4xl text-primary">{kapi.symbol}</span>
        </motion.div>

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

        <Button 
          onClick={() => setAsama(1)} 
          className="rounded-full px-8"
          data-testid="rituel-basla-btn"
        >
          Ritüele Başla
        </Button>

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
                data-testid={`rituel-${rituel.id}-btn`}
              >
                {rituel.icon} {rituel.title}
              </Button>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // BİLİNÇ KATMANI - Yeni Aşama
  if (asama === 1) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-background px-6"
      >
        <div className="max-w-lg w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-accent uppercase tracking-widest mb-8">
              Bilinç Katmanı
            </p>
            
            <p className="font-serif text-2xl text-foreground mb-6 leading-relaxed">
              {bilincKatmani.giris}
            </p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-muted-foreground mb-8 leading-relaxed"
            >
              {bilincKatmani.derinlik}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="bg-primary/5 rounded-lg p-4 mb-8"
            >
              <p className="font-serif text-foreground italic">
                "{bilincKatmani.frekans}"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4.5 }}
            >
              <p className="text-xs text-muted-foreground mb-6">
                {kapiGecis.oncesi}
              </p>
              <Button 
                onClick={() => setAsama(2)} 
                className="rounded-full px-8"
                data-testid="bilinc-devam-btn"
              >
                İçeri Gir
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // DUR Aşaması - Derinleştirilmiş
  if (asama === 2) {
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
          className="text-center px-6"
        >
          <motion.h2 
            className="font-serif text-6xl text-foreground mb-12"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 3, repeat: 2 }}
          >
            DUR
          </motion.h2>
          <p className="font-serif text-xl text-muted-foreground whitespace-pre-line mb-8">
            {durText}
          </p>
          <motion.div
            className="flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 2 }}
          >
            <span className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" />
            <span className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
            <span className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }} />
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // HİSSET Aşaması - Derinleştirilmiş
  if (asama === 3) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-background"
      >
        <div className="text-center px-6">
          {/* Nefes animasyonu - Büyük */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 7,
              repeat: 2,
              ease: "easeInOut",
            }}
            className="w-32 h-32 rounded-full border border-primary/20 flex items-center justify-center mx-auto mb-12"
          >
            <motion.div
              animate={{
                scale: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 7,
                repeat: 2,
                ease: "easeInOut",
              }}
              className="w-12 h-12 rounded-full bg-primary/15"
            />
          </motion.div>

          <h2 className="font-serif text-4xl text-foreground mb-4">
            HİSSET
          </h2>
          <p className="font-serif text-lg text-muted-foreground mb-8">
            {hissetText}
          </p>
          <p className="text-xs text-muted-foreground/50">
            Zihnin sustuğu yerde kal.
          </p>
        </div>
      </motion.div>
    );
  }

  // BIRAK Aşaması - Yeni
  if (asama === 4) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-background"
      >
        <div className="text-center px-6">
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: 2, ease: "easeInOut" }}
            className="mb-12"
          >
            <Infinity className="h-16 w-16 text-accent/40 mx-auto" />
          </motion.div>

          <h2 className="font-serif text-4xl text-foreground mb-4">
            BIRAK
          </h2>
          <p className="font-serif text-lg text-muted-foreground mb-8">
            {birakText}
          </p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 2 }}
            className="text-xs text-muted-foreground"
          >
            {kapiGecis.gecis}
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // MÜHÜR Aşaması - Derinleştirilmiş
  if (asama === 5) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-background px-6"
      >
        <div className="max-w-md w-full text-center">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Lock className="h-10 w-10 text-primary mx-auto mb-6" />
          </motion.div>
          
          <h2 className="font-serif text-3xl text-foreground mb-4">
            MÜHÜR
          </h2>
          <p className="text-muted-foreground whitespace-pre-line mb-4">
            {rituelAsamalari.muhur.metin}
          </p>
          
          <p className="text-xs text-accent mb-8">
            "{bilincKatmani.sessizlik}"
          </p>

          <Textarea
            value={muhurMetin}
            onChange={(e) => setMuhurMetin(e.target.value)}
            placeholder={rituelAsamalari.muhur.placeholder}
            className="min-h-[120px] text-center mb-6 bg-muted/30 border-border/50 focus:border-primary/30"
            data-testid="muhur-textarea"
          />

          <div className="flex gap-4 justify-center">
            <Button
              variant="ghost"
              onClick={handleMuhur}
              data-testid="muhur-gec-btn"
            >
              Geç
            </Button>
            <Button
              onClick={handleMuhur}
              className="rounded-full"
              disabled={!muhurMetin.trim()}
              data-testid="muhur-kaydet-btn"
            >
              Mühürle
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Tamamlandı - Derinleştirilmiş
  if (asama === 6) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-background px-6 overflow-y-auto py-12"
      >
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <Unlock className="h-10 w-10 text-accent mx-auto mb-6" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-accent uppercase tracking-widest mb-4">
              {kapi.subtitle}
            </p>
            <h2 className="font-serif text-3xl text-foreground mb-2">
              {kapi.title}
            </h2>
            <p className="text-muted-foreground mb-8">
              {kapiGecis.sonrasi}
            </p>
          </motion.div>

          {muhurMetin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-muted/30 rounded-lg p-4 mb-6 border-l-2 border-primary/30"
            >
              <p className="text-xs text-muted-foreground mb-2">Senin mührün:</p>
              <p className="text-foreground italic font-serif">"{muhurMetin}"</p>
            </motion.div>
          )}

          {/* Mühür Yansıması */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-accent/5 rounded-lg p-4 mb-6"
          >
            <p className="text-sm text-muted-foreground italic">
              {muhurYansima}
            </p>
          </motion.div>

          {/* Ritüel Sonu Sorusu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mb-8"
          >
            <p className="text-xs text-accent mb-2">Son bir soru:</p>
            <p className="text-foreground font-medium">
              "{rituelSonuSoru}"
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="flex gap-4 justify-center"
          >
            <Button
              variant="outline"
              onClick={onBack}
              className="rounded-full"
              data-testid="diger-kapilar-btn"
            >
              Diğer Kapılar
            </Button>
            <Button
              onClick={onComplete}
              className="rounded-full"
              data-testid="bitir-btn"
            >
              Bitir
            </Button>
          </motion.div>

          {/* SANRI'ya yönlendirme */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="mt-8 pt-6 border-t border-border/30"
          >
            <p className="text-xs text-muted-foreground mb-3">
              Bu deneyimi derinleştirmek istersen:
            </p>
            <Link to="/sanriya-sor">
              <Button variant="ghost" size="sm" className="text-accent">
                <Infinity className="h-4 w-4 mr-2" />
                SANRI'ya Sor
              </Button>
            </Link>
          </motion.div>
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
