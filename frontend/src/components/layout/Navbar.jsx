import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Menu, Crown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";

export const Navbar = ({ isDark, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { t, language, toggleLanguage } = useLanguage();

  // Navigation links with translation
  const navLinks = [
    { href: "/", label: t('nav.home') },
    { href: "/sehirler", label: t('nav.cities') },
    { href: "/bilinc", label: t('nav.bilinc') },
    { href: "/frekans", label: t('nav.frekans') },
    { href: "/rituel", label: t('nav.rituel') },
    { href: "/sanriya-sor", label: t('nav.sanri') },
    { href: "/gorselin", label: t('nav.gorselin'), isNew: true },
    { href: "/bilinc-alani", label: t('nav.bilincAlani'), isPremium: true },
    { href: "/hakkinda", label: t('nav.about') },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-navbar py-3"
          : "bg-gradient-to-b from-background/80 to-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shadow-sm">
            <span className="text-primary font-serif text-xl">∞</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl tracking-wide text-foreground group-hover:text-primary transition-colors nav-text-shadow">
              CAELINUS
            </span>
            <span className="text-[10px] tracking-[0.2em] text-foreground/60 uppercase">
              {language === 'en' ? "Goddesses of Anatolia" : "Anadolu'nun Tanrıçaları"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Enhanced Readability */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`nav-link text-base xl:text-lg font-medium tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
                location.pathname === link.href
                  ? "text-primary nav-link-active"
                  : "text-foreground/80 hover:text-primary"
              }`}
            >
              {link.isPremium && <Crown className="h-3.5 w-3.5 text-accent" />}
              {link.isNew && (
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 rounded-full uppercase tracking-wider font-semibold">
                  {t('common.new')}
                </span>
              )}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="rounded-full hover:bg-primary/10 px-3 hidden sm:flex items-center gap-1.5"
            data-testid="nav-language-toggle"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium">{language.toUpperCase()}</span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-primary/10 h-10 w-10"
            data-testid="theme-toggle"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-5 w-5 text-accent" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-5 w-5 text-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background/98 backdrop-blur-xl border-l border-border/50">
              <div className="flex flex-col h-full pt-12">
                {/* Mobile Language Toggle */}
                <div className="flex justify-center mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLanguage}
                    className="rounded-full px-4 flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{language === 'tr' ? 'Türkçe' : 'English'}</span>
                  </Button>
                </div>

                <nav className="flex flex-col gap-5">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`text-xl font-serif transition-colors block py-2 flex items-center gap-2 ${
                          location.pathname === link.href
                            ? "text-primary border-l-2 border-primary pl-4"
                            : "text-foreground/70 hover:text-foreground pl-4"
                        }`}
                      >
                        {link.isPremium && <Crown className="h-4 w-4 text-accent" />}
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                
                <div className="mt-auto pb-8">
                  <p className="text-sm text-foreground/50 font-serif italic">
                    "{t('footer.quote')}"
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};
