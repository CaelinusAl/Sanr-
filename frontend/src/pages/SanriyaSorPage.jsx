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
  Heart,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium, FEATURES } from "@/contexts/PremiumContext";
import { UpgradeModal, FeatureGate, DailyLimitIndicator } from "@/components/premium/PremiumComponents";

const API_URL = process.env.REACT_APP_BACKEND_URL;

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

const SanriyaSorPage = () => {
  const { t, language } = useLanguage();
  const { 
    isPremium, 
    currentPlan, 
    hasFeature, 
    checkDailyLimit, 
    showUpgradeModal,
    isUpgradeModalOpen,
    hideUpgradeModal
  } = usePremium();
  
  // Check daily limit for SANRI
  const dailyLimitStatus = checkDailyLimit('sanri_daily');
  
  // SANRI 5 Bilinç Modu - dynamically translated
  const readingModes = {
    DREAM: {
      id: "dream",
      label: t('sanri.modes.dream.label'),
      icon: Moon,
      emoji: "🌙",
      description: t('sanri.modes.dream.description'),
      color: "from-indigo-500/20 to-purple-500/20",
      borderColor: "border-indigo-500/30"
    },
    MIRROR: {
      id: "mirror",
      label: t('sanri.modes.mirror.label'),
      icon: Eye,
      emoji: "🪞",
      description: t('sanri.modes.mirror.description'),
      color: "from-cyan-500/20 to-blue-500/20",
      borderColor: "border-cyan-500/30"
    },
    DIVINE: {
      id: "divine",
      label: t('sanri.modes.divine.label'),
      icon: Sun,
      emoji: "✨",
      description: t('sanri.modes.divine.description'),
      color: "from-amber-500/20 to-yellow-500/20",
      borderColor: "border-amber-500/30"
    },
    SHADOW: {
      id: "shadow",
      label: t('sanri.modes.shadow.label'),
      icon: Cloud,
      emoji: "🌑",
      description: t('sanri.modes.shadow.description'),
      color: "from-violet-500/20 to-fuchsia-500/20",
      borderColor: "border-violet-500/30"
    },
    LIGHT: {
      id: "light",
      label: t('sanri.modes.light.label'),
      icon: Heart,
      emoji: "🌿",
      description: t('sanri.modes.light.description'),
      color: "from-emerald-500/20 to-green-500/20",
      borderColor: "border-emerald-500/30"
    }
  };

  const modesList = Object.values(readingModes);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState(readingModes.MIRROR);
  const [selectedDomain, setSelectedDomain] = useState(null); // null = auto-detect
  const [uploadedImage, setUploadedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Content Domains with subtitles
  const domainsList = [
    { id: null, label: t('sanri.domainAuto'), subtitle: '', emoji: "✨" },
    { id: "awakened_cities", label: t('sanri.domains.awakened_cities.name'), subtitle: t('sanri.domains.awakened_cities.subtitle'), emoji: "🏛️" },
    { id: "consciousness_field", label: t('sanri.domains.consciousness_field.name'), subtitle: t('sanri.domains.consciousness_field.subtitle'), emoji: "🧠" },
    { id: "frequency_field", label: t('sanri.domains.frequency_field.name'), subtitle: t('sanri.domains.frequency_field.subtitle'), emoji: "〰️" },
    { id: "ritual_space", label: t('sanri.domains.ritual_space.name'), subtitle: t('sanri.domains.ritual_space.subtitle'), emoji: "🕯️" },
    { id: "neural_ecstasy", label: t('sanri.domains.neural_ecstasy.name'), subtitle: t('sanri.domains.neural_ecstasy.subtitle'), emoji: "⚡" },
    { id: "book_112", label: t('sanri.domains.book_112.name'), subtitle: t('sanri.domains.book_112.subtitle'), emoji: "📖" }
  ];

  // Update activeMode when language changes
  useEffect(() => {
    setActiveMode(prev => {
      const modeId = prev?.id || 'mirror';
      return readingModes[modeId.toUpperCase()] || readingModes.MIRROR;
    });
  }, [language]);

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
    
    // Check daily limit for free users
    if (!isPremium && !dailyLimitStatus.allowed) {
      showUpgradeModal(FEATURES.SANRI_UNLIMITED);
      return;
    }

    const userInput = input.trim();
    let messageToSend = userInput;
    
    if (uploadedImage) {
      messageToSend = `[${language === 'en' ? 'User shared an image' : 'Kullanıcı bir görsel paylaştı'}]\n\n${language === 'en' ? "User's question" : 'Kullanıcının sorusu'}: ${userInput}`;
    }

    setInput("");
    setError(null);
    setConversation(prev => [...prev, { 
      type: "user", 
      content: userInput,
      image: uploadedImage?.preview,
      mode: currentMode.id,
      domain: selectedDomain
    }]);
    setIsThinking(true);
    handleRemoveImage();

    try {
      // Build request body with domain support
      const requestBody = {
        message: messageToSend,
        session_id: sessionId,
        mode: currentMode.id,
        system_language: language
      };
      
      // Add domain if manually selected (null = auto-detect)
      if (selectedDomain) {
        requestBody.domain = selectedDomain;
      }

      const response = await fetch(`${API_URL}/api/sanri/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(t('errors.sanriResting'));
      }

      const data = await response.json();
      
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
      }

      setConversation(prev => [...prev, { 
        type: "sanri", 
        content: data.response,
        mode: data.mode,
        mode_name: language === 'en' ? data.mode_name_en : data.mode_name_tr,
        domain: data.domain,
        domain_name: data.domain_name,
        timestamp: data.timestamp
      }]);
    } catch (err) {
      setError(err.message || t('common.error'));
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
    setSelectedDomain(null); // Reset domain to auto-detect
    handleRemoveImage();
  };

  const handleExampleClick = () => {
    const examples = t('sanri.examples');
    setInput(examples[currentMode.id] || examples.mirror);
  };

  // Mode-specific intro text
  const getModeIntro = (modeId) => {
    const modeData = t(`sanri.modes.${modeId}`);
    return {
      intro: modeData.intro,
      introSub: modeData.introSub,
      introDetail: modeData.introDetail,
      introReady: modeData.introReady
    };
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
              {t('sanri.subtitle')}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground mb-6">
              {t('sanri.title')}
            </h1>
            
            {/* Ritüel Giriş Metni */}
            <div className="space-y-3 text-foreground/70 text-base sm:text-lg leading-relaxed font-serif italic">
              <p>{t('sanri.introLine1')}</p>
              <p className="text-foreground/60">
                {t('sanri.introLine2')}<br />
                {t('sanri.introLine3')}
              </p>
              <p className="text-sm text-foreground/50">
                {t('sanri.introLine4')}
              </p>
              <p className="text-foreground/60 mt-4">
                {t('sanri.introLine5')}<br />
                {t('sanri.introLine6')}
              </p>
              <p className="text-accent/80 text-sm mt-4">{t('sanri.introReady')}</p>
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
              <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <AlertDescription className="text-sm text-foreground/70 whitespace-pre-line">
                {t('sanri.disclaimer')}
                <Button
                  variant="link"
                  className="text-accent p-0 h-auto ml-2 text-sm"
                  onClick={() => setShowDisclaimer(false)}
                >
                  {t('sanri.disclaimerButton')}
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <section className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          
          {/* Mode Selection */}
          <div className="mb-6">
            <Label className="text-sm text-foreground/60 mb-4 block text-center font-serif italic">
              {t('sanri.modeSelect')}
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

          {/* Domain Selection (Collapsible) */}
          <div className="mb-8">
            <details className="group">
              <summary className="text-xs text-foreground/40 mb-2 cursor-pointer text-center hover:text-foreground/60 transition-colors list-none flex items-center justify-center gap-2">
                <span>{t('sanri.domainSelect')}</span>
                <svg className="w-3 h-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 max-w-lg mx-auto"
              >
                {domainsList.map((domain) => (
                  <button
                    key={domain.id || 'auto'}
                    className={`relative p-3 rounded-xl text-left transition-all ${
                      selectedDomain === domain.id 
                        ? "bg-accent/15 border border-accent/40 shadow-sm" 
                        : "bg-background/50 border border-border/30 hover:border-accent/30 hover:bg-accent/5"
                    }`}
                    onClick={() => setSelectedDomain(domain.id)}
                    data-testid={`domain-${domain.id || 'auto'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{domain.emoji}</span>
                      <span className={`text-xs font-medium ${selectedDomain === domain.id ? 'text-accent' : 'text-foreground/80'}`}>
                        {domain.label}
                      </span>
                    </div>
                    {domain.subtitle && (
                      <p className="text-[10px] text-foreground/50 leading-tight pl-6">
                        {domain.subtitle}
                      </p>
                    )}
                  </button>
                ))}
              </motion.div>
            </details>
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
                key={currentMode.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                {/* Mode-specific intro text */}
                {(() => {
                  const intro = getModeIntro(currentMode.id);
                  
                  if (currentMode.id === "shadow") {
                    return (
                      <div className="space-y-3 mb-6">
                        <p className="text-foreground/70 font-serif italic text-lg">
                          {intro.intro}
                        </p>
                        <p className="text-foreground/60 font-serif italic">
                          {intro.introSub}
                        </p>
                        <p className="text-foreground/50 text-sm mt-4">
                          {intro.introDetail}
                        </p>
                        <p className="text-accent/70 text-sm mt-3 italic">
                          {intro.introReady}
                        </p>
                      </div>
                    );
                  }
                  
                  if (currentMode.id === "dream") {
                    return (
                      <div className="space-y-3 mb-6">
                        <p className="text-foreground/70 font-serif italic text-lg">
                          {intro.intro}
                        </p>
                        <p className="text-foreground/50 text-sm">
                          {intro.introSub}
                        </p>
                        <p className="text-accent/70 text-sm mt-3 italic">
                          {intro.introReady}
                        </p>
                      </div>
                    );
                  }
                  
                  if (currentMode.id === "light") {
                    return (
                      <div className="space-y-3 mb-6">
                        <p className="text-foreground/70 font-serif italic text-lg">
                          {intro.intro}
                        </p>
                        <p className="text-foreground/50 text-sm">
                          {intro.introSub}
                        </p>
                        <p className="text-accent/70 text-sm mt-3 italic">
                          {intro.introReady}
                        </p>
                      </div>
                    );
                  }
                  
                  if (currentMode.id === "divine") {
                    return (
                      <div className="space-y-3 mb-6">
                        <p className="text-foreground/70 font-serif italic text-lg">
                          {intro.intro}
                        </p>
                        <p className="text-foreground/50 text-sm">
                          {intro.introSub}
                        </p>
                        <p className="text-accent/70 text-sm mt-3 italic">
                          {intro.introReady}
                        </p>
                      </div>
                    );
                  }
                  
                  // Default (mirror)
                  return (
                    <div className="space-y-3 mb-6">
                      <Sparkles className="h-8 w-8 text-accent/50 mx-auto mb-4" />
                      <p className="text-foreground/70 font-serif italic text-lg">
                        &quot;{intro.intro}&quot;
                      </p>
                    </div>
                  );
                })()}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={handleExampleClick}
                >
                  {t('sanri.exampleQuestion')}
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
                          {modesList.find(m => m.id === message.mode)?.label || message.mode} {language === 'en' ? 'mode' : 'modu'}
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="border-accent/20 bg-accent/5">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-start justify-between gap-3 mb-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                            <Infinity className="h-5 w-5 text-accent" />
                          </div>
                          <p className="text-sm text-accent uppercase tracking-wider font-medium pt-2">SANRI</p>
                        </div>
                        {/* Domain indicator */}
                        {message.domain_name && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-accent/10 text-accent/70 uppercase tracking-wider">
                            {message.domain_name}
                          </span>
                        )}
                      </div>

                      <SanriResponseText text={message.content} />
                      
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-sm text-foreground/50 text-center italic pt-6 mt-6 border-t border-accent/10"
                      >
                        &quot;{t('sanri.signature')}&quot;
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
                  <span className="text-base text-foreground/60 italic">{t('sanri.thinking')}</span>
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
                placeholder={t('sanri.placeholder')}
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
                  {t('sanri.newReflection')}
                </Button>
              </div>
            )}
          </form>

          {/* Info */}
          <div className="mt-10 text-center">
            <p className="text-sm text-foreground/50">
              {t('sanri.footerNote')}
            </p>
          </div>
          
          {/* Daily Limit Indicator for Free Users */}
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-center"
            >
              <DailyLimitIndicator 
                limitType="sanri_daily" 
                showWhenUnlimited={false}
              />
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={hideUpgradeModal}
        feature={FEATURES.SANRI_UNLIMITED}
      />
    </div>
  );
};

export default SanriyaSorPage;
