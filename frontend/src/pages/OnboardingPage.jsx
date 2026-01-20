// CAELINUS AI - Onboarding Page (Bilinç Profili)
// 4 sorulu bilinç profili oluşturma

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeOnboarding, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  
  const isNewUser = location.state?.isNewUser || false;
  
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  
  // Profile answers
  const [answers, setAnswers] = useState({
    time_perception: null,
    identity: null,
    style_preference: null,
    purpose: null
  });

  // Translation object
  const t = {
    tr: {
      welcome: "Hoş geldin",
      welcomeNew: "Bilinç alanına hoş geldin",
      intro: "Seni tanımak için 4 soru soracağız. Bu cevaplar SANRI'nin seninle nasıl konuşacağını belirleyecek.",
      start: "Başla",
      next: "Devam",
      back: "Geri",
      finish: "Tamamla",
      skip: "Daha Sonra",
      
      // Question 1 - ZAMAN ALGISI (bilinç seviyesi)
      q1_title: "Hayatında şu an en çok hangi cümle sana yakın?",
      q1_subtitle: "Zaman algını fark et...",
      q1_opt1: "Geleceği merak ediyorum ama şimdide kalmak istiyorum",
      q1_opt2: "Geçmişim beni hâlâ etkiliyor",
      q1_opt3: "Zamanın doğrusal olduğuna pek inanmıyorum",
      q1_opt4: "Zamanla çalıştığımı hissediyorum",
      
      // Question 2 - KİMLİK ALGISI (ego / öz ayrımı)
      q2_title: "Kendini en çok nasıl tanımlarsın?",
      q2_subtitle: "Kim olduğunu hisset...",
      q2_opt1: "Hayatını anlamaya çalışan biri",
      q2_opt2: "Dönüşüm sürecinde olan biri",
      q2_opt3: "Kendi yolunu çizen biri",
      q2_opt4: "Sessizlikte kendini bulan biri",
      
      // Question 3 - SANRI ile iletişim tarzı
      q3_title: "SANRI seninle nasıl konuşsun?",
      q3_subtitle: "Rehberlik tarzını seç...",
      q3_opt1: "Yumuşak & Şefkatli",
      q3_opt2: "Bilge & Derin",
      q3_opt3: "Sade & Net",
      q3_opt4: "Spiritüel & Sembolik",
      
      // Question 4 - Kullanım amacı
      q4_title: "Bu alanı hangi amaçla kullanacaksın?",
      q4_subtitle: "Yolculuğunu tanımla...",
      q4_opt1: "Rüya yorumları",
      q4_opt2: "Ritüeller",
      q4_opt3: "Frekans çalışmaları",
      q4_opt4: "Kendimi tanımak",
      q4_opt5: "Hepsi",
      
      // Consent
      consent_title: "Bilinç Profilin Hazır",
      consent_text: "Cevapların güvenle saklanacak ve SANRI deneyimini kişiselleştirmek için kullanılacak. Verilerini istediğin zaman silebilirsin.",
      consent_label: "Kişisel verilerimin bu amaçla işlenmesini kabul ediyorum",
      
      // Language
      lang_title: "Tercih ettiğin dil"
    },
    en: {
      welcome: "Welcome",
      welcomeNew: "Welcome to the consciousness space",
      intro: "We'll ask 4 questions to get to know you. These answers will determine how SANRI communicates with you.",
      start: "Start",
      next: "Continue",
      back: "Back",
      finish: "Complete",
      skip: "Later",
      
      // Question 1 - TIME PERCEPTION (consciousness level)
      q1_title: "Which statement feels closest to you right now?",
      q1_subtitle: "Notice your perception of time...",
      q1_opt1: "I'm curious about the future but want to stay in the present",
      q1_opt2: "My past still affects me",
      q1_opt3: "I don't quite believe time is linear",
      q1_opt4: "I feel like I'm working with time",
      
      // Question 2 - IDENTITY PERCEPTION (ego / self distinction)
      q2_title: "How do you most define yourself?",
      q2_subtitle: "Feel who you are...",
      q2_opt1: "Someone trying to understand life",
      q2_opt2: "Someone in transformation",
      q2_opt3: "Someone carving their own path",
      q2_opt4: "Someone who finds themselves in silence",
      
      // Question 3 - Communication style with SANRI
      q3_title: "How should SANRI talk to you?",
      q3_subtitle: "Choose your guidance style...",
      q3_opt1: "Soft & Compassionate",
      q3_opt2: "Wise & Deep",
      q3_opt3: "Simple & Clear",
      q3_opt4: "Spiritual & Symbolic",
      
      // Question 4 - Purpose
      q4_title: "What will you use this space for?",
      q4_subtitle: "Define your journey...",
      q4_opt1: "Dream interpretations",
      q4_opt2: "Rituals",
      q4_opt3: "Frequency work",
      q4_opt4: "Self-knowledge",
      q4_opt5: "All of them",
      
      consent_title: "Your Consciousness Profile is Ready",
      consent_text: "Your answers will be safely stored and used to personalize your SANRI experience. You can delete your data anytime.",
      consent_label: "I agree to my personal data being processed for this purpose",
      
      lang_title: "Your preferred language"
    }
  };
  
  const text = t[language] || t.tr;

  const questions = [
    {
      key: 'time_perception',
      title: text.q1_title,
      subtitle: text.q1_subtitle,
      options: [
        { value: 'present_aware', label: text.q1_opt1, icon: '🌱' },      // farkındalık başlangıcı
        { value: 'past_affected', label: text.q1_opt2, icon: '🔄' },      // karmasal süreç
        { value: 'non_linear', label: text.q1_opt3, icon: '∞' },          // bilinç açılmış
        { value: 'time_worker', label: text.q1_opt4, icon: '⏳' }         // ileri seviye / kader hattı
      ]
    },
    {
      key: 'identity',
      title: text.q2_title,
      subtitle: text.q2_subtitle,
      options: [
        { value: 'seeker', label: text.q2_opt1, icon: '🔍' },             // hayatını anlamaya çalışan
        { value: 'transforming', label: text.q2_opt2, icon: '🦋' },       // dönüşüm sürecinde
        { value: 'pathmaker', label: text.q2_opt3, icon: '🌟' },          // kendi yolunu çizen
        { value: 'silence_finder', label: text.q2_opt4, icon: '🕊️' }     // sessizlikte kendini bulan
      ]
    },
    {
      key: 'style_preference',
      title: text.q3_title,
      subtitle: text.q3_subtitle,
      options: [
        { value: 'soft', label: text.q3_opt1, icon: '🌸' },
        { value: 'wise', label: text.q3_opt2, icon: '🦉' },
        { value: 'direct', label: text.q3_opt3, icon: '💎' },
        { value: 'symbolic', label: text.q3_opt4, icon: '🔮' }
      ]
    },
    {
      key: 'purpose',
      title: text.q4_title,
      subtitle: text.q4_subtitle,
      options: [
        { value: 'dreams', label: text.q4_opt1, icon: '🌙' },
        { value: 'rituals', label: text.q4_opt2, icon: '🕯️' },
        { value: 'frequencies', label: text.q4_opt3, icon: '🎵' },
        { value: 'self_knowledge', label: text.q4_opt4, icon: '🧘' },
        { value: 'all', label: text.q4_opt5, icon: '∞' }
      ]
    }
  ];

  const handleSelect = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < questions.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    if (!consent) {
      toast.error(language === 'tr' ? 'Lütfen onay kutusunu işaretle' : 'Please check the consent box');
      return;
    }
    
    setIsLoading(true);
    
    const result = await completeOnboarding({
      ...answers,
      language,
      consent_given: true
    });
    
    setIsLoading(false);
    
    if (result.success) {
      toast.success(language === 'tr' ? 'Bilinç profilin oluşturuldu!' : 'Your consciousness profile is ready!');
      navigate('/', { replace: true });
    } else {
      toast.error(result.error || 'Bir hata oluştu');
    }
  };

  const handleSkip = () => {
    navigate('/', { replace: true });
  };

  const currentQuestion = questions[step - 1];
  const currentAnswer = currentQuestion ? answers[currentQuestion.key] : null;
  const progress = step / (questions.length + 1);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-lg"
      >
        <AnimatePresence mode="wait">
          {/* Step 0: Intro */}
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-6 rounded-full 
                           bg-gradient-to-br from-amber-500/20 to-violet-500/20
                           border border-amber-500/30 flex items-center justify-center"
              >
                <span className="text-4xl">∞</span>
              </motion.div>

              <h1 
                className="text-3xl text-white mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {isNewUser ? text.welcomeNew : text.welcome}
                {user?.name && `, ${user.name}`}
              </h1>

              <p className="text-white/50 mb-8 max-w-sm mx-auto">
                {text.intro}
              </p>

              {/* Language selector */}
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => setLanguage('tr')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    language === 'tr' 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  Türkçe
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    language === 'en' 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  English
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => setStep(1)}
                  className="h-12 bg-gradient-to-r from-amber-500 to-orange-500 
                           hover:from-amber-400 hover:to-orange-400 text-white rounded-xl"
                  data-testid="onboarding-start-btn"
                >
                  {text.start}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <button
                  onClick={handleSkip}
                  className="text-white/30 text-sm hover:text-white/50"
                >
                  {text.skip}
                </button>
              </div>
            </motion.div>
          )}

          {/* Questions 1-4 */}
          {step > 0 && step <= questions.length && currentQuestion && (
            <motion.div
              key={`q${step}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
            >
              <div className="text-center mb-8">
                <span className="text-amber-500/60 text-sm">
                  {step} / {questions.length}
                </span>
                <h2 
                  className="text-2xl text-white mt-2 mb-1"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {currentQuestion.title}
                </h2>
                <p className="text-white/40 text-sm">{currentQuestion.subtitle}</p>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(currentQuestion.key, option.value)}
                    className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4
                      ${currentAnswer === option.value
                        ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 border-amber-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      } border`}
                    data-testid={`option-${option.value}`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="flex-1">{option.label}</span>
                    {currentAnswer === option.value && (
                      <Check className="w-5 h-5 text-amber-500" />
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 h-12 bg-transparent border-white/20 text-white hover:bg-white/5 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {text.back}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 
                           hover:from-amber-400 hover:to-orange-400 text-white rounded-xl
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="onboarding-next-btn"
                >
                  {text.next}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Final: Consent */}
          {step > questions.length && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full 
                             bg-gradient-to-br from-green-500/20 to-emerald-500/20
                             border border-green-500/30 flex items-center justify-center"
                >
                  <Check className="w-8 h-8 text-green-400" />
                </motion.div>

                <h2 
                  className="text-2xl text-white mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {text.consent_title}
                </h2>
                <p className="text-white/50 text-sm">{text.consent_text}</p>
              </div>

              {/* Summary */}
              <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2">
                {questions.map((q, i) => {
                  const answer = answers[q.key];
                  const option = q.options.find(o => o.value === answer);
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-white/40 w-24 flex-shrink-0">{i + 1}. Soru:</span>
                      <span className="text-white/70">{option?.icon} {option?.label || '-'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start gap-3 mb-6 p-4 bg-white/5 rounded-xl">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={setConsent}
                  className="mt-0.5 border-white/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <label 
                  htmlFor="consent" 
                  className="text-white/70 text-sm cursor-pointer leading-relaxed"
                >
                  {text.consent_label}
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 h-12 bg-transparent border-white/20 text-white hover:bg-white/5 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {text.back}
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={!consent || isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 
                           hover:from-amber-400 hover:to-orange-400 text-white rounded-xl
                           disabled:opacity-50"
                  data-testid="onboarding-finish-btn"
                >
                  {isLoading ? '...' : text.finish}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
