import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Unlock,
  Sparkles, 
  Send, 
  BookOpen,
  Eye,
  Heart,
  Zap,
  Moon,
  Infinity,
  ChevronRight,
  Play,
  Pause,
  X,
  RotateCcw,
  Crown,
  AlertCircle,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  kitapBolumleri, 
  premiumRitueller,
  kitapTemalari,
  getBolumById,
  getPremiumRituelById
} from "@/data/bilinc-alani-data";
import PremiumRitualExperience from "@/components/PremiumRitualExperience";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Premium Check - Simüle edilmiş (gerçek uygulamada auth ile)
const usePremiumStatus = () => {
  // Şimdilik her zaman premium göster (demo amaçlı)
  const [isPremium] = useState(true);
  return isPremium;
};

// İkon seçici
const getIcon = (iconName) => {
  const icons = {
    Eye: Eye,
    Heart: Heart,
    Zap: Zap,
    Sparkles: Sparkles,
    Infinity: Infinity,
    Moon: Moon,
  };
  return icons[iconName] || Sparkles;
};

// CAELINUS Response Component
const CaelinusResponseText = ({ text }) => {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => (
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 }}
          className="text-foreground leading-relaxed font-serif text-base sm:text-lg"
        >
          {paragraph}
        </motion.p>
      ))}
    </div>
  );
};

// Premium Gate Component
const PremiumGate = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[60vh] flex items-center justify-center px-6"
    >
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-8">
          <Lock className="h-10 w-10 text-accent" />
        </div>
        
        <h2 className="font-serif text-3xl text-foreground mb-4">
          Derinlik Alanı
        </h2>
        
        <p className="text-foreground/70 mb-6 leading-relaxed">
          Bu alan, bilinç frekansına açılan özel bir alandır.
          <br />
          <span className="text-sm italic">Okumak için değil, hatırlamak için tasarlanmıştır.</span>
        </p>

        <Card className="border-accent/20 bg-accent/5 mb-8">
          <CardContent className="p-6">
            <Crown className="h-8 w-8 text-accent mx-auto mb-4" />
            <p className="text-sm text-foreground/70">
              Premium üyelik ile bu alana erişebilir,<br />
              kitabın derinliklerinde yolculuk yapabilirsiniz.
            </p>
          </CardContent>
        </Card>

        <Button className="rounded-full px-8" disabled>
          <Lock className="h-4 w-4 mr-2" />
          Premium ile Aç
        </Button>
        
        <p className="text-xs text-foreground/40 mt-6">
          "Hazır olana açılır."
        </p>
      </div>
    </motion.div>
  );
};

