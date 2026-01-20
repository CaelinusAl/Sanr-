// CAELINUS AI - Upgrade Flow Modals
// Day 3: Soft prompt, Day 7: Main invitation

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

// Day 3 - Soft Prompt (minimal, non-intrusive)
export const Day3SoftPrompt = ({ isOpen, onClose, onExplore, trigger }) => {
  const { language } = useLanguage();
  
  if (!trigger) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-xl border border-primary/20 rounded-2xl p-5 shadow-2xl">
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-serif text-lg text-foreground mb-1">
                  {trigger.title[language]}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {trigger.message[language]}
                </p>
                
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={onExplore}
                    size="sm"
                    className="rounded-full bg-primary/80 hover:bg-primary"
                  >
                    {trigger.cta[language]}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <button 
                    onClick={onClose}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {language === 'en' ? 'Later' : 'Daha Sonra'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Day 7 - Main Invitation Modal (more prominent)
export const Day7InvitationModal = ({ isOpen, onClose, onExplore, trigger }) => {
  const { language } = useLanguage();
  
  if (!trigger) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-primary/20 bg-gradient-to-br from-background to-primary/5 p-0 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent blur-3xl" />
        </div>
        
        <div className="relative p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6 border border-primary/30"
          >
            <Crown className="w-10 h-10 text-primary" />
          </motion.div>
          
          {/* Title */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-2xl text-foreground mb-3"
          >
            {trigger.title[language]}
          </motion.h2>
          
          {/* Message */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed"
          >
            {trigger.message[language]}
          </motion.p>
          
          {/* Journey Progress */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground"
          >
            <Clock className="w-4 h-4" />
            <span>
              {language === 'en' ? '7 days of consciousness journey' : '7 günlük bilinç yolculuğu'}
            </span>
          </motion.div>
          
          {/* CTA */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <Button 
              onClick={onExplore}
              className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 px-8 py-6 text-base"
            >
              <Crown className="w-5 h-5 mr-2" />
              {trigger.cta[language]}
            </Button>
            
            <button 
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {language === 'en' ? 'Maybe later' : 'Belki daha sonra'}
            </button>
          </motion.div>
          
          {/* Soft note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-muted-foreground/70 mt-6 italic"
          >
            {language === 'en' 
              ? '"This is an invitation, not an obligation. Your journey continues either way."'
              : '"Bu bir davet, zorunluluk değil. Yolculuğun her iki şekilde de devam ediyor."'
            }
          </motion.p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main wrapper component that selects the right modal
export const UpgradeFlowModal = ({ trigger, isOpen, onClose }) => {
  const navigate = useNavigate();
  
  const handleExplore = () => {
    onClose();
    navigate('/premium');
  };
  
  if (!trigger) return null;
  
  if (trigger.style === 'soft') {
    return (
      <Day3SoftPrompt 
        isOpen={isOpen} 
        onClose={onClose} 
        onExplore={handleExplore}
        trigger={trigger}
      />
    );
  }
  
  return (
    <Day7InvitationModal 
      isOpen={isOpen} 
      onClose={onClose} 
      onExplore={handleExplore}
      trigger={trigger}
    />
  );
};

export default UpgradeFlowModal;
