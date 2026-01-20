import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Filter, Grid, List, Sparkles, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCitiesByLanguage, getElements } from "@/data/cities";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium, FEATURES } from "@/contexts/PremiumContext";
import { UpgradeModal } from "@/components/premium/PremiumComponents";

const CitiesPage = () => {
  const { language, t } = useLanguage();
  const { 
    isPremium, 
    getContentLimit, 
    showUpgradeModal,
    isUpgradeModalOpen,
    hideUpgradeModal 
  } = usePremium();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedElement, setSelectedElement] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  
  // Get content limit for cities
  const citiesLimit = getContentLimit('cities_list');

  // Get cities and elements based on current language
  const citiesData = useMemo(() => getCitiesByLanguage(language), [language]);
  const elements = useMemo(() => getElements(language), [language]);

  const filteredCities = useMemo(() => {
    return citiesData.filter(city => {
      const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           city.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesElement = selectedElement === "all" || city.element === selectedElement;
      return matchesSearch && matchesElement;
    });
  }, [citiesData, searchQuery, selectedElement]);
  
  // Limit cities for free users
  const displayCities = useMemo(() => {
    if (citiesLimit === -1) return filteredCities;
    return filteredCities.slice(0, citiesLimit);
  }, [filteredCities, citiesLimit]);
  
  const lockedCount = filteredCities.length - displayCities.length;

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm tracking-widest uppercase mb-4 block">
              {language === 'en' ? 'Anatolia Mode' : 'Anadolu Modu'}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-4">
              {t('cities.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('cities.subtitle')}
              {language === 'tr' && ' 01\'den 81\'e, Anadolu\'nun ruh haritasını keşfet.'}
              {language === 'en' && ' From 01 to 81, discover the soul map of Anatolia.'}
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('cities.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
                data-testid="city-search-input"
              />
            </div>
            <Select value={selectedElement} onValueChange={setSelectedElement}>
              <SelectTrigger className="w-full sm:w-48 bg-background" data-testid="element-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={language === 'en' ? 'Select Element' : 'Element Seç'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('cities.allElements')}</SelectItem>
                {elements.map(element => (
                  <SelectItem key={element} value={element}>{element}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="shrink-0"
                data-testid="view-grid-btn"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="shrink-0"
                data-testid="view-list-btn"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cities Grid/List */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">
              {isPremium 
                ? `${filteredCities.length} ${language === 'en' ? 'cities shown' : 'şehir gösteriliyor'}`
                : `${displayCities.length}/${filteredCities.length} ${language === 'en' ? 'cities shown' : 'şehir gösteriliyor'}`
              }
            </p>
            {!isPremium && lockedCount > 0 && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                {lockedCount} {language === 'en' ? 'locked' : 'kilitli'}
              </Badge>
            )}
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayCities.map((city, index) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link to={`/sehir/${city.id}`} data-testid={`city-card-${city.id}`}>
                    <Card className="group h-full border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300 overflow-hidden">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                          <span className="font-serif text-lg text-primary">
                            {String(city.id).padStart(2, '0')}
                          </span>
                        </div>
                        <h3 className="font-serif text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                          {city.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{city.symbol}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
              
              {/* Locked Cities Preview */}
              {!isPremium && lockedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: displayCities.length * 0.02 }}
                  className="col-span-2"
                >
                  <Card 
                    className="h-full border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer"
                    onClick={() => showUpgradeModal(FEATURES.CITIES_FULL)}
                    data-testid="unlock-cities-card"
                  >
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[140px]">
                      <Lock className="h-8 w-8 text-primary mb-3" />
                      <p className="text-sm text-foreground font-medium mb-1">
                        +{lockedCount} {language === 'en' ? 'more cities' : 'şehir daha'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'en' ? 'Unlock full access' : 'Tam erişimi aç'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayCities.map((city, index) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link to={`/sehir/${city.id}`} data-testid={`city-list-${city.id}`}>
                    <Card className="group border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <span className="font-serif text-lg text-primary">
                            {String(city.id).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                            {city.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {city.description}
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {city.symbol}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {city.element}
                          </Badge>
                        </div>
                        <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
              
              {/* Locked Cities - List View */}
              {!isPremium && lockedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: displayCities.length * 0.02 }}
                >
                  <Card 
                    className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer"
                    onClick={() => showUpgradeModal(FEATURES.CITIES_FULL)}
                    data-testid="unlock-cities-list"
                  >
                    <CardContent className="p-4 flex items-center justify-center gap-4">
                      <Lock className="h-6 w-6 text-primary" />
                      <span className="text-sm text-foreground">
                        +{lockedCount} {language === 'en' ? 'more cities - Unlock full access' : 'şehir daha - Tam erişimi aç'}
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {filteredCities.length === 0 && (
            <div className="text-center py-16">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-xl text-foreground mb-2">
                {language === 'en' ? 'No Results Found' : 'Sonuç Bulunamadı'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Try a different search term.' : 'Farklı bir arama terimi deneyin.'}
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={hideUpgradeModal}
        feature={FEATURES.CITIES_FULL}
      />
    </div>
  );
};

export default CitiesPage;
