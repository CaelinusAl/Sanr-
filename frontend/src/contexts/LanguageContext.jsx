import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  tr: {
    // Splash & Home
    tagline: 'Bilinç ve Anlam Zekâsı',
    motto: 'Bilgi değil, idrak üretir.',
    subMotto: 'Soruların seni hatırlatmak için var.',
    
    // Navigation sections
    sections: {
      bilinc: {
        title: 'Bilinç',
        subtitle: 'Metinler & farkındalık'
      },
      frekans: {
        title: 'Frekans',
        subtitle: 'Enerji kartları & titreşim'
      },
      sanri: {
        title: "Sanrı'ya Sor",
        subtitle: 'Rüya • Sembol • Doğum • Matrix'
      },
      gorselin: {
        title: 'Görselin',
        subtitle: 'Hologram • Sembolik Okuma'
      },
      rituel: {
        title: 'Ritüel',
        subtitle: 'Başlat • Nefes • Hatırlama'
      },
      profil: {
        title: 'Profil',
        subtitle: 'Yolculuğun'
      }
    },
    
    // Sanri page
    sanri: {
      listening: 'Sanrı seni dinliyor.',
      writeQuestion: 'Sorunu yaz.',
      hint: 'Yorum değil, farkındalık alacaksın.',
      placeholder: 'Rüyanı, sembolünü veya sorununu paylaş...',
      send: 'Gönder',
      options: {
        text: 'Metin yaz',
        image: 'Görsel yükle',
        dream: 'Rüya anlat',
        date: 'Tarih gir'
      }
    },
    
    // Premium
    premium: 'Premium',
    
    // Common
    loading: 'Yükleniyor...',
    explore: 'Keşfet',
    start: 'Başla'
  },
  en: {
    // Splash & Home
    tagline: 'Consciousness & Symbolic Intelligence',
    motto: 'Not knowledge, but awareness.',
    subMotto: 'Questions exist to remind you.',
    
    // Navigation sections
    sections: {
      bilinc: {
        title: 'Consciousness',
        subtitle: 'Texts & awareness'
      },
      frekans: {
        title: 'Frequency',
        subtitle: 'Energy cards & vibration'
      },
      sanri: {
        title: 'Ask Sanri',
        subtitle: 'Dream • Symbol • Birth • Matrix'
      },
      gorselin: {
        title: 'Visualin',
        subtitle: 'Hologram • Symbolic Reading'
      },
      rituel: {
        title: 'Ritual',
        subtitle: 'Begin • Breathe • Remember'
      },
      profil: {
        title: 'Profile',
        subtitle: 'Your journey'
      }
    },
    
    // Sanri page
    sanri: {
      listening: 'Sanri is listening.',
      writeQuestion: 'Write your question.',
      hint: 'You will receive awareness, not interpretation.',
      placeholder: 'Share your dream, symbol, or question...',
      send: 'Send',
      options: {
        text: 'Write text',
        image: 'Upload image',
        dream: 'Tell a dream',
        date: 'Enter date'
      }
    },
    
    // Premium
    premium: 'Premium',
    
    // Common
    loading: 'Loading...',
    explore: 'Explore',
    start: 'Begin'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('caelinus-language');
    return saved || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('caelinus-language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'tr' ? 'en' : 'tr');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
