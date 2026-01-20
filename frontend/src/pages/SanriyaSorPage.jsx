import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Infinity, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  Image as ImageIcon,
  X,
  Moon,
  Eye,
  Sun,
  Cloud,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// SANRI 5 Bilinç Modu - Object yapısı
const readingModes = {
  DREAM: {
    id: "dream",
    label: "Rüya",
    icon: Moon,
    emoji: "🌙",
    description: "Meditasyon & Ritüel",
    color: "from-indigo-500/20 to-purple-500/20",
    borderColor: "border-indigo-500/30"
  },
  MIRROR: {
    id: "mirror",
    label: "Ayna",
    icon: Eye,
    emoji: "🪞",
    description: "Duygusal Ayna",
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30"
  },
  DIVINE: {
    id: "divine",
    label: "İlahi",
    icon: Sun,
    emoji: "✨",
    description: "Kadim Bilgelik",
    color: "from-amber-500/20 to-yellow-500/20",
    borderColor: "border-amber-500/30"
  },
  SHADOW: {
    id: "shadow",
    label: "Gölge",
    icon: Cloud,
    emoji: "🌑",
    description: "Rüya & Gölge Analizi",
    color: "from-violet-500/20 to-fuchsia-500/20",
    borderColor: "border-violet-500/30"
  },
  LIGHT: {
    id: "light",
    label: "Işık",
    icon: Heart,
    emoji: "🌿",
    description: "Duygusal Denge",
    color: "from-emerald-500/20 to-green-500/20",
    borderColor: "border-emerald-500/30"
  }
};

// Array versiyonu (UI render için)
const modesList = Object.values(readingModes);

// Örnek sorular (mod bazlı)
const examplePrompts = {
  dream: "Beni sakinleştir, bir meditasyon yap.",
  mirror: "Neden hep aynı döngüde sıkışıp kalıyorum?",
  divine: "Bugün için bana bir mesaj ver.",
  shadow: "Rüyamda siyah bir kedi gördüm, ne anlama geliyor?",
  light: "Çok kaygılıyım, kendimi güvende hissetmiyorum.",
};

// SANRI Response Component
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

// Image Preview Component
const ImagePreview = ({ image, onRemove }) => {
  if (!image) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative inline-block"
    >
      <img 
        src={image.preview} 
        alt="Yüklenen görsel" 
        className="max-h-40 rounded-lg border border-border/50 object-cover"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </motion.div>
  );
};

// SANRI - Consciousness Mirror (SANRI cevap üretmez, anlam yansıtır)

