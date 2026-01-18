import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Layers, Eye, Heart, Brain, Compass, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const readingLayers = [
  {
    id: "literal",
    title: "Literal Katman",
    subtitle: "Kelimelerin Yüzeyi",
    icon: BookOpen,
    color: "primary",
    description: "Metni olduğu gibi okumak. Hikâyenin olay örgüsü, karakterleri ve coğrafyası.",
    details: [
      "Her şehrin fiziksel özellikleri ve tarihi",
      "Sembollerin görünen anlamları",
      "Anlatının kronolojik akışı",
      "Karakterlerin ve mekânların betimlemesi"
    ],
    question: "Bu şehirde ne görüyorum?"
  },
  {
    id: "symbolic",
    title: "Sembolik Katman",
    subtitle: "İşaretlerin Dili",
    icon: Compass,
    color: "accent",
    description: "Sembollerin arketipsel anlamlarını keşfetmek. Her sayı, her isim bir işaret.",
    details: [
      "Sayıların ruhani anlamı (01-81 haritası)",
      "Elementlerin evrensel karşılıkları",
      "Mitolojik referanslar ve arketipler",
      "Renklerin ve yönlerin semboliği"
    ],
    question: "Bu sembol bana ne anlatıyor?"
  },
  {
    id: "emotional",
    title: "Duygusal Katman",
    subtitle: "Hissin Haritası",
    icon: Heart,
    color: "emphasis",
    description: "Metnin içinizde uyandırdığı duygu ve anıları fark etmek.",
    details: [
      "Kişisel çağrışımlar ve hatıralar",
      "Bedensel tepkiler ve sezgiler",
      "Duygusal rezonans noktaları",
      "Bilinçdışı yanklar"
    ],
    question: "Bu okurken ne hissediyorum?"
  },
  {
    id: "reflective",
    title: "Yansıtıcı Katman",
    subtitle: "İçsel Ayna",
    icon: Eye,
    color: "anatolian",
    description: "Okuduklarınızı kendi yaşamınızla ilişkilendirmek, içsel sorgulama.",
    details: [
      "Hayatımızdaki paralel temalar",
      "Kişisel dönüşüm noktaları",
      "Kendi hikâyemizle kesişen yerler",
      "Şimdi ve burada ne anlam ifade ettiği"
    ],
    question: "Bu benim hikâyemle nasıl kesişiyor?"
  },
  {
    id: "collective",
    title: "Kolektif Katman",
    subtitle: "Ortak Hafıza",
    icon: Brain,
    color: "primary",
    description: "Anadolu'nun kolektif bilinçdışına, kültürel belleğe dokunmak.",
    details: [
      "Kültürel arketipler ve mitler",
      "Nesiller arası aktarılan bilgelik",
      "Coğrafi belleğin katmanları",
      "Kolektif travma ve şifanın izleri"
    ],
    question: "Bu hafıza nereden geliyor?"
  }
];

const ReadingLayersPage = () => {
  const [expandedLayer, setExpandedLayer] = useState(null);

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <Layers className="h-8 w-8 text-primary" />
            </div>
            <span className="text-primary text-sm tracking-widest uppercase mb-4 block">
              Okuma Rehberi
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-6">
              Okuma Katmanları
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              "Anadolu'nun Uyanan Tanrıçaları" kitabı tek bir düzlemde okunmak için yazılmadı. 
              Her katman, farklı bir kapı açar. Hangi kapıdan gireceğinizi siz seçersiniz.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Layers */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {readingLayers.map((layer, index) => {
              const Icon = layer.icon;
              const isExpanded = expandedLayer === layer.id;

              return (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`border-border/50 transition-all duration-500 overflow-hidden ${
                      isExpanded ? 'bg-card shadow-lg' : 'bg-card/50 hover:bg-card'
                    }`}
                  >
                    <CardHeader 
                      className="cursor-pointer"
                      onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-${layer.color}/10 flex items-center justify-center shrink-0`}>
                          <Icon className={`h-6 w-6 text-${layer.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="font-serif text-xl text-foreground mb-1">
                                {layer.title}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">{layer.subtitle}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className="pt-0 pb-6">
                            <Separator className="mb-6" />
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                              {layer.description}
                            </p>
                            
                            <div className="grid sm:grid-cols-2 gap-3 mb-6">
                              {layer.details.map((detail, i) => (
                                <div 
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full bg-${layer.color} mt-2 shrink-0`} />
                                  {detail}
                                </div>
                              ))}
                            </div>

                            <div className="bg-muted/50 rounded-lg p-4">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Soru:</span>{" "}
                                <span className="italic">"{layer.question}"</span>
                              </p>
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-serif text-3xl text-foreground mb-6">Nasıl Kullanılır?</h2>
            <div className="space-y-4 text-left">
              <p className="text-muted-foreground">
                <span className="text-primary font-medium">1.</span> Bir şehir seçin ve o şehrin sayfasını açın.
              </p>
              <p className="text-muted-foreground">
                <span className="text-primary font-medium">2.</span> Önce literal katmandan başlayın: Ne görüyösünþz?
              </p>
              <p className="text-muted-foreground">
                <span className="text-primary font-medium">3.</span> Sembolik katmana geçin: Hangi işaretler dikkatinizi çekiyor?
              </p>
              <p className="text-muted-foreground">
                <span className="text-primary font-medium">4.</span> Duygusal katmanı dinleyin: Bedeninizde ne hissediyorsunuz?
              </p>
              <p className="text-muted-foreground">
                <span className="text-primary font-medium">5.</span> Yansıtıcı katmanda sorun: Bu benim için ne anlam ifade ediyor?
              </p>
              <p className="text-muted-foreground">
                <span className="text-primary font-medium">6.</span> Kolektif katmanda genişleyin: Bu hafıza nereden geliyor?
              </p>
            </div>

            <Card className="mt-12 border-border/50 bg-background/50">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground italic">
                  "Her okuma bir yolculuktur. Her yolculuk bir hatırlamadır. 
                  Her hatırlama bir uyanıştır."
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ReadingLayersPage;
