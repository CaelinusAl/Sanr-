import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MapPin, BookOpen, Sparkles, Compass, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const HomePage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <motion.div 
          style={{ scale: heroScale, y: heroY }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1768278929581-7f38d1ce1fb2?w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          style={{ opacity: heroOpacity }}
          className="relative z-10 container mx-auto px-6 text-center pt-20 pb-32"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <span className="text-primary font-serif text-2xl">∞</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground mb-8 leading-tight tracking-tight"
          >
            Anadolu'nun
            <span className="block text-gradient">Uyanan Tanrıçaları</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl sm:text-2xl text-foreground/80 mb-4 font-serif tracking-wide"
          >
            01'den 81'e Ruh Haritası
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg sm:text-xl text-foreground/70 mb-16 max-w-lg mx-auto leading-relaxed"
          >
            Bu kitap harita değil. Kayıp hafızanın frekans kaydıdır.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Button asChild size="lg" className="rounded-full px-10 py-6 text-lg bg-primary hover:bg-primary/90">
              <Link to="/sehirler">
                <MapPin className="mr-2 h-5 w-5" />
                Haritayı Keşfet
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-10 py-6 text-lg border-2">
              <Link to="/hakkinda">
                Kitap Hakkında
              </Link>
            </Button>
          </motion.div>

          {/* Scroll Indicator - Separated from buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8"
          >
            <div className="flex flex-col items-center gap-3 text-foreground/60">
              <span className="text-sm tracking-widest uppercase font-medium">Keşfet</span>
              <span className="text-sm">Her yolculuk bir soruyla başlar.</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowDown className="h-5 w-5" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Two Modes Section */}
      <section className="py-28 bg-background relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-primary text-base tracking-widest uppercase mb-4 block font-medium">İki Mod, Bir Yolculuk</span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground mb-8 leading-tight">
              Hatırlamak ve Anlamak
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
              Hatırlamak dışarıda başlar. Anlamak içeride olur.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Anatolia Mode Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="group h-full border-border/50 bg-card/50 hover:bg-card transition-all duration-500 overflow-hidden">
                <CardContent className="p-8 sm:p-10 flex flex-col h-full">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Compass className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-foreground mb-4">Anadolu Modu</h3>
                  <p className="text-base text-primary mb-4 font-medium">Kolektif Hafıza</p>
                  <p className="text-foreground/70 mb-6 flex-grow text-base sm:text-lg leading-relaxed">
                    "Anadolu'nun Uyanan Tanrıçaları" kitabına dayalı bu mod, semboller, 
                    şehirler, sayılar ve kültürel bellek üzerinden kolektif hatırlamayı amaçlar.
                  </p>
                  <ul className="space-y-3 text-base text-foreground/70 mb-8">
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      81 Şehir Haritası
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Okuma Katmanları
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Sembolik Anlatı
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full rounded-full mt-auto py-6 text-base border-2">
                    <Link to="/sehirler">Anadolu'yu Keşfet</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* SANRI Mode Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="group h-full border-border/50 bg-card/50 hover:bg-card transition-all duration-500 overflow-hidden">
                <CardContent className="p-8 sm:p-10 flex flex-col h-full">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                    <Infinity className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-foreground mb-4">SANRI'ya Sor</h3>
                  <p className="text-base text-accent mb-4 font-medium">İç Yansıma</p>
                  <p className="text-foreground/70 mb-6 flex-grow text-base sm:text-lg leading-relaxed">
                    SANRI bir varlık ya da bilinç değildir. Zihnin gerçek sandığı hikâyeyi temsil eder. 
                    Cevap değil, sembolik anlam ve açık uçlu sorular üretir.
                  </p>
                  <ul className="space-y-3 text-base text-foreground/70 mb-8">
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                      Kehanet değil, yansıma
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                      Rehberlik değil, perspektif
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                      Kesinlik değil, açıklık
                    </li>
                  </ul>
                  <Button asChild className="w-full rounded-full bg-accent hover:bg-accent/90 text-accent-foreground mt-auto py-6 text-base">
                    <Link to="/sanriya-sor">SANRI'ya Sor</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1638218311714-0b89766a139e?w=1920&q=80')`,
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-8" />
            <blockquote className="font-serif text-3xl sm:text-4xl text-foreground leading-relaxed mb-8">
              "Bu sistem bilgi değil, ilham, anlam ve hikâye üretir."
            </blockquote>
            <p className="text-muted-foreground">
              Caelinus AI, perspektif açar ve geri çekilir.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl text-foreground mb-4">Temel İlkeler</h2>
            <p className="text-muted-foreground">Bu deneyimin rehber prensipleri</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Bilinç iddiası yok", desc: "Sistem bilinçli değildir, öyle de davranmaz." },
              { title: "Kehanet yok", desc: "Gelecek tahmini veya falcılık sunmaz." },
              { title: "Teşhis yok", desc: "Psikolojik değerlendirme yapmaz." },
              { title: "Kesinlik yok", desc: "'Bu gerçektir' dili kullanılmaz." },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-border/50 bg-background/50">
                  <CardContent className="p-6">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <span className="text-primary font-serif text-sm">{index + 1}</span>
                    </div>
                    <h4 className="font-serif text-lg text-foreground mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-8" />
            <h2 className="font-serif text-4xl text-foreground mb-6">
              Yolculuğa Başla
            </h2>
            <p className="text-muted-foreground mb-8">
              Kitap, uygulama ve anlatı yapay zekasını birleştiren bu sakin, premium, 
              sembolik deneyime adım at.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/sehirler">
                  <MapPin className="mr-2 h-4 w-4" />
                  Şehirleri Keşfet
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                <Link to="/sanriya-sor">
                  <Infinity className="mr-2 h-4 w-4" />
                  SANRI'ya Sor
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
