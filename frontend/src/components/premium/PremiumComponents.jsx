// CAELINUS AI - Premium UI Components
// Lock gates, upgrade prompts, and premium badges

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, Sparkles, ChevronRight, X, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePremium, PLAN_TYPES, FEATURES } from '@/contexts/PremiumContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Plan display names
const PLAN_NAMES = {
  free: { tr: 'Ücretsiz – Uyanış', en: 'Free – Awaken' },
  soul: { tr: 'Premium Ruh', en: 'Premium Soul' },
  initiation: { tr: 'Premium İnisiyasyon', en: 'Premium Initiation' },
  oracle: { tr: 'Oracle Çemberi', en: 'Oracle Circle' }
};

// Plan colors/styles
const PLAN_STYLES = {
  free: { gradient: 'from-slate-500 to-slate-600', icon: '🌱', color: 'text-slate-400' },
  soul: { gradient: 'from-indigo-500 to-violet-500', icon: '💫', color: 'text-indigo-400' },
  initiation: { gradient: 'from-violet-500 to-purple-500', icon: '🔮', color: 'text-violet-400' },
  oracle: { gradient: 'from-amber-500 to-orange-500', icon: '👁️', color: 'text-amber-400' }
};

/**
 * Premium Badge - Shows user's current plan
 */
export const PremiumBadge = ({ showFree = false, size = 'default' }) => {
  const { currentPlan, isPremium } = usePremium();
  const { language } = useLanguage();
  
  if (!isPremium && !showFree) return null;
  
  const style = PLAN_STYLES[currentPlan] || PLAN_STYLES.free;
  const planName = PLAN_NAMES[currentPlan]?.[language] || currentPlan;
  
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5'
  };
  
  return (
    <Badge 
      className={`bg-gradient-to-r ${style.gradient} text-white ${sizeClasses[size]} border-0`}
    >
      <span className="mr-1">{style.icon}</span>
      {planName}
    </Badge>
  );
};

/**
 * Feature Lock - Wraps content that requires premium
 * Shows lock overlay if user doesn't have access
 */
