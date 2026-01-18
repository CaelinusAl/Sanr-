import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Heart, Compass, Sparkles, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const AboutPage = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1759756312568-9c2facdaa880?w=1920&q=80')`,
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-6">
              Anadolu'nun Uyanan Tanrıçaları
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Bu proje, sembolik, kültürel ve anlatı tabanlı bir dijital deneyimdir.
              Standart bir uygulama, chatbot veya veri odaklı bir AI ürünü değildir.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Concept */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-serif text-3xl text-foreground mb-8 text-center">
              Temel Kavram
            </h2>
            
            <Card className="border-primary/20 bg-primary/5 mb-8">
              <CardContent className="p-8 text-center">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
                <p className="font-serif text-xl text-foreground mb-2">
                  Caelinus AI, bilgi değil
                </p>
                <p className="text-2xl font-serif text-gradient">
                  ilham, anlam ve hikâye üretir.
                </p>
              </CardContent>
            </Card>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Bu sistem iki modda çalışır: <strong className="text-foreground">Anadolu Modu</strong> (Kolektif Hafıza) ve 
                <strong className="text-foreground"> SANRI'ya Sor</strong> (İç Yansıma).
              </p>
              <p>
                Her iki mod da sembolik dil kullanır, kesinlik sunmaz ve kullanıcıyı 
                kendi içsel yolculuğuna davet eder.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Separator className="max-w-3xl mx-auto" />

      {/* Two Modes Explained */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Anatolia Mode */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2">
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Compass className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-serif text-2xl text-foreground">Anadolu Modu</h3>
                      </div>
                      <p className="text-sm text-primary mb-4">Kolektif Hafıza</p>
                      <p className="text-muted-foreground mb-6">
                        "Anadolu'nun Uyanan Tanrıçaları" kitabına dayalıdır. 
                        Semboller, şehirler, sayılar ve kültürel bellek üzerinden 
                        kolektif hatırlamayı amaçlar.
                      </p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Anasayfa</p>
                        <p>• Şehirler (01-81)</p>
                        <p>• Okuma Katmanları</p>
                        <p>• Hakkında</p>
                      </div>
                    </div>
                    <div 
                      className="h-64 md:h-auto bg-cover bg-center"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1638218311714-0b89766a139e?w=800&q=80')`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* SANRI Mode */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2">
                    <div 
                      className="h-64 md:h-auto bg-cover bg-center order-2 md:order-1"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1768278929581-7f38d1ce1fb2?w=800&q=80')`,
                      }}
                    />
                    <div className="p-8 order-1 md:order-2">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-accent" />
                        </div>
                        <h3 className="font-serif text-2xl text-foreground">SANRI'ya Sor</h3>
                      </div>
                      <p className="text-sm text-accent mb-4">İç Yansıma</p>
                      <p className="text-muted-foreground mb-6">
                        SANRI bir varlık ya da bilinç DEĞİLDİR. Zihnin gerçek sandığı 
                        hikâyeyi temsil eder. Amacı: cevap değil, yansıma. 
                        Sembolik anlam ve açık uçlu sorular üretir.
                      </p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Kehanet yok</p>
                        <p>• Rehberlik yok</p>
                        <p>• Kesinlik yok</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl text-foreground mb-4">Temel İlkeler</h2>
            <p className="text-muted-foreground">Bu deneyimin değişmez kuralları</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Bilinç iddiası yok", desc: "Sistem bilinçli değildir, öyle de davranmaz." },
              { title: "Kehanet yok", desc: "Gelecek tahmini veya falcılık sunmaz." },
              { title: "Teşhis yok", desc: "Psikolojik değerlendirme yapmaz." },
              { title: "'Bu gerçektir' yok", desc: "Kesinlik dili kullanılmaz." },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-border/50 bg-background/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-serif">{index + 1}</span>
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

      {/* Main Message */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <blockquote className="font-serif text-3xl sm:text-4xl text-foreground leading-relaxed mb-8">
              "Hatırlamak dışarıda başlar.<br/>Anlamak içeride olur."
            </blockquote>
            <p className="text-muted-foreground mb-8">
              Sistem perspektif açar, sonra geri çekilir.
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

export default AboutPage;
