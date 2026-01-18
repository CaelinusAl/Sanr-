import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
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
              Anadolu'nun Uyanan Tanrıçaları, kolektif hafızayı uyandıran ve iç yansımayı 
              destekleyen sembolik bir dijital deneyimdir.
            </p>
            <p className="text-sm text-muted-foreground font-serif italic">
              "Hatırlamak dışarıda başlar. Anlamak içeride olur."
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-lg text-foreground mb-6">Keşfet</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/sehirler" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                81 Şehir Haritası
              </Link>
              <Link to="/okuma-katmanlari" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Okuma Katmanları
              </Link>
              <Link to="/sanriya-sor" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                SANRI'ya Sor
              </Link>
              <Link to="/hakkinda" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Kitap Hakkında
              </Link>
            </nav>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-serif text-lg text-foreground mb-6">Bilgi</h4>
            <nav className="flex flex-col gap-3">
              <span className="text-muted-foreground text-sm">
                © 2024 Caelinus
              </span>
              <span className="text-muted-foreground text-sm">
                Tüm hakları saklıdır
              </span>
            </nav>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Bu uygulama bilgi vermez, anlam üretir. Kehanet, teşhis veya kesinlik sunmaz.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground">01 → 81</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground">Anadolu Modu</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground">SANRI Modu</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
