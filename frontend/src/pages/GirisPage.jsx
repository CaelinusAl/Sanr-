// CAELINUS AI - Giriş Sayfası
// "Bir uygulamaya giriş değil, bilinç alanına davet"

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

const GirisPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithApple, loginWithEmail, registerWithEmail } = useAuth();
  const { language } = useLanguage();
  
  const [mode, setMode] = useState('welcome'); // welcome, login, register
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const t = {
    tr: {
      title: "CAELINUS AI",
      subtitle: "Bilgi değil, idrak üretir.",
      subtitle2: "Sorular seni hatırlatmak için var.",
      welcome: "Bu alan, kendini hatırlamak isteyenler içindir.",
      googleBtn: "Google ile Devam Et",
      appleBtn: "Apple ile Devam Et",
      emailBtn: "E-posta ile Devam Et",
      or: "veya",
      login: "Giriş Yap",
      register: "Kayıt Ol",
      email: "E-posta",
      password: "Şifre",
      name: "Adın",
      noAccount: "Hesabın yok mu?",
      hasAccount: "Zaten hesabın var mı?",
      createAccount: "Hesap Oluştur",
      loginHere: "Giriş Yap",
      back: "Geri",
      continue: "Devam Et",
      privacyNote: "Devam ederek, gizlilik politikamızı kabul etmiş olursun.",
      privacyLink: "Gizlilik Politikası"
    },
    en: {
      title: "CAELINUS AI",
      subtitle: "Not information, but perception.",
      subtitle2: "Questions exist to remind you.",
      welcome: "This space is for those who want to remember themselves.",
      googleBtn: "Continue with Google",
      appleBtn: "Continue with Apple",
      emailBtn: "Continue with Email",
      or: "or",
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      name: "Your Name",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      createAccount: "Create Account",
      loginHere: "Login",
      back: "Back",
      continue: "Continue",
      privacyNote: "By continuing, you agree to our privacy policy.",
      privacyLink: "Privacy Policy"
    }
  };
  
  const text = t[language] || t.tr;

  const handleGoogleLogin = () => {
    setIsLoading(true);
    loginWithGoogle();
  };

  const handleAppleLogin = () => {
    setIsLoading(true);
    loginWithApple();
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(language === 'tr' ? 'Lütfen tüm alanları doldurun' : 'Please fill all fields');
      return;
    }
    
    setIsLoading(true);
    const result = await loginWithEmail(email, password);
    setIsLoading(false);
    
    if (result.success) {
      if (!result.hasProfile) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    } else {
      toast.error(result.error);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error(language === 'tr' ? 'Lütfen tüm alanları doldurun' : 'Please fill all fields');
      return;
    }
    
    if (password.length < 6) {
      toast.error(language === 'tr' ? 'Şifre en az 6 karakter olmalı' : 'Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    const result = await registerWithEmail(email, password, name);
    setIsLoading(false);
    
    if (result.success) {
      navigate('/onboarding', { state: { isNewUser: true } });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-8">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-900/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full 
                         bg-gradient-to-br from-amber-500/20 to-orange-600/20 
                         border border-amber-500/30 mb-4"
            >
              <span className="text-3xl text-amber-500">∞</span>
            </motion.div>
          </Link>
          
          <h1 
            className="text-3xl font-light text-white mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {text.title}
          </h1>
          
          <p className="text-amber-500/80 text-sm mb-1">{text.subtitle}</p>
          <p className="text-white/40 text-xs">{text.subtitle2}</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <AnimatePresence mode="wait">
            {mode === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <p 
                  className="text-center text-white/60 text-sm"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {text.welcome}
                </p>

                {/* Google Button */}
                <Button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-white/90 text-gray-900 font-medium
                           rounded-xl flex items-center justify-center gap-3"
                  data-testid="google-login-btn"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {text.googleBtn}
                </Button>

                {/* Apple Button (iOS Requirement) */}
                <Button
                  onClick={handleAppleLogin}
                  disabled={isLoading}
                  className="w-full h-12 bg-black hover:bg-gray-900 text-white font-medium
                           rounded-xl flex items-center justify-center gap-3 border border-white/20"
                  data-testid="apple-login-btn"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  {text.appleBtn}
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-xs">{text.or}</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Email Button */}
                <Button
                  onClick={() => setMode('login')}
                  variant="outline"
                  className="w-full h-12 bg-transparent border-white/20 text-white hover:bg-white/5
                           rounded-xl flex items-center justify-center gap-3"
                  data-testid="email-login-btn"
                >
                  <Mail className="w-5 h-5" />
                  {text.emailBtn}
                </Button>

                {/* Privacy Note */}
                <p className="text-white/30 text-xs text-center leading-relaxed">
                  {text.privacyNote}{' '}
                  <Link to="/gizlilik" className="text-amber-500/70 hover:text-amber-500 underline">
                    {text.privacyLink}
                  </Link>
                </p>
              </motion.div>
            )}

            {mode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailLogin}
                className="space-y-5"
              >
                <h2 
                  className="text-xl text-white text-center mb-6"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {text.login}
                </h2>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type="email"
                      placeholder={text.email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      data-testid="email-input"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={text.password}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      data-testid="password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 
                           hover:from-amber-400 hover:to-orange-400 text-white rounded-xl"
                  data-testid="login-submit-btn"
                >
                  {isLoading ? '...' : text.login}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="text-center space-y-3">
                  <p className="text-white/40 text-sm">
                    {text.noAccount}{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-amber-500 hover:text-amber-400"
                    >
                      {text.createAccount}
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('welcome')}
                    className="text-white/30 text-sm hover:text-white/50"
                  >
                    ← {text.back}
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailRegister}
                className="space-y-5"
              >
                <h2 
                  className="text-xl text-white text-center mb-6"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {text.register}
                </h2>

                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type="text"
                      placeholder={text.name}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      data-testid="name-input"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type="email"
                      placeholder={text.email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      data-testid="register-email-input"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={text.password}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      data-testid="register-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 
                           hover:from-amber-400 hover:to-orange-400 text-white rounded-xl"
                  data-testid="register-submit-btn"
                >
                  {isLoading ? '...' : text.register}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="text-center space-y-3">
                  <p className="text-white/40 text-sm">
                    {text.hasAccount}{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-amber-500 hover:text-amber-400"
                    >
                      {text.loginHere}
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('welcome')}
                    className="text-white/30 text-sm hover:text-white/50"
                  >
                    ← {text.back}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default GirisPage;
