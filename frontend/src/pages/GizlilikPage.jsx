// CAELINUS AI - Gizlilik Politikası / Privacy Policy
// KVKK ve GDPR uyumlu

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Trash2, Download, Mail } from 'lucide-react';

const GizlilikPage = () => {
  const { language, setLanguage } = useLanguage();
  const lastUpdated = "20 Ocak 2026";

  const content = {
    tr: {
      title: "Gizlilik Politikası",
      subtitle: "Verileriniz bizim için önemlidir",
      lastUpdated: `Son güncelleme: ${lastUpdated}`,
      intro: `CAELINUS AI ("biz", "bizim" veya "uygulama"), kullanıcılarımızın gizliliğine saygı gösterir. Bu gizlilik politikası, hangi verileri topladığımızı, nasıl kullandığımızı ve haklarınızı açıklar.`,
      
      sections: [
        {
          icon: Database,
          title: "Toplanan Veriler",
          content: `Aşağıdaki verileri topluyoruz:

• **Hesap Bilgileri**: E-posta adresi, isim, profil fotoğrafı (Google/Apple girişi ile)
• **Bilinç Profili**: Onboarding sırasında verdiğiniz cevaplar (geliş nedeni, baskın duygu, iletişim tercihi, kullanım amacı)
• **Kullanım Verileri**: Hangi özellikleri kullandığınız, ritüel tamamlama durumu
• **Yüklenen Görseller**: GÖRSELİN özelliğinde yüklediğiniz görseller (sadece analiz için, saklanmaz)

**Toplamadığımız Veriler:**
• Konum bilgisi
• Cihaz tanımlayıcıları
• Finansal bilgiler (uygulama içi satın alma yoktur)`
        },
        {
          icon: Shield,
          title: "Verilerin Kullanımı",
          content: `Verilerinizi şu amaçlarla kullanıyoruz:

• **Kişiselleştirme**: SANRI'nın sizinle nasıl iletişim kuracağını belirlemek
• **Hizmet Sunumu**: Ritüeller, rüya yorumları ve bilinç deneyimleri sağlamak
• **Geliştirme**: Uygulamayı iyileştirmek için anonim kullanım istatistikleri

Verilerinizi **hiçbir üçüncü tarafla paylaşmıyoruz** veya **satmıyoruz**.

**AI Servisleri**: Rüya yorumları ve görsel analizi için OpenAI API kullanıyoruz. Gönderilen içerikler OpenAI tarafından model eğitimi için kullanılmaz.`
        },
        {
          icon: Trash2,
          title: "Haklarınız (KVKK/GDPR)",
          content: `Türkiye'deki KVKK ve AB'deki GDPR kapsamında aşağıdaki haklara sahipsiniz:

• **Erişim Hakkı**: Verilerinizin bir kopyasını talep edebilirsiniz
• **Silme Hakkı**: Hesabınızı ve tüm verilerinizi silebilirsiniz
• **Düzeltme Hakkı**: Yanlış bilgileri düzeltebilirsiniz
• **Taşınabilirlik**: Verilerinizi JSON formatında dışa aktarabilirsiniz
• **İtiraz Hakkı**: Veri işlemeye itiraz edebilirsiniz

Bu hakları kullanmak için:
1. Uygulama içi: Profil > Hesap > Verilerimi Dışa Aktar / Hesabı Sil
2. E-posta: privacy@caelinus.com`
        },
        {
          icon: Download,
          title: "Veri Saklama ve Güvenlik",
          content: `• **Saklama Süresi**: Hesabınız aktif olduğu sürece verileriniz saklanır. Hesap silme talebinden itibaren 30 gün içinde tüm veriler kalıcı olarak silinir.

• **Güvenlik**: Verileriniz şifrelenerek güvenli sunucularda saklanır. SSL/TLS ile iletim güvenliği sağlanır.

• **Yüklenen Görseller**: Analiz sonrası saklanmaz, sadece işleme süresi boyunca geçici olarak tutulur.`
        }
      ],
      
      contact: {
        title: "İletişim",
        content: "Gizlilik politikamızla ilgili sorularınız için:",
        email: "privacy@caelinus.com"
      },
      
      consent: "Bu uygulamayı kullanarak, bu gizlilik politikasını kabul etmiş olursunuz."
    },
    en: {
      title: "Privacy Policy",
      subtitle: "Your data matters to us",
      lastUpdated: `Last updated: January 20, 2026`,
      intro: `CAELINUS AI ("we", "our", or "the app") respects the privacy of our users. This privacy policy explains what data we collect, how we use it, and your rights.`,
      
      sections: [
        {
          icon: Database,
          title: "Data Collected",
          content: `We collect the following data:

• **Account Information**: Email address, name, profile picture (via Google/Apple sign-in)
• **Consciousness Profile**: Your answers during onboarding (reason for coming, dominant emotion, communication preference, usage purpose)
• **Usage Data**: Which features you use, ritual completion status
• **Uploaded Images**: Images you upload in GÖRSELİN feature (for analysis only, not stored)

**Data We Don't Collect:**
• Location data
• Device identifiers
• Financial information (no in-app purchases)`
        },
        {
          icon: Shield,
          title: "How We Use Data",
          content: `We use your data for:

• **Personalization**: Determining how SANRI communicates with you
• **Service Delivery**: Providing rituals, dream interpretations, and consciousness experiences
• **Improvement**: Anonymous usage statistics to improve the app

We **do not share or sell** your data to any third parties.

**AI Services**: We use OpenAI API for dream interpretations and image analysis. Content sent is not used by OpenAI for model training.`
        },
        {
          icon: Trash2,
          title: "Your Rights (KVKK/GDPR)",
          content: `Under Turkish KVKK and EU GDPR, you have the following rights:

• **Right to Access**: Request a copy of your data
• **Right to Deletion**: Delete your account and all data
• **Right to Correction**: Correct incorrect information
• **Portability**: Export your data in JSON format
• **Right to Object**: Object to data processing

To exercise these rights:
1. In-app: Profile > Account > Export My Data / Delete Account
2. Email: privacy@caelinus.com`
        },
        {
          icon: Download,
          title: "Data Storage & Security",
          content: `• **Retention Period**: Your data is stored as long as your account is active. All data is permanently deleted within 30 days of account deletion request.

• **Security**: Your data is encrypted and stored on secure servers. SSL/TLS ensures transmission security.

• **Uploaded Images**: Not stored after analysis, only kept temporarily during processing.`
        }
      ],
      
      contact: {
        title: "Contact",
        content: "For questions about our privacy policy:",
        email: "privacy@caelinus.com"
      },
      
      consent: "By using this app, you agree to this privacy policy."
    }
  };

  const t = content[language] || content.tr;

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/giris" 
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'tr' ? 'Geri' : 'Back'}
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <h1 
              className="text-3xl text-white font-light"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {t.title}
            </h1>
            
            {/* Language toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('tr')}
                className={`px-3 py-1 rounded text-sm ${language === 'tr' ? 'bg-amber-500/20 text-amber-400' : 'text-white/40'}`}
              >
                TR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded text-sm ${language === 'en' ? 'bg-amber-500/20 text-amber-400' : 'text-white/40'}`}
              >
                EN
              </button>
            </div>
          </div>
          
          <p className="text-white/60">{t.subtitle}</p>
          <p className="text-white/30 text-sm mt-2">{t.lastUpdated}</p>
        </div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6"
        >
          <p className="text-white/70 leading-relaxed">{t.intro}</p>
        </motion.div>

        {/* Sections */}
        {t.sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-xl p-6 border border-white/10 mb-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <section.icon className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-lg text-white font-medium">{section.title}</h2>
            </div>
            <div className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </motion.div>
        ))}

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Mail className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg text-white font-medium">{t.contact.title}</h2>
          </div>
          <p className="text-white/60 text-sm mb-2">{t.contact.content}</p>
          <a 
            href={`mailto:${t.contact.email}`}
            className="text-amber-500 hover:text-amber-400 text-sm"
          >
            {t.contact.email}
          </a>
        </motion.div>

        {/* Consent note */}
        <p className="text-white/30 text-xs text-center">{t.consent}</p>
      </div>
    </div>
  );
};

export default GizlilikPage;
