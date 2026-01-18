import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { bilincTexts, getRandomBilincText, getNextText } from "@/data/bilinc-frekans";

const BilincPage = () => {
  const [currentText, setCurrentText] = useState(null);
  const [userResponse, setUserResponse] = useState("");
  const [hasResponded, setHasResponded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setCurrentText(getRandomBilincText());
  }, []);

  const handleNext = () => {
    setIsTransitioning(true);
    setUserResponse("");
    setHasResponded(false);
    
    setTimeout(() => {
      setCurrentText(getNextText(currentText.id, bilincTexts));
      setIsTransitioning(false);
    }, 500);
  };

  const handleRespond = () => {
    if (userResponse.trim()) {
      setHasResponded(true);
    }
  };

  if (!currentText) return null;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      {/* Header - Minimal */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center max-w-xl mx-auto"
          >
            <span className="text-primary/60 text-xs tracking-[0.3em] uppercase mb-2 block">
              Bilinç Alanı
            </span>
            <p className="text-muted-foreground text-sm">
              Algının düzenlendiği yer
            </p>
          </motion.div>
        </div>
      </section>

      {/* Ana İçerik */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto">
            <AnimatePresence mode="wait">
              {!isTransitioning && (
                <motion.div
                  key={currentText.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* Mikro-Metin */}
                  <Card className="border-none shadow-none bg-transparent mb-12">
                    <CardContent className="p-0">
                      <div className="text-center py-12">
                        <p className="font-serif text-2xl sm:text-3xl text-foreground leading-relaxed whitespace-pre-line">
                          {currentText.text}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Soru Alanı (varsa) */}
                  {currentText.question && !hasResponded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <p className="text-muted-foreground text-sm italic mb-8">
                          "{currentText.question}"
                        </p>
                      </div>

                      <Textarea
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        placeholder="Cevaplamak zorunda değilsin..."
                        className="min-h-[80px] resize-none bg-muted/30 border-border/50 focus:border-primary/30 text-center"
                      />

                      <div className="flex justify-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleNext}
                          className="text-muted-foreground"
                        >
                          Geç
                        </Button>
                        {userResponse.trim() && (
                          <Button
                            size="sm"
                            onClick={handleRespond}
                            className="rounded-full"
                          >
                            Tamam
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Cevap Sonrası veya Soru Yoksa */}
                  {(hasResponded || !currentText.question) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center space-y-8"
                    >
                      {hasResponded && userResponse && (
                        <div className="bg-muted/20 rounded-lg p-4 max-w-sm mx-auto">
                          <p className="text-sm text-muted-foreground italic">
                            {userResponse}
                          </p>
                        </div>
                      )}

                      {/* Durma Anı */}
                      <div className="py-8">
                        <div className="flex items-center justify-center gap-3">
                          <span className="w-1 h-1 bg-primary/30 rounded-full" />
                          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                          <span className="w-2 h-2 bg-primary/70 rounded-full animate-pulse" />
                          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                          <span className="w-1 h-1 bg-primary/30 rounded-full" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                          Bir nefes al.
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={handleNext}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <span>Sonraki</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Alt Bilgi */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground/50">
              Bu alan cevap vermez. Perspektif açar.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BilincPage;
