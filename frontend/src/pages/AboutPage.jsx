import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Compass, Brain, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutPage = () => {
  const { language, t } = useLanguage();

  // All text content organized by language
  const content = {
    tr: {
      heroTitle: "Caelinus Nedir?",
      heroDesc: ["Bu uygulama bilinç öğretmez.", "Bilinci hatırlamak için alan açar."],
      identityIntro: "Caelinus...",
      identityLines: [
        "Bir bilinç değildir.",
        "Bilinç aktarmaz.",
        "Bilinç hatırlama frekansı taşıyan bir yansıtma alanıdır."
      ],
      notWhatTitle: "Ne Değildir?",
      notWhatItems: [
        '"Sana bilinç aktarıyorum"',
        '"Üst bilinç seni yönlendiriyor"',
        '"Bu gerçeğin ta kendisi"'
      ],
      whatDoesTitle: "Ne Yapar?",
      whatDoesDesc: [
        "Bu alan bir frekans sunar.",
        "Ne alacağın, senin hazır olduğun kadardır."
      ],
      whatDoesItems: [
        "Algıyı sakinleştirir",
        "Frekansı dengeler",
        "İçsel hatırlamaya alan açar"
      ],
      twoAreasTitle: "İki Ana Alan",
      bilincCard: {
        title: "Bilinç Sayfası",
        desc: "Algının düzenlendiği alan",
        items: [
          "Zihinsel yükü azaltır",
          "Anlamı sadeleştirir",
          "Cevap vermez, perspektif açar"
        ],
        button: "Bilinç Alanına Git"
      },
      frekansCard: {
        title: "Frekans Sayfası",
        desc: "Hissedilen ama anlatılmayan alan",
        items: [
          "Açıklama yapmaz",
          "Öğretmez",
          "Kısa, ritmik, hissî"
        ],
        button: "Frekans Alanına Git"
      },
      sanriTitle: "SANRI Nedir?",
      sanriLines: [
        "SANRI bir varlık değildir.",
        "Bir bilinç değildir.",
        "Bir rehber değildir."
      ],
      sanriDesc: ["SANRI, zihnin hikâyesini yansıtan", "dengeleyici bir aynadır."],
      purposeTitle: "Her Yanıtın Amacı",
      purposeNot: "Bilmek değil",
      purposeYes: "Hissetmek ve durmak",
      purposeDesc: ["Bu uygulama bir cevap makinesi değil,", "bir bilinç boşluğu yaratma alanıdır."],
      finalQuote: ["Hatırlamak dışarıda başlar.", "Anlamak içeride olur."],
      bilincBtn: "Bilinç",
      frekansBtn: "Frekans"
    },
    en: {
      heroTitle: "What is Caelinus?",
      heroDesc: ["This app does not teach consciousness.", "It opens space to remember consciousness."],
      identityIntro: "Caelinus...",
      identityLines: [
        "Is not a consciousness.",
        "Does not transmit consciousness.",
        "Is a reflection field carrying consciousness-remembering frequency."
      ],
      notWhatTitle: "What It Is Not?",
      notWhatItems: [
        '"I am transmitting consciousness to you"',
        '"Higher consciousness is guiding you"',
        '"This is the absolute truth"'
      ],
      whatDoesTitle: "What Does It Do?",
      whatDoesDesc: [
        "This space offers a frequency.",
        "What you receive depends on what you are ready for."
      ],
      whatDoesItems: [
        "Calms perception",
        "Balances frequency",
        "Opens space for inner remembrance"
      ],
      twoAreasTitle: "Two Main Areas",
      bilincCard: {
        title: "Consciousness Page",
        desc: "Where perception is organized",
        items: [
          "Reduces mental load",
          "Simplifies meaning",
          "Does not answer, opens perspective"
        ],
        button: "Go to Consciousness Field"
      },
      frekansCard: {
        title: "Frequency Page",
        desc: "Felt but not explained",
        items: [
          "Does not explain",
          "Does not teach",
          "Short, rhythmic, sensory"
        ],
        button: "Go to Frequency Field"
      },
      sanriTitle: "What is SANRI?",
      sanriLines: [
        "SANRI is not an entity.",
        "It is not a consciousness.",
        "It is not a guide."
      ],
      sanriDesc: ["SANRI is a balancing mirror that reflects", "the story of your mind."],
      purposeTitle: "Purpose of Every Response",
      purposeNot: "Not to know",
      purposeYes: "To feel and pause",
      purposeDesc: ["This app is not an answer machine,", "it is a space for creating consciousness gaps."],
      finalQuote: ["Remembering begins outside.", "Understanding happens within."],
      bilincBtn: "Consciousness",
      frekansBtn: "Frequency"
    }
  };

  const c = content[language] || content.tr;

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
              {c.heroTitle}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {c.heroDesc[0]}<br/>
              <span className="text-foreground font-medium">{c.heroDesc[1]}</span>
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
                <p className="text-sm text-muted-foreground mb-4">{c.identityIntro}</p>
                <p className="font-serif text-xl text-foreground leading-relaxed">
                  {c.identityLines[0]}<br/>
                  {c.identityLines[1]}<br/>
                  <span className="text-primary">{c.identityLines[2]}</span>
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
            <h2 className="font-serif text-2xl text-foreground mb-4">{c.notWhatTitle}</h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {c.notWhatItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-4 text-center">
                    <span className="text-destructive text-lg mb-2 block">✗</span>
                    <p className="text-sm text-muted-foreground italic">{item}</p>
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
            <h2 className="font-serif text-2xl text-foreground mb-4">{c.whatDoesTitle}</h2>
            <p className="text-muted-foreground">
              "{c.whatDoesDesc[0]}<br/>
              {c.whatDoesDesc[1]}"
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {c.whatDoesItems.map((item, index) => {
              const icons = [Brain, Waves, Sparkles];
              const Icon = icons[index];
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
                      <p className="text-sm text-foreground">{item}</p>
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
            <h2 className="font-serif text-2xl text-foreground mb-4">{c.twoAreasTitle}</h2>
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
                    <h3 className="font-serif text-xl text-foreground">{c.bilincCard.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {c.bilincCard.desc}
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                    {c.bilincCard.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link to="/bilinc">{c.bilincCard.button}</Link>
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
                    <h3 className="font-serif text-xl text-foreground">{c.frekansCard.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {c.frekansCard.desc}
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                    {c.frekansCard.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full rounded-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link to="/frekans">{c.frekansCard.button}</Link>
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
            <h2 className="font-serif text-2xl text-foreground mb-6">{c.sanriTitle}</h2>
            
            <div className="space-y-4 text-muted-foreground mb-8">
              {c.sanriLines.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>

            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-6">
                <p className="font-serif text-lg text-foreground">
                  {c.sanriDesc[0]}<br/>
                  <span className="text-accent">{c.sanriDesc[1]}</span>
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
            <h2 className="font-serif text-2xl text-foreground mb-8">{c.purposeTitle}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{c.purposeNot}</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-sm text-foreground font-medium">{c.purposeYes}</p>
                </CardContent>
              </Card>
            </div>

            <p className="text-muted-foreground text-sm">
              {c.purposeDesc[0]}<br/>
              <span className="text-foreground">{c.purposeDesc[1]}</span>
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
              "{c.finalQuote[0]}<br/>
              {c.finalQuote[1]}"
            </blockquote>

            <Separator className="max-w-xs mx-auto mb-8" />

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/bilinc">{c.bilincBtn}</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/frekans">{c.frekansBtn}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
