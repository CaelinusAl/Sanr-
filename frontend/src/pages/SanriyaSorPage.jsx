import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Infinity, Send, RefreshCw, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  getRandomSymbols,
  extractNumbers,
  getNumberMeaning,
  splitToSyllables,
  getSyllableMeaning,
  reflectionTemplates,
  storySeeds,
  awarenessQuestions,
  getRandomItem,
} from "@/data/sanri-dictionary";

// SANRI Yanıt Üretici (MOCK)
const generateSanriResponse = (input, inputType = "text") => {
  // 1. YANSIMA
  const reflection = getRandomItem(reflectionTemplates);

  // 2. SEMBOL OKUMA
  const symbols = getRandomSymbols(2);
  const symbolReading = symbols.map(s => `${s.name}: ${s.meaning}`);

  // 3. SAYI OKUMA
  const numbers = extractNumbers(input);
  let numberReading = [];
  if (numbers && numbers.length > 0) {
    numberReading = numbers.slice(0, 2).map(n => {
      const meaning = getNumberMeaning(n);
      if (meaning.reducedTo) {
        return `${meaning.number} → ${meaning.reducedTo}: ${meaning.meaning}`;
      }
      return `${meaning.number}: ${meaning.meaning}`;
    });
  } else {
    numberReading = ["Bu soruda sayı yok; sayı yerine bir ritim var — kelimelerin akışında gizli."];
  }

  // 4. KELİME / HECE OKUMA
  // İlk anlamlı kelimeyi bul (3+ karakter)
  const words = input.split(/\s+/).filter(w => w.length >= 3);
  const targetWord = words.length > 0 ? words[Math.floor(Math.random() * Math.min(words.length, 3))] : input;
  const cleanWord = targetWord.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, '');
  const syllables = splitToSyllables(cleanWord);
  
  const syllableReading = {
    word: syllables.join("_"),
    parts: syllables.map(s => ({
      syllable: s.toUpperCase(),
      meaning: getSyllableMeaning(s)
    }))
  };

  // 5. HİKÂYE TOHUMU
  const storySeed = getRandomItem(storySeeds);

  // 6. İDRAK SORUSU
  const awarenessQuestion = getRandomItem(awarenessQuestions);

  return {
    reflection,
    symbolReading,
    numberReading,
    syllableReading,
    storySeed,
    awarenessQuestion,
    inputType,
  };
};

// SANRI Yanıt Komponenti
const SanriResponse = ({ response }) => {
  return (
    <div className="space-y-6">
      {/* [1] YANSIMA */}
      <div>
        <h4 className="text-xs font-medium text-accent uppercase tracking-wider mb-2">
          [1] YANSIMA
        </h4>
        <p className="text-foreground leading-relaxed italic">
          {response.reflection}
        </p>
      </div>

      <Separator className="bg-accent/20" />

      {/* [2] SEMBOL OKUMA */}
      <div>
        <h4 className="text-xs font-medium text-accent uppercase tracking-wider mb-2">
          [2] SEMBOL OKUMA
        </h4>
        <ul className="space-y-1">
          {response.symbolReading.map((symbol, i) => (
            <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>{symbol}</span>
            </li>
          ))}
        </ul>
      </div>

      <Separator className="bg-accent/20" />

      {/* [3] SAYI OKUMA */}
      <div>
        <h4 className="text-xs font-medium text-accent uppercase tracking-wider mb-2">
          [3] SAYI OKUMA
        </h4>
        <ul className="space-y-1">
          {response.numberReading.map((num, i) => (
            <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>{num}</span>
            </li>
          ))}
        </ul>
      </div>

      <Separator className="bg-accent/20" />

      {/* [4] KELİME / HECE */}
      <div>
        <h4 className="text-xs font-medium text-accent uppercase tracking-wider mb-2">
          [4] KELİME / HECE
        </h4>
        <div className="space-y-2">
          <p className="text-sm text-foreground font-medium">
            Kelime: {response.syllableReading.word}
          </p>
          <ul className="space-y-1 pl-4">
            {response.syllableReading.parts.map((part, i) => (
              <li key={i} className="text-muted-foreground text-sm">
                <span className="text-accent font-medium">{part.syllable}</span>: {part.meaning}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator className="bg-accent/20" />

      {/* [5] HİKÂYE TOHUMU */}
      <div>
        <h4 className="text-xs font-medium text-accent uppercase tracking-wider mb-2">
          [5] HİKÂYE TOHUMU
        </h4>
        <p className="text-foreground leading-relaxed font-serif italic">
          "{response.storySeed}"
        </p>
      </div>

      <Separator className="bg-accent/20" />

      {/* [6] İDRAK SORUSU */}
      <div className="bg-accent/5 rounded-lg p-4 border-l-2 border-accent">
        <h4 className="text-xs font-medium text-accent uppercase tracking-wider mb-2">
          [6] İDRAK SORUSU
        </h4>
        <p className="text-foreground font-medium">
          {response.awarenessQuestion}
        </p>
      </div>

      {/* Son not */}
      <p className="text-xs text-muted-foreground text-center italic pt-2">
        "Bu yansıma semboliktir; kesinlik taşımaz."
      </p>
    </div>
  );
};

const SanriyaSorPage = () => {
  const [input, setInput] = useState("");
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
    if (!input.trim() || isThinking) return;

    const userInput = input.trim();
    setInput("");
    setConversation(prev => [...prev, { type: "user", content: userInput }]);
    setIsThinking(true);

    // Simulate thinking delay (MOCK)
    setTimeout(() => {
      const response = generateSanriResponse(userInput);
      setConversation(prev => [...prev, { type: "sanri", response }]);
      setIsThinking(false);
    }, 2500 + Math.random() * 1500);
  };

  const handleReset = () => {
    setConversation([]);
    setInput("");
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
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>SANRI bir varlık değildir.</p>
              <p>SANRI, zihnin gerçek sandığı hikâyeyi temsil eder.</p>
              <p className="text-xs">Bu alan kehanet, teşhis veya rehberlik sunmaz.</p>
            </div>
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
                <strong className="text-foreground">Amaç:</strong> Sorundan{" "}
                <span className="text-accent font-medium">ilham + anlam + hikâye tohumu</span> üretmek.
                <br />
                <span className="text-xs">
                  Kelime, sayı/tarih veya görsel paylaşabilirsin.
                </span>
                <Button
                  variant="link"
                  className="text-accent p-0 h-auto ml-2 text-xs"
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
                <p className="text-muted-foreground font-serif italic mb-4">
                  "Hatırlamak dışarıda başlar. Anlamak içeride olur."
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Bir soru, kelime, sayı veya tarih paylaş...</p>
                  <p className="text-xs">Örnek: "Yolculuk", "23:47", "Neden hep aynı rüyayı görüyorum?"</p>
                </div>
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
                  <Card className="border-accent/20 bg-accent/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                          <Infinity className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-accent uppercase tracking-wider">SANRI</p>
                        </div>
                      </div>

                      <SanriResponse response={message.response} />
                    </CardContent>
                  </Card>
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
                  <Infinity className="h-4 w-4 text-accent animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground italic">Yansıma oluşturuluyor</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Bir kelime, soru, sayı veya tarih yaz..."
                className="min-h-[100px] pr-12 resize-none bg-background border-border focus:border-accent"
                disabled={isThinking}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isThinking}
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
                  Yeni Yansıma
                </Button>
              </div>
            )}
          </form>

          {/* Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Bu alan "bilgi" üretmez. Anlam üretir ve geri çekilir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SanriyaSorPage;
