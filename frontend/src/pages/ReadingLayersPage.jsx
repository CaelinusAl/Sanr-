import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Layers, 
  Eye, 
  Heart, 
  Brain, 
  Compass,
  Send,
  Infinity,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { generateLayerResponse } from "@/data/layer-responses";

// Katman konfigürasyonları
const layerConfig = [
  {
    id: "literal",
    title: "Literal Katman",
    subtitle: "Kelimelerin Yüzeyi",
    icon: BookOpen,
    color: "primary",
    description: "Metni olduğu gibi görme alanı. Henüz yorum yok, sadece gözlem.",
    question: "Bu katmanda ne görüyorsun?\nBir kelime, bir yer, bir detay…",
    sanriTone: "Sade, anlatısız, sakinleştirici",
  },
  {
    id: "symbolic",
    title: "Sembolik Katman",
    subtitle: "İşaretlerin Dili",
    icon: Compass,
    color: "accent",
    description: "Sembollerin arketipsel anlamlarını keşfetme alanı. Her şekil bir mesaj taşıyabilir.",
    question: "Bu metinde / şehirde sana hangi sembol sesleniyor?\nBir şekil, bir sayı, bir nesne…",
    sanriTone: "Tek sembol, zorlamasız, 'olabilir' dili",
  },
  {
    id: "emotional",
    title: "Duygusal Katman",
    subtitle: "Hissin Haritası",
    icon: Heart,
    color: "emphasis",
    description: "Metnin içinde uyandırdığı duyguları fark etme alanı. Bedenin bilgeliği.",
    question: "Bunu okurken bedeninde ne oluyor?\nSıkışma, ferahlık, merak, ağırlık?",
    sanriTone: "Bedene odaklı, güvenli, teşhis yok",
  },
  {
    id: "reflective",
    title: "Yansıtıcı Katman",
    subtitle: "İçsel Ayna",
    icon: Eye,
    color: "anatolian",
    description: "Okuduklarını kendi yaşamınla ilişkilendirme alanı. Sen ve metin arasındaki köprü.",
    question: "Bu hikâye senin hayatında nereye değiyor?",
    sanriTone: "Soru bırakır, geri çekilir",
  },
  {
    id: "collective",
    title: "Kolektif Katman",
    subtitle: "Ortak Hafıza",
    icon: Brain,
    color: "primary",
    description: "Anadolu'nun kolektif bilinçdışına, kültürel belleğe dokunma alanı.",
    question: "Bu hafıza nereden geliyor?\nSenden mi, yoksa senden önce var olandan mı?",
    sanriTone: "Kök, miras, nesiller arası",
  },
];

// Tek Katman Komponenti
const LayerSection = ({ layer, index }) => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const Icon = layer.icon;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || isThinking) return;

    setIsThinking(true);

    // Simulate SANRI thinking
    setTimeout(() => {
      const sanriResponse = generateLayerResponse(layer.id, userInput);
      setResponse(sanriResponse);
      setIsThinking(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleReset = () => {
    setUserInput("");
    setResponse(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`border-border/50 overflow-hidden transition-all duration-500 ${
        isExpanded ? 'bg-card shadow-lg' : 'bg-card/50 hover:bg-card'
      }`}>
        {/* Header - Tıklanabilir */}
        <div 
          className="p-6 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${layer.color}/10 flex items-center justify-center shrink-0`}>
              <Icon className={`h-6 w-6 text-${layer.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl text-foreground mb-1">
                    {layer.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{layer.subtitle}</p>
                </div>
                <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                  isExpanded ? 'rotate-90' : ''
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0 pb-6 px-6">
                <Separator className="mb-6" />

                {/* Açıklama */}
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  {layer.description}
                </p>

                {/* Soru Alanı */}
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-foreground font-medium mb-1">Soru:</p>
                  <p className="text-muted-foreground text-sm whitespace-pre-line italic">
                    "{layer.question}"
                  </p>
                </div>

                {/* Kullanıcı Input */}
                {!response ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Cevabını buraya yaz..."
                      className="min-h-[80px] resize-none bg-background border-border focus:border-primary"
                      disabled={isThinking}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        SANRI tonu: <span className="italic">{layer.sanriTone}</span>
                      </p>
                      <Button
                        type="submit"
                        disabled={!userInput.trim() || isThinking}
                        size="sm"
                        className="rounded-full"
                      >
                        {isThinking ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                            Dinleniyor...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Gönder
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* SANRI Yanıtı */
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Kullanıcının yazdığı */}
                    <div className="bg-primary/5 rounded-lg p-4 border-l-2 border-primary/30">
                      <p className="text-xs text-primary uppercase tracking-wider mb-1">Sen</p>
                      <p className="text-foreground text-sm">{userInput}</p>
                    </div>

                    {/* SANRI yanıtı */}
                    <div className="bg-accent/5 rounded-lg p-4 border-l-2 border-accent">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                          <Infinity className="h-3 w-3 text-accent" />
                        </div>
                        <p className="text-xs text-accent uppercase tracking-wider">SANRI</p>
                      </div>

                      {/* Sembol (sadece sembolik katmanda) */}
                      {response.symbol && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Beliren sembol: <span className="text-accent font-medium">{response.symbol}</span>
                        </p>
                      )}

                      {/* Ana yanıt */}
                      <p className="text-foreground leading-relaxed mb-3">
                        {response.response}
                      </p>

                      {/* Soru (yansıtıcı ve kolektif katmanda) */}
                      {response.question && (
                        <p className="text-foreground font-medium italic">
                          {response.question}
                        </p>
                      )}
                    </div>

                    {/* Durma Anı */}
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" />
                        <p className="text-sm text-muted-foreground italic">
                          {response.pause}
                        </p>
                      </div>
                    </div>

                    {/* Yeniden Başla */}
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-muted-foreground"
                      >
                        Tekrar dene
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

const ReadingLayersPage = () => {
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
              Etkileşimli Okuma Deneyimi
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-6">
              Okuma Katmanları
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-4">
              "Anadolu'nun Uyanan Tanrıçaları" kitabı tek bir düzlemde okunmak için yazılmadı. 
              Her katman, farklı bir kapı açar.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Her katmanda sana bir soru sorulacak. SANRI dinleyecek ve yansıtacak.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Katmanlar */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {layerConfig.map((layer, index) => (
              <LayerSection key={layer.id} layer={layer} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Alt Bilgi */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Card className="border-border/50 bg-muted/30">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  <strong className="text-foreground">Nasıl kullanılır?</strong>
                </p>
                <ol className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">1.</span>
                    <span>Bir şehir veya metin seçin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">2.</span>
                    <span>Literal katmandan başlayın — ne görüyorsunuz?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">3.</span>
                    <span>Her katmanda SANRI'nın sorusuna cevap verin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">4.</span>
                    <span>Durma anlarında nefes alın</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">5.</span>
                    <span>Kolektif katmana ulaştığınızda, tamamlandınız</span>
                  </li>
                </ol>
                <Separator className="my-6" />
                <p className="text-xs text-muted-foreground italic">
                  "Her okuma bir yolculuktur. Her yolculuk bir hatırlamadır. Her hatırlama bir uyanıştır."
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