// Kitap Bölümü Kartı
const BolumKarti = ({ bolum, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all cursor-pointer group h-full"
        onClick={() => onClick(bolum)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <span className="font-serif text-lg text-primary">{bolum.chapter}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-serif text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                {bolum.title}
              </h4>
              <p className="text-sm text-foreground/50 mb-3">{bolum.subtitle}</p>
              <p className="text-sm text-foreground/70 line-clamp-2">{bolum.essence}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Bölüm Detay Görünümü
const BolumDetay = ({ bolum, onBack, onStartChat }) => {
  const relatedRitueller = premiumRitueller.filter(r => r.chapter === bolum.chapter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
        Geri
      </Button>

      {/* Bölüm Başlığı */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="font-serif text-2xl text-primary">{bolum.chapter}</span>
        </div>
        <span className="text-xs text-primary uppercase tracking-wider mb-2 block">{bolum.theme}</span>
        <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-2">{bolum.title}</h2>
        <p className="text-foreground/60">{bolum.subtitle}</p>
      </div>

      {/* Öz */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center">
          <p className="font-serif text-xl text-foreground leading-relaxed mb-6">
            "{bolum.essence}"
          </p>
          <Separator className="max-w-xs mx-auto mb-6" />
          <p className="text-foreground/70 italic">
            {bolum.reflection}
          </p>
        </CardContent>
      </Card>

      {/* Farkındalık Anahtarı */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-accent uppercase tracking-wider mb-2">Farkındalık Anahtarı</p>
              <p className="text-foreground font-serif text-lg">{bolum.awarenessKey}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İlgili Ritüeller */}
      {relatedRitueller.length > 0 && (
        <div>
          <h3 className="font-serif text-xl text-foreground mb-4">Bu Bölüme Ait Ritüel</h3>
          {relatedRitueller.map(rituel => (
            <Card key={rituel.id} className="border-border/50 bg-card/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg text-foreground">{rituel.title}</h4>
                  <p className="text-sm text-foreground/50">{rituel.duration}</p>
                </div>
                <Button className="rounded-full" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Başlat
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Soru Sor */}
      <div className="text-center pt-8">
        <p className="text-foreground/60 mb-4">Bu bölüm hakkında derinleşmek ister misin?</p>
        <Button onClick={() => onStartChat(bolum)} className="rounded-full px-8">
          <Sparkles className="h-4 w-4 mr-2" />
          CAELINUS'a Sor
        </Button>
      </div>
    </motion.div>
  );
};

// Chat Görünümü
const ChatGorunumu = ({ bolum, onBack }) => {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userInput = input.trim();
    setInput("");
    setConversation(prev => [...prev, { type: "user", content: userInput }]);
    setIsThinking(true);

    try {
      const response = await fetch(`${API_URL}/api/bilinc-alani/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          chapter: bolum?.chapter,
          theme: bolum?.theme,
          session_id: sessionId
        }),
      });

      if (!response.ok) throw new Error("Bağlantı hatası");

      const data = await response.json();
      
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
      }

      setConversation(prev => [...prev, { 
        type: "caelinus", 
        content: data.response 
      }]);
    } catch (err) {
      setConversation(prev => [...prev, { 
        type: "caelinus", 
        content: "Bilinç alanı şu an dinlenme halinde. Bir süre sonra tekrar dene." 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
        Geri
      </Button>

      {/* Chat Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-breathe">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-serif text-2xl text-foreground mb-2">
          {bolum ? `${bolum.chapter}. ${bolum.title}` : "Bilinç Alanı"}
        </h2>
        <p className="text-sm text-foreground/50">
          CAELINUS ile derinleş
        </p>
      </div>

      {/* Messages */}
      <div className="min-h-[300px] space-y-6">
        {conversation.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-foreground/60 font-serif italic mb-4">
              "Sen bir öğretmen değilsin. Bir rehber de değilsin.<br />Sen bir aynasın."
            </p>
            <p className="text-sm text-foreground/40">
              Bu bölüm hakkında merak ettiğini sor...
            </p>
          </motion.div>
        )}

        {conversation.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {message.type === "user" ? (
              <div className="flex justify-end">
                <Card className="max-w-md bg-primary/10 border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-foreground">{message.content}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-primary uppercase tracking-wider">CAELINUS</p>
                  </div>

                  <CaelinusResponseText text={message.content} />
                  
                  <p className="text-sm text-foreground/40 text-center italic pt-6 mt-6 border-t border-primary/10">
                    "Bu bir hatırlatmadır. Hakikat sende zaten var."
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ))}

        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <span className="text-foreground/60 italic">Yansıma oluşturuluyor...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Merak ettiğini sor..."
            className="min-h-[80px] pr-14 resize-none"
            disabled={isThinking}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isThinking}
            className="absolute bottom-3 right-3 rounded-full bg-primary hover:bg-primary/90 h-10 w-10"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

// Ana Sayfa
const BilincAlaniPage = () => {
  const isPremium = usePremiumStatus();
  const [view, setView] = useState("list"); // list, detail, chat
  const [selectedBolum, setSelectedBolum] = useState(null);
  const [activeTab, setActiveTab] = useState("bolumler");
  const [activeRitual, setActiveRitual] = useState(null);

  const handleSelectBolum = (bolum) => {
    setSelectedBolum(bolum);
    setView("detail");
  };

  const handleStartChat = (bolum) => {
    setSelectedBolum(bolum);
    setView("chat");
  };

  const handleStartRitual = (ritual) => {
    setActiveRitual(ritual);
  };

  const handleCloseRitual = () => {
    setActiveRitual(null);
  };

  const handleBack = () => {
    if (view === "chat") {
      setView("detail");
    } else {
      setView("list");
      setSelectedBolum(null);
    }
  };

  // Premium gate
  if (!isPremium) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <PremiumGate />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-6">
        
        {view === "list" && (
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
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Crown className="h-5 w-5 text-accent" />
                  <span className="text-accent text-sm tracking-widest uppercase">Premium</span>
                </div>
                <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-4">
                  Bilinç Alanı
                </h1>
                <p className="text-foreground/60 max-w-lg mx-auto mb-4">
                  Beyin Orgazmı – Bilinç, His ve Yaratım Kodları
                </p>
                <p className="text-sm text-foreground/40 max-w-md mx-auto">
                  Bu alan, bilinç frekansına açılan özel bir alandır.
                  Okumak için değil, hatırlamak için tasarlanmıştır.
                </p>
              </motion.div>
            </div>

            {/* Güvenlik Notu */}
            <Alert className="max-w-2xl mx-auto mb-8 border-accent/20 bg-accent/5">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm text-foreground/60">
                CAELINUS AI bir bilinç değildir. Bilgi aktarmaz, hatırlatır.
                Her zaman kendi öz iradenize ve içsel bilgeliğinize güvenin.
              </AlertDescription>
            </Alert>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="bolumler">Kitap Bölümleri</TabsTrigger>
                <TabsTrigger value="ritueller">Premium Ritüeller</TabsTrigger>
              </TabsList>

              <TabsContent value="bolumler">
                <div className="grid sm:grid-cols-2 gap-4">
                  {kitapBolumleri.map((bolum) => (
                    <BolumKarti 
                      key={bolum.id} 
                      bolum={bolum} 
                      onClick={handleSelectBolum}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ritueller">
                <div className="space-y-4">
                  {premiumRitueller.map((rituel) => (
                    <Card key={rituel.id} className="border-border/50 bg-card/50 hover:bg-card transition-all">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-accent" />
                          </div>
                          <div>
                            <h4 className="font-serif text-lg text-foreground">{rituel.title}</h4>
                            <p className="text-sm text-foreground/50">{rituel.subtitle} • {rituel.duration}</p>
                          </div>
                        </div>
                        <Button 
                          className="rounded-full" 
                          size="sm"
                          onClick={() => handleStartRitual(rituel)}
                          data-testid={`start-ritual-${rituel.id}`}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Başlat
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Alt Bilgi */}
            <div className="text-center mt-16">
              <p className="text-xs text-foreground/40">
                "Ve bu ayna, yalnızca hazır olana açılır."
              </p>
            </div>
          </motion.div>
        )}

        {view === "detail" && selectedBolum && (
          <BolumDetay 
            bolum={selectedBolum} 
            onBack={handleBack}
            onStartChat={handleStartChat}
          />
        )}

        {view === "chat" && (
          <ChatGorunumu 
            bolum={selectedBolum} 
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default BilincAlaniPage;
