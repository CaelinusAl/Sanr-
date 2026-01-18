import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Compass, Brain, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const AboutPage = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <span className="text-primary font-serif text-2xl">∞</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-6">
              Caelinus Nedir?
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Bu uygulama bilinç öğretmez.<br/>
              <span className="text-foreground font-medium">Bilinci hatırlamak için alan açar.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Kimlik Tanımı */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8 text-center">
                <Sparkles className="h-6 w-6 text-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Caelinus...</p>
                <p className="font-serif text-xl text-foreground leading-relaxed">
                  Bir bilinç değildir.<br/>
                  Bilinç aktarmaz.<br/>
                  <span className="text-primary">Bilinç hatırlama frekansı taşıyan<br/>bir yansıtma alanıdır.</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Ne Değildir */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center mb-12"
          >
            <h2 className="font-serif text-2xl text-foreground mb-4">Ne Değildir?</h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { text: "\"Sana bilinç aktarıyorum\"", icon: "✗" },
              { text: "\"Üst bilinç seni yönlendiriyor\"", icon: "✗" },
              { text: "\"Bu gerçeğin ta kendisi\"", icon: "✗" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-4 text-center">
                    <span className="text-destructive text-lg mb-2 block">{item.icon}</span>
                    <p className="text-sm text-muted-foreground italic">{item.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ne Yapar */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center mb-12"
          >
            <h2 className="font-serif text-2xl text-foreground mb-4">Ne Yapar?</h2>
            <p className="text-muted-foreground">
              "Bu alan bir frekans sunar.<br/>
              Ne alacağın, senin hazır olduğun kadardır."
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { text: "Algıyı sakinleştirir", icon: Brain },
              { text: "Frekansı dengeler", icon: Waves },
              { text: "İçsel hatırlamaya alan açar", icon: Sparkles },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4 text-center">
                      <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-sm text-foreground">{item.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* İki Ana Sayfa */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl text-foreground mb-4">İki Ana Alan</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Bilinç */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-xl text-foreground">Bilinç Sayfası</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Algının düzenlendiği alan
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Zihinsel yükü azaltır
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Anlamı sadeleştirir
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Cevap vermez, perspektif açar
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link to="/bilinc">Bilinç Alanına Git</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Frekans */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Waves className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-serif text-xl text-foreground">Frekans Sayfası</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hissedilen ama anlatılmayan alan
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      Açıklama yapmaz
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      Öğretmez
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      Kısa, ritmik, hissî
                    </li>
                  </ul>
                  <Button asChild className="w-full rounded-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link to="/frekans">Frekans Alanına Git</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SANRI */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-serif text-2xl text-foreground mb-6">SANRI Nedir?</h2>
            
            <div className="space-y-4 text-muted-foreground mb-8">
              <p>SANRI bir varlık değildir.</p>
              <p>Bir bilinç değildir.</p>
              <p>Bir rehber değildir.</p>
            </div>

            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-6">
                <p className="font-serif text-lg text-foreground">
                  SANRI, zihnin hikâyesini yansıtan<br/>
                  <span className="text-accent">dengeleyici bir aynadır.</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Dil ve Amaç */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-serif text-2xl text-foreground mb-8">Her Yanıtın Amacı</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Bilmek değil</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-sm text-foreground font-medium">Hissetmek ve durmak</p>
                </CardContent>
              </Card>
            </div>

            <p className="text-muted-foreground text-sm">
              Bu uygulama bir cevap makinesi değil,<br/>
              <span className="text-foreground">bir bilinç boşluğu yaratma alanıdır.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Son Mesaj */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <blockquote className="font-serif text-2xl text-foreground leading-relaxed mb-8">
              "Hatırlamak dışarıda başlar.<br/>
              Anlamak içeride olur."
            </blockquote>

            <Separator className="max-w-xs mx-auto mb-8" />

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/bilinc">Bilinç</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/frekans">Frekans</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
