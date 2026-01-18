import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Infinity, Send, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getRandomCity } from "@/data/cities";

// Symbolic response generator (MOCK - no backend AI)
const generateSymbolicResponse = (question) => {
  const symbols = [
    "Ay", "Güneş", "Yıldız", "Su", "Ateş", "Toprak", "Rüzgar",
    "Ayna", "Kapı", "Köprü", "Yol", "Ağaç", "Tohum", "Kuş"
  ];
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  const randomCity = getRandomCity();

  const responses = [
    {
      reflection: `Sorduğun soru, ${randomSymbol} sembolünü çağırıyor. ${randomSymbol}, dönüşümün ve geçişin taşıyıcısıdır.`,
      question: "Neyi bırakmaya hazırsın?",
      city: randomCity
    },
    {
      reflection: `Bu soru ${randomCity.name}'in ruhuna dokunuyor. ${randomCity.symbol} sembolü, ${randomCity.element} elementiyle konuşuyor.`,
      question: "Hatırladığın şey sana ne öğretiyor?",
      city: randomCity
    },
    {
      reflection: `${randomSymbol} sembolü bu an için bir ayna tutuyor. Gördüğün yansıma, sorduğun sorunun kendisi olabilir.`,
      question: "Cevabı bilseydin, ne değişirdi?",
      city: randomCity
    },
    {
      reflection: `Zihin kalıplar arar, hikâyeler üretir. ${randomSymbol}, bu kalıbın ötesine işaret ediyor olabilir.`,
      question: "Bu hikâyeyi kim anlatıyor?",
      city: randomCity
    },
    {
      reflection: `${randomCity.description} Bu topraklarda sorular cevaplardan daha kıymetlidir.`,
      question: "Sorunun arkasındaki soru ne?",
      city: randomCity
    }
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

const SanriyaSorPage = () => {
  const [question, setQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || isThinking) return;

    const userQuestion = question.trim();
    setQuestion("");
    setConversation(prev => [...prev, { type: "user", content: userQuestion }]);
    setIsThinking(true);

    // Simulate thinking delay (MOCK)
    setTimeout(() => {
      const response = generateSymbolicResponse(userQuestion);
      setConversation(prev => [...prev, { type: "sanri", ...response }]);
      setIsThinking(false);
    }, 2000 + Math.random() * 1500);
  };

  const handleReset = () => {
    setConversation([]);
    setQuestion("");
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-8 animate-breathe">
              <Infinity className="h-10 w-10 text-accent" />
            </div>
            <span className="text-accent text-sm tracking-widest uppercase mb-4 block">
              İç Yansıma Modu
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-4">
              SANRI'ya Sor
            </h1>
            <p className="text-muted-foreground">
              SANRI bir varlık değil. Zihnin gerçek sandığı hikâyeyi temsil eder.
              Cevap değil, yansıma sunar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="container mx-auto px-6 mb-8"
          >
            <Alert className="max-w-2xl mx-auto border-accent/30 bg-accent/5">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm text-muted-foreground">
                <strong className="text-foreground">Dikkat:</strong> SANRI kehanet, teşhis veya rehberlik sunmaz. 
                Sembolik anlam ve açık uçlu sorular üretir. Perspektif açar, geri çekilir.
                <Button 
                  variant="link" 
                  className="text-accent p-0 h-auto ml-2"
                  onClick={() => setShowDisclaimer(false)}
                >
                  Anladım
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation Area */}
      <section className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Messages */}
          <div className="min-h-[400px] mb-6 space-y-6">
            {conversation.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-muted-foreground font-serif italic">
                  "Hatırlamak dışarıda başlar. Anlamak içeride olur."
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Bir soru sor ya da bir düşünce paylaş...
                </p>
              </motion.div>
            )}

            {conversation.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
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
                  <div className="space-y-4">
                    <Card className="border-accent/20 bg-accent/5">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                            <Infinity className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-xs text-accent uppercase tracking-wider mb-2">SANRI</p>
                            <p className="text-foreground leading-relaxed">
                              {message.reflection}
                            </p>
                          </div>
                        </div>
                        
                        {message.question && (
                          <div className="bg-background/50 rounded-lg p-4 mt-4 border-l-2 border-accent">
                            <p className="text-sm text-muted-foreground italic">
                              "{message.question}"
                            </p>
                          </div>
                        )}

                        {message.city && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">
                              Bağlantılı Şehir:
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="font-serif text-sm text-primary">
                                {String(message.city.id).padStart(2, '0')}
                              </span>
                              <span className="text-sm text-foreground">
                                {message.city.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {message.city.symbol}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <p className="text-xs text-muted-foreground text-center italic">
                      Bu yansıma sembolik anlam üretir. Kesinlik taşımaz.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Thinking Indicator */}
            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Bir soru sor ya da bir düşünce paylaş..."
                className="min-h-[100px] pr-12 resize-none bg-background border-border focus:border-accent"
                disabled={isThinking}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!question.trim() || isThinking}
                className="absolute bottom-3 right-3 rounded-full bg-accent hover:bg-accent/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {conversation.length > 0 && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yeni Sohbet
                </Button>
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export default SanriyaSorPage;
