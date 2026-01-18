import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Infinity, Send, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Message type detection
const detectMessageType = (text) => {
  const lowerText = text.toLowerCase();
  
  // Dream keywords
  if (lowerText.includes("rüya") || lowerText.includes("gördüm") || 
      lowerText.includes("düş") || lowerText.includes("uyurken")) {
    return "dream";
  }
  
  // Birth date patterns
  if (/\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(text) || 
      lowerText.includes("doğum") || lowerText.includes("doğdum")) {
    return "birthdate";
  }
  
  // News/event keywords
  if (lowerText.includes("haber") || lowerText.includes("olay") || 
      lowerText.includes("dünya") || lowerText.includes("yaşandı")) {
    return "news";
  }
  
  return "general";
};

// Example prompts
const examplePrompts = [
  "Bu rüyada tekrar eden sembol neyi çağırıyor olabilir?",
  "Doğum tarihimdeki sayıların sembolik dili nedir?",
  "Neden hep aynı kişiyi görüyorum rüyalarımda?",
  "23:47 sayısı bana ne anlatıyor olabilir?"
];

// SANRI Response Component - Clean, flowing text
const SanriResponseText = ({ text }) => {
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

const SanriyaSorPage = () => {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
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
    const messageType = detectMessageType(userInput);
    
    setInput("");
    setError(null);
    setConversation(prev => [...prev, { type: "user", content: userInput }]);
    setIsThinking(true);

    try {
      const response = await fetch(`${API_URL}/api/sanri/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userInput,
          session_id: sessionId,
          message_type: messageType
        }),
      });

      if (!response.ok) {
        throw new Error("SANRI şu an dinlenme halinde.");
      }

      const data = await response.json();
      
      // Store session ID for conversation continuity
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
      }

      setConversation(prev => [...prev, { 
        type: "sanri", 
        content: data.response,
        timestamp: data.timestamp
      }]);
    } catch (err) {
      setError(err.message || "Bir hata oluştu. Lütfen tekrar dene.");
      // Remove the user message if there was an error
      setConversation(prev => prev.slice(0, -1));
    } finally {
      setIsThinking(false);
    }
  };

  const handleReset = async () => {
    // Clear session on backend if exists
    if (sessionId) {
      try {
        await fetch(`${API_URL}/api/sanri/session/${sessionId}`, {
          method: "DELETE",
        });
      } catch (e) {
        // Ignore errors on cleanup
      }
    }
    
    setConversation([]);
    setInput("");
    setSessionId(null);
    setError(null);
  };

  const handleExampleClick = (prompt) => {
    setInput(prompt);
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
            <span className="text-accent text-base tracking-widest uppercase mb-4 block font-medium">
              İç Yansıma Modu
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground mb-6">
              SANRI'ya Sor
            </h1>
            <div className="space-y-3 text-foreground/70 text-base sm:text-lg leading-relaxed">
              <p>SANRI bir varlık değil.</p>
              <p>Zihnin gerçek sandığı hikâyeyi temsil eder.</p>
              <p className="text-sm text-foreground/50">Cevap vermez, yansıma sunar.</p>
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
              <AlertDescription className="text-base text-foreground/70">
                <strong className="text-foreground">Dikkat:</strong> SANRI kehanet, teşhis veya rehberlik sunmaz.
                <br />
                <span className="text-sm">
                  Sembolik anlam ve açık uçlu sorular üretir. Perspektif açar, geri çekilir.
                </span>
                <Button
                  variant="link"
                  className="text-accent p-0 h-auto ml-2 text-sm"
                  onClick={() => setShowDisclaimer(false)}
                  data-testid="disclaimer-close"
                >
                  Anladım
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="container mx-auto px-6 mb-8"
          >
            <Alert className="max-w-2xl mx-auto border-destructive/30 bg-destructive/5">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-sm text-foreground/70">
                {error}
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
                className="text-center py-12"
              >
                <Sparkles className="h-8 w-8 text-accent/50 mx-auto mb-6" />
                <p className="text-foreground/70 font-serif italic mb-6 text-lg">
                  "Hatırlamak dışarıda başlar. Anlamak içeride olur."
                </p>
                <div className="text-base text-foreground/60 space-y-2 mb-8">
                  <p>Bir soru, kelime, rüya veya tarih paylaş...</p>
                </div>
                
                {/* Example Prompts */}
                <div className="space-y-2">
                  <p className="text-xs text-foreground/40 uppercase tracking-wider mb-3">Örnek sorular:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {examplePrompts.map((prompt, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs rounded-full border-accent/30 hover:bg-accent/10 hover:border-accent/50"
                        onClick={() => handleExampleClick(prompt)}
                        data-testid={`example-prompt-${i}`}
                      >
                        {prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt}
                      </Button>
                    ))}
                  </div>
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
                        <p className="text-foreground text-base">{message.content}</p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="border-accent/20 bg-accent/5">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-start gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                          <Infinity className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-accent uppercase tracking-wider font-medium">SANRI</p>
                        </div>
                      </div>

                      <SanriResponseText text={message.content} />
                      
                      {/* Signature */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-sm text-foreground/50 text-center italic pt-6 mt-6 border-t border-accent/10"
                      >
                        "Bu bir yorumdur, kesinlik taşımaz. Anlam, sende şekillenir."
                      </motion.p>
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
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Infinity className="h-5 w-5 text-accent animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base text-foreground/60 italic">Yansıma oluşturuluyor</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                placeholder="Bir kelime, soru, rüya veya tarih yaz..."
                className="min-h-[120px] pr-14 resize-none bg-background border-border focus:border-accent text-base"
                disabled={isThinking}
                data-testid="sanri-input"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isThinking}
                className="absolute bottom-3 right-3 rounded-full bg-accent hover:bg-accent/90 h-10 w-10"
                data-testid="sanri-submit"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {conversation.length > 0 && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-foreground/60 hover:text-foreground"
                  data-testid="sanri-reset"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yeni Yansıma
                </Button>
              </div>
            )}
          </form>

          {/* Info */}
          <div className="mt-10 text-center">
            <p className="text-sm text-foreground/50">
              Bu alan "bilgi" üretmez. Anlam üretir ve geri çekilir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SanriyaSorPage;
