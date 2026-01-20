// CAELINUS AI - Subscription Plans Page
// Premium tier comparison and upgrade flow

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Check, X, Star, Zap, Eye, BookOpen, Heart, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { usePremium, PLAN_TYPES } from '@/contexts/PremiumContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const SubscriptionPage = () => {
  const { language } = useLanguage();
  const { 
    plans, 
    currentPlan, 
    isPremium, 
    isOracleInvited,
    upgradeToPlan, 
    redeemInviteCode,
    subscription 
  } = usePremium();
  
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Text content
  const text = {
    tr: {
      title: 'Bilinç Katmanları',
      subtitle: 'Bilinç yolculuğunda hangi kapıyı açmak istiyorsun?',
      currentPlan: 'Mevcut Planın',
      validUntil: 'Geçerlilik',
      features: 'Özellikler',
      inviteCode: 'Davet Kodu',
      inviteCodePlaceholder: 'CAELINUS-XXXX',
      inviteCodeHint: 'Oracle ve Initiation davetleri için özel kodunuzu girin.',
      redeem: 'Kodu Kullan',
      selectPlan: 'Bu Planı Seç',
      currentPlanButton: 'Mevcut Plan',
      inviteRequired: 'Davet Gerekli',
      popular: 'En Popüler',
      inviteOnly: 'Sadece Davetlilere',
      free: 'Ücretsiz',
      month: 'ay',
      year: 'yıl',
      unlimited: 'Sınırsız',
      limited: 'Sınırlı',
      included: 'Dahil',
      notIncluded: 'Dahil Değil',
      disclaimer: 'Bu bir demo sürümüdür. Gerçek ödeme entegrasyonu yakında eklenecektir.',
      successUpgrade: 'Plan başarıyla yükseltildi!',
      successInvite: 'Davet kodu kullanıldı!',
      errorInvite: 'Geçersiz davet kodu'
    },
    en: {
      title: 'Consciousness Tiers',
      subtitle: 'Which door do you want to open on your consciousness journey?',
      currentPlan: 'Your Current Plan',
      validUntil: 'Valid Until',
      features: 'Features',
      inviteCode: 'Invite Code',
      inviteCodePlaceholder: 'CAELINUS-XXXX',
      inviteCodeHint: 'Enter your special code for Oracle and Initiation invitations.',
      redeem: 'Redeem Code',
      selectPlan: 'Select This Plan',
      currentPlanButton: 'Current Plan',
      inviteRequired: 'Invite Required',
      popular: 'Most Popular',
      inviteOnly: 'Invitation Only',
      free: 'Free',
      month: 'month',
      year: 'year',
      unlimited: 'Unlimited',
      limited: 'Limited',
      included: 'Included',
      notIncluded: 'Not Included',
      disclaimer: 'This is a demo version. Real payment integration coming soon.',
      successUpgrade: 'Plan upgraded successfully!',
      successInvite: 'Invite code redeemed!',
      errorInvite: 'Invalid invite code'
    }
  };
  const t = text[language] || text.tr;
  
  // Plan styles
  const planStyles = {
    free: { 
      gradient: 'from-slate-800 to-slate-900', 
      border: 'border-slate-700',
      icon: '🌱',
      iconBg: 'bg-slate-800'
    },
    soul: { 
      gradient: 'from-indigo-900 to-violet-900', 
      border: 'border-indigo-500/50',
      icon: '💫',
      iconBg: 'bg-indigo-900'
    },
    initiation: { 
      gradient: 'from-violet-900 to-purple-900', 
      border: 'border-violet-500/50',
      icon: '🔮',
      iconBg: 'bg-violet-900'
    },
    oracle: { 
      gradient: 'from-amber-900 to-orange-900', 
      border: 'border-amber-500/50',
      icon: '👁️',
      iconBg: 'bg-amber-900'
    }
  };
  
  // Feature list per plan
  const featureList = {
    tr: {
      sanri: 'SANRI Sorgu',
      sanriDeep: 'Derin Analiz',
      sanriVisual: 'Görsel Analiz',
      sanriFate: 'Kader Katmanı',
      sanriOracle: 'Yüksek Bilinç Modu',
      consciousness: 'Bilinç Alanı',
      frequency: 'Frekans Alanı',
      ritualMicro: 'Mikro Ritüeller',
      ritualDeep: 'Derin Ritüeller',
      ritualNeural: 'Nöral Esktazi',
      book112: 'Kitap 112',
      cities: 'Şehirler',
      citiesSanri: 'Şehir SANRI',
      profile: 'Profil Aynası',
      voice: 'Sesli SANRI',
      voicePersonal: 'Kişisel Ses',
      watermark: 'Watermark',
      weeklyRitual: 'Haftalık Özel Ritüel',
      report: 'Bilinç Raporu'
    },
    en: {
      sanri: 'SANRI Query',
      sanriDeep: 'Deep Analysis',
      sanriVisual: 'Visual Analysis',
      sanriFate: 'Fate Layer',
      sanriOracle: 'High Consciousness Mode',
      consciousness: 'Consciousness Field',
      frequency: 'Frequency Field',
      ritualMicro: 'Micro Rituals',
      ritualDeep: 'Deep Rituals',
      ritualNeural: 'Neural Ecstasy',
      book112: 'Book 112',
      cities: 'Cities',
      citiesSanri: 'City SANRI',
      profile: 'Profile Mirror',
      voice: 'Voice SANRI',
      voicePersonal: 'Personal Voice',
      watermark: 'Watermark',
      weeklyRitual: 'Weekly Private Ritual',
      report: 'Consciousness Report'
    }
  };
  const fl = featureList[language] || featureList.tr;
  
  // Feature matrix
  const featureMatrix = [
    { key: 'sanri', free: '3/gün', soul: t.unlimited, initiation: t.unlimited, oracle: t.unlimited },
    { key: 'sanriDeep', free: false, soul: true, initiation: true, oracle: true },
    { key: 'sanriVisual', free: false, soul: false, initiation: true, oracle: true },
    { key: 'sanriFate', free: false, soul: false, initiation: true, oracle: true },
    { key: 'sanriOracle', free: false, soul: false, initiation: false, oracle: true },
    { key: 'consciousness', free: '6 kart', soul: t.unlimited, initiation: t.unlimited, oracle: t.unlimited },
    { key: 'frequency', free: '5 öğe', soul: t.unlimited, initiation: t.unlimited, oracle: t.unlimited },
    { key: 'ritualMicro', free: true, soul: true, initiation: true, oracle: true },
    { key: 'ritualDeep', free: false, soul: true, initiation: true, oracle: true },
    { key: 'ritualNeural', free: false, soul: false, initiation: true, oracle: true },
    { key: 'book112', free: false, soul: false, initiation: true, oracle: true },
    { key: 'cities', free: '20 şehir', soul: t.unlimited, initiation: t.unlimited, oracle: t.unlimited },
    { key: 'citiesSanri', free: false, soul: false, initiation: true, oracle: true },
    { key: 'profile', free: false, soul: false, initiation: true, oracle: true },
    { key: 'voice', free: false, soul: false, initiation: true, oracle: true },
    { key: 'voicePersonal', free: false, soul: false, initiation: false, oracle: true },
    { key: 'watermark', free: true, soul: false, initiation: false, oracle: false },
    { key: 'weeklyRitual', free: false, soul: false, initiation: false, oracle: true },
    { key: 'report', free: false, soul: false, initiation: false, oracle: true },
  ];
  
  const handleSelectPlan = async (planId) => {
    if (planId === currentPlan) return;
    if (planId === 'oracle' && !isOracleInvited) return;
    
    setIsLoading(true);
    const result = await upgradeToPlan(planId);
    setIsLoading(false);
    
    if (result.success) {
      toast.success(t.successUpgrade);
    } else {
      toast.error(result.message);
    }
  };
  
  const handleRedeemCode = async () => {
    if (!inviteCode.trim()) return;
    
    setIsLoading(true);
    const result = await redeemInviteCode(inviteCode);
    setIsLoading(false);
    
    if (result.success) {
      toast.success(t.successInvite);
      setInviteCode('');
    } else {
      toast.error(result.message || t.errorInvite);
    }
  };
  
  const formatPrice = (plan) => {
    const priceData = plan.price?.[language === 'tr' ? 'tr' : 'en'];
    if (!priceData || priceData.amount === 0) return t.free;
    
    const symbol = priceData.currency === 'TRY' ? '₺' : '€';
    let period = '';
    if (priceData.period === 'year') {
      period = `/${t.year}`;
    } else if (priceData.period === 'month') {
      period = `/${t.month}`;
    } else if (priceData.period === 'access') {
      period = ''; // One-time access fee
    }
    return `${symbol}${priceData.amount}${period}`;
  };
  
  const renderFeatureValue = (value) => {
    if (value === true) {
      return <Check className="w-5 h-5 text-green-400" />;
    }
    if (value === false) {
      return <X className="w-5 h-5 text-red-400/50" />;
    }
    return <span className="text-sm text-muted-foreground">{value}</span>;
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-4">
              {t.title}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t.subtitle}
            </p>
          </motion.div>
          
          {/* Current Plan Badge */}
          {isPremium && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-8"
            >
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{planStyles[currentPlan]?.icon}</span>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.currentPlan}</p>
                    <p className="font-serif text-lg text-foreground">
                      {plans.find(p => p.id === currentPlan)?.display_name?.[language]}
                    </p>
                  </div>
                  {subscription?.premium_until && (
                    <div className="ml-4 pl-4 border-l border-border">
                      <p className="text-sm text-muted-foreground">{t.validUntil}</p>
                      <p className="text-foreground">
                        {new Date(subscription.premium_until).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Plan Cards */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => {
              const style = planStyles[plan.id] || planStyles.free;
              const isCurrent = plan.id === currentPlan;
              const isInviteOnly = plan.invite_only;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative h-full ${style.border} bg-gradient-to-b ${style.gradient} overflow-hidden ${
                    isCurrent ? 'ring-2 ring-primary' : ''
                  }`}>
                    {/* Badges */}
                    {plan.highlight && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-bl-lg">
                        {t.popular}
                      </div>
                    )}
                    {isInviteOnly && (
                      <div className="absolute top-0 left-0 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-br-lg">
                        {t.inviteOnly}
                      </div>
                    )}
                    
                    <CardHeader className="pt-8">
                      <div className={`w-16 h-16 rounded-full ${style.iconBg} flex items-center justify-center mb-4`}>
                        <span className="text-3xl">{style.icon}</span>
                      </div>
                      <CardTitle className="font-serif text-xl text-foreground">
                        {plan.display_name?.[language]}
                      </CardTitle>
                      <p className="text-3xl font-bold text-foreground mt-2">
                        {formatPrice(plan)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {plan.description?.[language]}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pb-6">
                      <Button 
                        className={`w-full rounded-full ${
                          isCurrent 
                            ? 'bg-muted text-muted-foreground cursor-default' 
                            : isInviteOnly && !isOracleInvited
                              ? 'bg-amber-500/20 text-amber-300 cursor-not-allowed'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                        disabled={isCurrent || (isInviteOnly && !isOracleInvited) || isLoading}
                        onClick={() => handleSelectPlan(plan.id)}
                        data-testid={`select-plan-${plan.id}`}
                      >
                        {isCurrent 
                          ? t.currentPlanButton
                          : isInviteOnly && !isOracleInvited
                            ? t.inviteRequired
                            : t.selectPlan
                        }
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Feature Comparison Table */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-2xl text-foreground text-center mb-8">
            {t.features}
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-normal"></th>
                  {plans.map(plan => (
                    <th key={plan.id} className="p-4 text-center">
                      <span className="text-lg mr-2">{planStyles[plan.id]?.icon}</span>
                      <span className="text-foreground font-medium">
                        {plan.name?.[language]}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureMatrix.map((row, index) => (
                  <tr key={row.key} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                    <td className="p-4 text-muted-foreground">
                      {fl[row.key]}
                    </td>
                    <td className="p-4 text-center">{renderFeatureValue(row.free)}</td>
                    <td className="p-4 text-center">{renderFeatureValue(row.soul)}</td>
                    <td className="p-4 text-center">{renderFeatureValue(row.initiation)}</td>
                    <td className="p-4 text-center">{renderFeatureValue(row.oracle)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* Invite Code Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto text-center"
          >
            <Gift className="w-10 h-10 text-accent mx-auto mb-4" />
            <h3 className="font-serif text-xl text-foreground mb-2">
              {t.inviteCode}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t.inviteCodeHint}
            </p>
            
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={t.inviteCodePlaceholder}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="bg-background"
                data-testid="invite-code-input"
              />
              <Button 
                onClick={handleRedeemCode}
                disabled={isLoading || !inviteCode.trim()}
                className="shrink-0"
                data-testid="redeem-code-btn"
              >
                {t.redeem}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Disclaimer */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <p className="text-xs text-muted-foreground text-center">
            {t.disclaimer}
          </p>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPage;
