import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Sparkles, Compass, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCitiesByLanguage, getCityById } from "@/data/cities";
import { useLanguage } from "@/contexts/LanguageContext";

const CityDetailPage = () => {
  const { cityId } = useParams();
  const { language, t } = useLanguage();
  
  const city = getCityById(cityId, language);
  const allCities = getCitiesByLanguage(language);
  
  if (!city) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-foreground mb-4">
            {language === 'en' ? 'City Not Found' : 'Şehir Bulunamadı'}
          </h1>
          <Button asChild variant="outline">
            <Link to="/sehirler">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Back to Cities' : 'Şehirlere Dön'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const prevCity = city.id > 1 ? allCities.find(c => c.id === city.id - 1) : null;
  const nextCity = city.id < 81 ? allCities.find(c => c.id === city.id + 1) : null;
  const relatedCities = allCities.filter(c => c.element === city.element && c.id !== city.id).slice(0, 4);

  // Generate symbolic reading based on city and language
  const generateReading = (city, lang) => {
    if (lang === 'en') {
      return [
        `${city.name} speaks with the symbol of ${city.symbol}. This symbol is the carrier of the ${city.element} element in collective memory.`,
        `${city.description} Walking on these lands is building a bridge between past and present.`,
        `Number ${city.id} is the spiritual coordinate of this city. Each number is a gate, each gate a remembrance.`
      ];
    }
    return [
      `${city.name}, ${city.symbol} sembolüyle konuşur. Bu sembol, kolektif hafızada ${city.element} elementinin taşıyıcısıdır.`,
      `${city.description} Bu topraklarda yürümek, geçmişle şimdi arasında bir köprü kurmaktır.`,
      `Sayı ${city.id}, bu şehrin ruhani koordinatıdır. Her sayı bir kapı, her kapı bir hatırlamadır.`
    ];
  };

  const readings = generateReading(city, language);

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1638832349634-a64f8ccd73a5?w=1920&q=80')`,
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
          >
            <Button asChild variant="ghost" className="hover:bg-primary/10">
              <Link to="/sehirler">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === 'en' ? 'Back to Cities' : 'Şehirlere Dön'}
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              {prevCity && (
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to={`/sehir/${prevCity.id}`}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">{prevCity.name}</span>
                  </Link>
                </Button>
              )}
              {nextCity && (
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to={`/sehir/${nextCity.id}`}>
                    <span className="hidden sm:inline mr-1">{nextCity.name}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>

          {/* City Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <span className="font-serif text-4xl text-primary">
                {String(city.id).padStart(2, '0')}
              </span>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl text-foreground mb-4">
              {city.name}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge variant="secondary" className="text-sm px-4 py-1">
                {city.symbol}
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-1">
                {city.element}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground font-serif italic">
              {city.description}
            </p>
          </motion.div>
        </div>
      </section>

      <Separator />

      {/* Symbolic Reading */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-2xl text-foreground">
                {language === 'en' ? 'Symbolic Reading' : 'Sembolik Okuma'}
              </h2>
            </div>
            
            <div className="space-y-6">
              {readings.map((reading, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="text-muted-foreground leading-relaxed pl-6 border-l-2 border-primary/30"
                >
                  {reading}
                </motion.p>
              ))}
            </div>

            <Card className="mt-12 border-border/50 bg-muted/30">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground text-center italic">
                  {language === 'en' 
                    ? 'This reading produces symbolic meaning. It does not offer prophecy, diagnosis, or certainty. It opens perspective, then withdraws.'
                    : 'Bu okuma, sembolik anlam üretir. Kehanet, teşhis veya kesinlik sunmaz. Perspektif açar, geri çekilir.'
                  }
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Related Cities */}
      {relatedCities.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-8">
                <Compass className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-2xl text-foreground">
                  {language === 'en' ? `Same Element: ${city.element}` : `Aynı Element: ${city.element}`}
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedCities.map((relatedCity, index) => (
                  <motion.div
                    key={relatedCity.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/sehir/${relatedCity.id}`}>
                      <Card className="group h-full border-border/50 bg-background/50 hover:bg-background hover:border-primary/30 transition-all duration-300">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                            <span className="font-serif text-sm text-primary">
                              {String(relatedCity.id).padStart(2, '0')}
                            </span>
                          </div>
                          <h3 className="font-serif text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                            {relatedCity.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">{relatedCity.symbol}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-muted-foreground mb-6">
              {language === 'en' 
                ? 'Would you like a deeper reflection on the symbol of this city?'
                : 'Bu şehrin sembolü hakkında daha derin bir yansıma ister misin?'
              }
            </p>
            <Button asChild className="rounded-full px-8">
              <Link to="/sanriya-sor">
                <Sparkles className="mr-2 h-4 w-4" />
                {t('cities.askSanri')}
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CityDetailPage;