export const FeatureLock = ({ 
  feature, 
  children, 
  fallback = null,
  showPreview = true,
  blurPreview = true,
  className = ''
}) => {
  const { hasFeature, getRequiredPlan, showUpgradeModal } = usePremium();
  const { language } = useLanguage();
  
  const hasAccess = hasFeature(feature);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  const requiredPlan = getRequiredPlan(feature);
  const planName = PLAN_NAMES[requiredPlan]?.[language] || requiredPlan;
  
  // If fallback provided and no preview wanted
  if (!showPreview && fallback) {
    return <>{fallback}</>;
  }
  
  return (
    <div className={`relative ${className}`}>
      {/* Blurred preview of locked content */}
      {showPreview && (
        <div className={`${blurPreview ? 'blur-sm' : 'opacity-50'} pointer-events-none`}>
          {children}
        </div>
      )}
      
      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[2px] rounded-lg">
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'en' 
              ? `This feature requires ${planName}`
              : `Bu özellik için ${planName} gerekli`
            }
          </p>
          <Button 
            onClick={() => showUpgradeModal(requiredPlan)}
            className="rounded-full bg-gradient-to-r from-primary to-accent"
          >
            <Crown className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Unlock' : 'Kilidi Aç'}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Content Limiter - Limits array content based on plan
 * Shows "See more" with upgrade CTA if limited
 */
export const ContentLimiter = ({ 
  items, 
  contentType, 
  renderItem,
  emptyMessage = null 
}) => {
  const { getContentLimit, showUpgradeModal, currentPlan } = usePremium();
  const { language } = useLanguage();
  
  const limit = getContentLimit(contentType);
  const total = items?.length || 0;
  const isLimited = limit !== -1 && total > limit;
  const displayItems = isLimited ? items.slice(0, limit) : items;
  const lockedCount = total - (limit === -1 ? total : limit);
  
  if (!items || items.length === 0) {
    return emptyMessage || null;
  }
  
  return (
    <>
      {displayItems.map((item, index) => renderItem(item, index))}
      
      {isLimited && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 text-center">
              <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                {language === 'en' 
                  ? `+${lockedCount} more locked`
                  : `+${lockedCount} daha kilitli`
                }
              </p>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => showUpgradeModal(PLAN_TYPES.SOUL)}
                className="rounded-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Unlock All' : 'Tümünü Aç'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
};

/**
 * Upgrade Prompt Banner - Shows contextual upgrade message
 */
export const UpgradePromptBanner = ({ dismissable = true }) => {
  const { upgradePrompt, showUpgradeModal, currentPlan } = usePremium();
  const { language } = useLanguage();
  const [dismissed, setDismissed] = React.useState(false);
  
  if (!upgradePrompt || dismissed) return null;
  
  const targetPlan = upgradePrompt.target_plan || PLAN_TYPES.SOUL;
  const style = PLAN_STYLES[targetPlan] || PLAN_STYLES.soul;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative bg-gradient-to-r ${style.gradient} text-white rounded-xl p-4 mb-6`}
    >
      {dismissable && (
        <button 
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-medium mb-1">
            {upgradePrompt.message?.[language] || upgradePrompt.message}
          </p>
          <Button 
            size="sm"
            variant="secondary"
            onClick={() => showUpgradeModal(targetPlan)}
            className="mt-2 bg-white/20 hover:bg-white/30 text-white border-0"
          >
            {language === 'en' ? 'Explore' : 'Keşfet'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Daily Limit Indicator - Shows remaining uses
 */
export const DailyLimitIndicator = ({ limitType, showWhenUnlimited = false }) => {
  const { checkDailyLimit, showUpgradeModal } = usePremium();
  const { language } = useLanguage();
  
  const { allowed, remaining, limit } = checkDailyLimit(limitType);
  
  // Don't show if unlimited and not requested
  if (limit === -1 && !showWhenUnlimited) return null;
  
  const isLow = remaining <= 1 && limit !== -1;
  
  return (
    <div className={`flex items-center gap-2 text-sm ${isLow ? 'text-amber-400' : 'text-muted-foreground'}`}>
      <Zap className={`w-4 h-4 ${isLow ? 'text-amber-400' : ''}`} />
      {limit === -1 ? (
        <span>{language === 'en' ? 'Unlimited' : 'Sınırsız'}</span>
      ) : (
        <>
          <span>
            {remaining}/{limit} {language === 'en' ? 'remaining' : 'kalan'}
          </span>
          {!allowed && (
            <Button 
              size="sm" 
              variant="link" 
              className="h-auto p-0 text-amber-400"
              onClick={() => showUpgradeModal(PLAN_TYPES.SOUL)}
            >
              {language === 'en' ? 'Get more' : 'Daha fazla al'}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Plan Comparison Card - For upgrade modal
 */
export const PlanCard = ({ plan, isCurrent = false, onSelect }) => {
  const { language } = useLanguage();
  const style = PLAN_STYLES[plan.id] || PLAN_STYLES.free;
  
  const price = plan.price?.[language === 'tr' ? 'tr' : 'en'];
  const priceText = price?.amount === 0 
    ? (language === 'en' ? 'Free' : 'Ücretsiz')
    : `${price?.currency === 'TRY' ? '₺' : '$'}${price?.amount}/${price?.period === 'year' ? (language === 'en' ? 'year' : 'yıl') : (language === 'en' ? 'month' : 'ay')}`;
  
  return (
    <Card className={`relative overflow-hidden transition-all ${
      isCurrent 
        ? 'border-primary ring-2 ring-primary/20' 
        : plan.highlight 
          ? 'border-accent/50' 
          : 'border-border/50 hover:border-primary/30'
    }`}>
      {plan.badge && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-bl-lg">
          {plan.badge[language]}
        </div>
      )}
      
      {plan.invite_only && (
        <div className="absolute top-0 left-0 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-br-lg">
          {language === 'en' ? 'Invite Only' : 'Sadece Davet'}
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{style.icon}</span>
          <div>
            <h3 className="font-serif text-lg text-foreground">
              {plan.display_name?.[language]}
            </h3>
            <p className="text-2xl font-bold text-foreground">{priceText}</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {plan.description?.[language]}
        </p>
        
        {/* Feature highlights */}
        <ul className="space-y-2 mb-6 text-sm">
          {plan.id === 'free' && (
            <>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-primary" />
                {language === 'en' ? '3 SANRI questions/day' : 'Günde 3 SANRI sorusu'}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-primary" />
                {language === 'en' ? 'Micro rituals' : 'Mikro ritüeller'}
              </li>
            </>
          )}
          {plan.id === 'soul' && (
            <>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-indigo-400" />
                {language === 'en' ? 'Unlimited SANRI' : 'Sınırsız SANRI'}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-indigo-400" />
                {language === 'en' ? 'Deep rituals' : 'Derin ritüeller'}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-indigo-400" />
                {language === 'en' ? 'No watermark' : 'Watermark yok'}
              </li>
            </>
          )}
          {plan.id === 'initiation' && (
            <>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-violet-400" />
                {language === 'en' ? 'Visual analysis' : 'Görsel analiz'}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-violet-400" />
                {language === 'en' ? 'Fate layer reading' : 'Kader katmanı okuması'}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-violet-400" />
                {language === 'en' ? 'Book 112 full access' : 'Kitap 112 tam erişim'}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-violet-400" />
                {language === 'en' ? 'Voice SANRI' : 'Sesli SANRI'}
              </li>
            </>
          )}
          {plan.id === 'oracle' && (
            <>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-amber-400" />
                {language === 'en' ? 'High-consciousness SANRI' : 'Yüksek bilinç SANRI'}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-amber-400" />
                {language === 'en' ? 'Timeline analysis' : 'Zaman çizgisi analizi'}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-amber-400" />
                {language === 'en' ? 'Weekly private rituals' : 'Haftalık özel ritüeller'}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-amber-400" />
                {language === 'en' ? 'Consciousness report' : 'Bilinç raporu'}
              </li>
            </>
          )}
        </ul>
        
        <Button 
          className={`w-full rounded-full ${
            isCurrent 
              ? 'bg-muted text-muted-foreground cursor-default' 
              : `bg-gradient-to-r ${style.gradient}`
          }`}
          disabled={isCurrent || plan.invite_only}
          onClick={() => !isCurrent && !plan.invite_only && onSelect?.(plan.id)}
        >
          {isCurrent 
            ? (language === 'en' ? 'Current Plan' : 'Mevcut Plan')
            : plan.invite_only
              ? (language === 'en' ? 'Invitation Required' : 'Davet Gerekli')
              : (language === 'en' ? 'Select' : 'Seç')
          }
        </Button>
      </CardContent>
    </Card>
  );
};

/**
 * Upgrade Modal - Full plan selection dialog
 */
export const UpgradeModal = () => {
  const { 
    isUpgradeModalOpen, 
    hideUpgradeModal, 
    plans, 
    currentPlan, 
    upgradeToPlan,
    redeemInviteCode 
  } = usePremium();
  const { language } = useLanguage();
  const [inviteCode, setInviteCode] = React.useState('');
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const [showInviteInput, setShowInviteInput] = React.useState(false);
  
  const handleSelectPlan = async (planId) => {
    if (planId === currentPlan) return;
    
    setIsUpgrading(true);
    const result = await upgradeToPlan(planId);
    setIsUpgrading(false);
    
    if (result.success) {
      hideUpgradeModal();
    }
  };
  
  const handleRedeemCode = async () => {
    if (!inviteCode.trim()) return;
    
    setIsUpgrading(true);
    const result = await redeemInviteCode(inviteCode);
    setIsUpgrading(false);
    
    if (result.success) {
      setInviteCode('');
      setShowInviteInput(false);
      hideUpgradeModal();
    }
  };
  
  return (
    <Dialog open={isUpgradeModalOpen} onOpenChange={hideUpgradeModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center">
            {language === 'en' ? 'Unlock Your Consciousness' : 'Bilincini Aç'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {language === 'en' 
              ? 'Choose your path to deeper awareness'
              : 'Derin farkındalığa giden yolunu seç'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {plans.map((plan) => (
            <PlanCard 
              key={plan.id}
              plan={plan}
              isCurrent={plan.id === currentPlan}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
        
        {/* Invite Code Section */}
        <div className="mt-6 pt-6 border-t border-border">
          {showInviteInput ? (
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                placeholder={language === 'en' ? 'Enter invite code' : 'Davet kodu girin'}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
              />
              <Button onClick={handleRedeemCode} disabled={isUpgrading}>
                {language === 'en' ? 'Redeem' : 'Kullan'}
              </Button>
              <Button variant="ghost" onClick={() => setShowInviteInput(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button 
              onClick={() => setShowInviteInput(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto block"
            >
              {language === 'en' ? 'Have an invite code?' : 'Davet kodun var mı?'}
            </button>
          )}
        </div>
        
        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          {language === 'en'
            ? 'Subscriptions auto-renew. Cancel anytime. This is a demo version.'
            : 'Abonelikler otomatik yenilenir. İstediğin zaman iptal edebilirsin. Bu bir demo sürümüdür.'
          }
        </p>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Feature Gate - Simple wrapper that checks feature access
 */
export const FeatureGate = ({ feature, children, fallback = null }) => {
  const { hasFeature } = usePremium();
  
  if (hasFeature(feature)) {
    return <>{children}</>;
  }
  
  return fallback || null;
};

/**
 * Locked Content - Beautiful locked state display
 */
export const LockedContent = ({ 
  title, 
  description, 
  onUpgrade,
  icon = Lock 
}) => {
  const { language } = useLanguage();
  const IconComponent = icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        <CardContent className="p-8 text-center">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-32 h-32 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-4 right-4 w-40 h-40 rounded-full bg-accent blur-3xl" />
          </div>
          
          <div className="relative z-10">
            {/* Lock Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-primary" />
            </div>
            
            {/* Title */}
            <h3 className="font-serif text-xl text-foreground mb-3">
              {title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              {description}
            </p>
            
            {/* CTA */}
            <Button 
              onClick={onUpgrade}
              className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 px-8"
            >
              <Crown className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Unlock Access' : 'Erişimi Aç'}
            </Button>
            
            {/* Soft note */}
            <p className="text-xs text-muted-foreground mt-4 italic">
              {language === 'en' 
                ? '"You are ready to go deeper. This field opens when you choose to remember more."'
                : '"Derine inmeye hazırsın. Bu alan, daha fazlasını hatırlamayı seçtiğinde açılır."'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default {
  PremiumBadge,
  FeatureLock,
  FeatureGate,
  LockedContent,
  ContentLimiter,
  UpgradePromptBanner,
  DailyLimitIndicator,
  PlanCard,
  UpgradeModal
};