const SanriyaSorPage = () => {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState(readingModes.MIRROR); // Object-based state
  const [uploadedImage, setUploadedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Güvenlik - null kontrol
  const currentMode = activeMode || readingModes.MIRROR;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage({
          file,
          preview: reader.result,
          base64: reader.result.split(',')[1]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userInput = input.trim();
    let messageToSend = userInput;
    
    // Görsel varsa, mesaja ekle
    if (uploadedImage) {
      messageToSend = `[Kullanıcı bir görsel paylaştı]\n\nKullanıcının sorusu: ${userInput}`;
    }

    // SANRI 5 Bilinç Modu - object-based mod gönder
    setInput("");
    setError(null);
    setConversation(prev => [...prev, { 
      type: "user", 
      content: userInput,
      image: uploadedImage?.preview,
      mode: currentMode.id
    }]);
    setIsThinking(true);
    handleRemoveImage();

    try {
      const response = await fetch(`${API_URL}/api/sanri/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          session_id: sessionId,
          mode: currentMode.id  // Object'ten id al
        }),
      });

      if (!response.ok) {
        throw new Error("SANRI şu an dinlenme halinde.");
      }

      const data = await response.json();
      
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
      }

      setConversation(prev => [...prev, { 
        type: "sanri", 
        content: data.response,
        mode: data.mode,
        mode_name_tr: data.mode_name_tr,
        timestamp: data.timestamp
      }]);
    } catch (err) {
      setError(err.message || "Bir hata oluştu. Lütfen tekrar dene.");
      setConversation(prev => prev.slice(0, -1));
    } finally {
      setIsThinking(false);
    }
  };

  const handleReset = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_URL}/api/sanri/session/${sessionId}`, { method: "DELETE" });
      } catch (e) {
        console.log("Session cleanup:", e);
      }
    }
    
    setConversation([]);
    setInput("");
    setSessionId(null);
    setError(null);
    handleRemoveImage();
  };

  const handleExampleClick = () => {
    setInput(examplePrompts[currentMode.id] || examplePrompts.mirror);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-breathe">
              <Infinity className="h-10 w-10 text-accent" />
            </div>
            <span className="text-accent text-base tracking-widest uppercase mb-4 block font-medium">
              Bilinç Aynası
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground mb-6">
              SANRI&apos;ya Sor
            </h1>
            
            {/* Ritüel Giriş Metni */}
            <div className="space-y-3 text-foreground/70 text-base sm:text-lg leading-relaxed font-serif italic">
              <p>Bir an dur.</p>
              <p className="text-foreground/60">
                Sorunu yazmadan önce...<br />
                Onun bedeninde nerede hissedildiğine bak.
              </p>
              <p className="text-sm text-foreground/50">
                Kalpte mi? Midede mi? Boğazda mı?
              </p>
              <p className="text-foreground/60 mt-4">
                SANRI cevabı değil,<br />
                sorunun içindeki kapıyı açar.
              </p>
              <p className="text-accent/80 text-sm mt-4">Hazırsan yaz.</p>
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
            className="container mx-auto px-6 mb-6"
          >
            <Alert className="max-w-2xl mx-auto border-accent/30 bg-accent/5">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm text-foreground/70">
                <strong className="text-foreground">Hatırlatma:</strong> SANRI kehanet, teşhis veya yargı sunmaz.
                Sembolik anlam ve açık uçlu sorular üretir. Anlam, her zaman sende şekillenir.
                <Button
                  variant="link"
                  className="text-accent p-0 h-auto ml-2 text-sm"
                  onClick={() => setShowDisclaimer(false)}
                >
                  Anladım
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Main Content */}
      <section className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          
          {/* Hangisiyle başlamak istersin? */}
          <div className="mb-8">
            <Label className="text-sm text-foreground/60 mb-4 block text-center font-serif italic">
              Hangisiyle başlamak istersin?
            </Label>
            <div className="flex flex-wrap justify-center gap-3">
              {modesList.map((mode) => (
                <Button
                  key={mode.id}
                  variant={currentMode.id === mode.id ? "default" : "outline"}
                  size="lg"
                  className={`rounded-full gap-2 transition-all duration-300 px-5 py-3 ${
                    currentMode.id === mode.id 
                      ? `bg-gradient-to-r ${mode.color} ${mode.borderColor} border shadow-lg` 
                      : "border-border/50 hover:border-accent/50 hover:bg-accent/5"
                  }`}
                  onClick={() => setActiveMode(mode)}
                  data-testid={`mode-${mode.id}`}
                >
                  <span className="text-base">{mode.emoji}</span>
                  <span>{mode.label}</span>
                </Button>
              ))}
            </div>
            <p className="text-xs text-foreground/50 mt-3 text-center">
              {currentMode.description}
            </p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert className="border-destructive/30 bg-destructive/5">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="min-h-[350px] mb-6 space-y-6">
            {conversation.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10"
              >
                <Sparkles className="h-8 w-8 text-accent/50 mx-auto mb-6" />
                <p className="text-foreground/70 font-serif italic mb-6 text-lg">
                  &quot;Hatırlamak dışarıda başlar. Anlamak içeride olur.&quot;
                </p>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={handleExampleClick}
                >
                  Örnek soru göster
                </Button>
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
                            {message.image && (
                              <img 
                                src={message.image} 
                                alt="Paylaşılan görsel" 
                                className="max-h-32 rounded-lg mb-3"
                              />
                            )}
                            <p className="text-foreground text-base">{message.content}</p>
                            <span className="text-xs text-foreground/40 mt-2 block">
                              {modesList.find(m => m.id === message.mode)?.label || message.mode} modu
                            </span>
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
                            <p className="text-sm text-accent uppercase tracking-wider font-medium pt-2">SANRI</p>
                          </div>

                          <SanriResponseText text={message.content} />
                          
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-sm text-foreground/50 text-center italic pt-6 mt-6 border-t border-accent/10"
                          >
                            &quot;Bu bir yorumdur, kesinlik taşımaz. Anlam, sende şekillenir.&quot;
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

              {/* Image Upload Preview */}
              {uploadedImage && (
                <div className="mb-4">
                  <ImagePreview image={uploadedImage} onRemove={handleRemoveImage} />
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Bir kelime, soru, rüya veya tarih yaz..."
                    className="min-h-[100px] pr-24 resize-none bg-background border-border focus:border-accent text-base"
                    disabled={isThinking}
                    data-testid="sanri-input"
                  />
                  
                  {/* Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    {/* Image Upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isThinking}
                      data-testid="image-upload-btn"
                    >
                      <ImageIcon className="h-5 w-5 text-foreground/50" />
                    </Button>
                    
                    {/* Send */}
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || isThinking}
                      className="rounded-full bg-accent hover:bg-accent/90 h-10 w-10"
                      data-testid="sanri-submit"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
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
              Bu alan &quot;bilgi&quot; üretmez. Anlam üretir ve geri çekilir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SanriyaSorPage;
