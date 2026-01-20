import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { language, t } = useLanguage();

  // Footer-specific translations
  const footerContent = {
    tr: {
      brandDesc: "Anadolu'nun Uyanan Tanrıçaları, kolektif hafızayı uyandıran ve iç yansımayı destekleyen sembolik bir dijital deneyimdir.",
      explore: "Keşfet",
      citiesMap: "81 Şehir Haritası",
      readingLayers: "Okuma Katmanları",
      askSanri: "SANRI'ya Sor",
      aboutBook: "Kitap Hakkında",
      info: "Bilgi",
      allRights: "Tüm hakları saklıdır",
      disclaimer: "Bu uygulama bilgi vermez, anlam üretir. Kehanet, teşhis veya kesinlik sunmaz.",
      anatoliaMode: "Anadolu Modu",
      sanriMode: "SANRI Modu"
    },
    en: {
      brandDesc: "Awakening Goddesses of Anatolia, a symbolic digital experience that awakens collective memory and supports inner reflection.",
      explore: "Explore",
      citiesMap: "81 Cities Map",
      readingLayers: "Reading Layers",
      askSanri: "Ask SANRI",
      aboutBook: "About",
      info: "Info",
      allRights: "All rights reserved",
      disclaimer: "This app does not provide information, it produces meaning. It does not offer prophecy, diagnosis, or certainty.",
      anatoliaMode: "Anatolia Mode",
      sanriMode: "SANRI Mode"
    }
  };

  const fc = footerContent[language] || footerContent.tr;

  return (
    <footer className="bg-card/50 border-t border-border">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-serif text-xl">∞</span>
              </div>
              <div>
                <span className="font-serif text-2xl tracking-wide text-foreground">
                  CAELINUS
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed mb-6">
              {fc.brandDesc}
            </p>
            <p className="text-sm text-muted-foreground font-serif italic">
              "{t('footer.quote')}"
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-lg text-foreground mb-6">{fc.explore}</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/sehirler" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {fc.citiesMap}
              </Link>
              <Link to="/okuma-katmanlari" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {fc.readingLayers}
              </Link>
              <Link to="/sanriya-sor" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {fc.askSanri}
              </Link>
              <Link to="/hakkinda" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {fc.aboutBook}
              </Link>
            </nav>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-serif text-lg text-foreground mb-6">{fc.info}</h4>
            <nav className="flex flex-col gap-3">
              <span className="text-muted-foreground text-sm">
                © 2025 Caelinus
              </span>
              <span className="text-muted-foreground text-sm">
                {fc.allRights}
              </span>
            </nav>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {fc.disclaimer}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground">01 → 81</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground">{fc.anatoliaMode}</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground">{fc.sanriMode}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
