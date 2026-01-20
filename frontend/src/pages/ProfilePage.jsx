// CAELINUS AI - Bilinç Aynası (Consciousness Mirror) Profile Page
// User journey statistics, SANRI interactions, frequency progress

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  User, 
  Crown, 
  Infinity, 
  Moon, 
  Sparkles, 
  Target,
  Flame,
  Trophy,
  Calendar,
  MessageSquare,
  MapPin,
  Lock,
  ChevronRight,
  RefreshCw,
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium, FEATURES } from "@/contexts/PremiumContext";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal, PremiumBadge } from "@/components/premium/PremiumComponents";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Avatar symbol options
const AVATAR_SYMBOLS = ["∞", "☽", "✧", "◈", "❋", "✦", "◎", "❂", "✺", "☼"];

// Mode icons mapping
const MODE_ICONS = {
  dream: { icon: "🌙", label_tr: "Rüya", label_en: "Dream" },
  mirror: { icon: "🪞", label_tr: "Ayna", label_en: "Mirror" },
  divine: { icon: "✨", label_tr: "İlahi", label_en: "Divine" },
  shadow: { icon: "🌑", label_tr: "Gölge", label_en: "Shadow" },
  light: { icon: "🌿", label_tr: "Işık", label_en: "Light" }
};

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, sublabel, color = "primary" }) => (
  <Card className="border-border/50 bg-card/50 hover:bg-card transition-colors">
    <CardContent className="p-4 text-center">
      <div className={`w-10 h-10 rounded-full bg-${color}/10 flex items-center justify-center mx-auto mb-2`}>
        <Icon className={`h-5 w-5 text-${color}`} />
      </div>
      <div className="font-serif text-2xl text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {sublabel && <div className="text-xs text-muted-foreground/70">{sublabel}</div>}
    </CardContent>
  </Card>
);

// Milestone Component
const MilestoneCard = ({ milestone, language }) => {
  const title = language === 'en' ? milestone.title_en : milestone.title_tr;
  const description = language === 'en' ? milestone.description_en : milestone.description_tr;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-4 rounded-lg border ${
        milestone.unlocked 
          ? 'border-accent/30 bg-accent/5' 
          : 'border-border/30 bg-muted/20 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${milestone.unlocked ? '' : 'grayscale'}`}>
          {milestone.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-serif text-sm text-foreground truncate">{title}</h4>
            {milestone.unlocked && (
              <Badge variant="outline" className="text-xs border-accent/50 text-accent shrink-0">
                ✓
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>
        {!milestone.unlocked && (
          <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
        )}
      </div>
    </motion.div>
  );
};

// Consciousness Map Visualization
const ConsciousnessMap = ({ data, language }) => {
  const dimensions = data?.dimensions || {};
  const labels = {
    reflection: language === 'en' ? 'Reflection' : 'Yansıma',
    ritual: language === 'en' ? 'Ritual' : 'Ritüel',
    exploration: language === 'en' ? 'Exploration' : 'Keşif',
    consistency: language === 'en' ? 'Consistency' : 'Süreklilik',
    depth: language === 'en' ? 'Depth' : 'Derinlik'
  };
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3 border border-primary/30">
          <span className="font-serif text-3xl text-primary">{data?.level || 1}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {language === 'en' ? 'Consciousness Level' : 'Bilinç Seviyesi'}
        </p>
        <Progress value={data?.next_level_progress || 0} className="mt-2 h-1" />
        <p className="text-xs text-muted-foreground/70 mt-1">
          {data?.next_level_progress || 0}% {language === 'en' ? 'to next level' : 'sonraki seviyeye'}
        </p>
      </div>
      
      <div className="space-y-3">
        {Object.entries(dimensions).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{labels[key]}</span>
              <span className="text-foreground">{value}%</span>
            </div>
            <Progress value={value} className="h-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Recent Activity Item
const ActivityItem = ({ activity, language }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return language === 'en' ? 'Today' : 'Bugün';
    if (days === 1) return language === 'en' ? 'Yesterday' : 'Dün';
    if (days < 7) return `${days} ${language === 'en' ? 'days ago' : 'gün önce'}`;
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR');
  };
  
  if (activity.type === 'sanri') {
    const mode = MODE_ICONS[activity.mode] || MODE_ICONS.mirror;
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
        <span className="text-lg">{mode.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground truncate">
            {language === 'en' ? mode.label_en : mode.label_tr} {language === 'en' ? 'Session' : 'Oturumu'}
          </p>
          {activity.preview && (
            <p className="text-xs text-muted-foreground truncate">{activity.preview}</p>
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{formatTime(activity.timestamp)}</span>
      </div>
    );
  }
  
  if (activity.type === 'ritual') {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
        <span className="text-lg">🕯️</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground truncate">{activity.ritual_name}</p>
          <p className="text-xs text-muted-foreground">
            {language === 'en' ? 'Ritual completed' : 'Ritüel tamamlandı'}
          </p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{formatTime(activity.timestamp)}</span>
      </div>
    );
  }
  
  return null;
};

// Main Profile Page
const ProfilePage = () => {
  const { t, language } = useLanguage();
  const { isPremium, currentPlan, showUpgradeModal, isUpgradeModalOpen, hideUpgradeModal } = usePremium();
  const { user, logout } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const headers = {};
      if (user?.id) {
        headers['X-User-Id'] = user.id;
      }
      
      const res = await fetch(`${API_URL}/api/profile/me`, { headers });
      const data = await res.json();
      setProfile(data);
      setSelectedSymbol(data.avatar_symbol);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateAvatar = async (symbol) => {
    if (!user?.id) return;
    
    try {
      await fetch(`${API_URL}/api/profile/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id
        },
        body: JSON.stringify({ symbol })
      });
      setSelectedSymbol(symbol);
      setShowSymbolPicker(false);
    } catch (err) {
      console.error('Error updating avatar:', err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Infinity className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Loading your consciousness mirror...' : 'Bilinç aynan yükleniyor...'}
          </p>
        </div>
      </div>
    );
  }
  
  const stats = profile?.stats || {};
  const milestones = profile?.milestones || [];
  const recentActivity = profile?.recent_activity || [];
  const consciousnessMap = profile?.consciousness_map || {};
  
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm tracking-widest uppercase mb-4 block">
            {language === 'en' ? 'Consciousness Mirror' : 'Bilinç Aynası'}
          </span>
          
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto border-2 border-primary/30 cursor-pointer"
              onClick={() => setShowSymbolPicker(!showSymbolPicker)}
            >
              <span className="font-serif text-4xl text-primary">
                {selectedSymbol || profile?.avatar_symbol || "∞"}
              </span>
            </motion.div>
            
            {/* Symbol Picker */}
            <AnimatePresence>
              {showSymbolPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg p-3 shadow-lg z-10"
                >
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_SYMBOLS.map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => updateAvatar(symbol)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors ${
                          selectedSymbol === symbol 
                            ? 'bg-primary/20 border border-primary' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <h1 className="font-serif text-2xl text-foreground mb-2">
            {profile?.display_name || (language === 'en' ? 'Seeker' : 'Arayıcı')}
          </h1>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <PremiumBadge showFree={true} />
            {stats.current_streak > 0 && (
              <Badge variant="outline" className="gap-1">
                <Flame className="h-3 w-3 text-orange-400" />
                {stats.current_streak} {language === 'en' ? 'day streak' : 'günlük seri'}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            {language === 'en' ? 'Member since' : 'Üyelik'}: {new Date(profile?.member_since).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}
          </p>
        </motion.div>
        
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard 
            icon={MessageSquare} 
            value={stats.total_sanri_sessions || 0} 
            label={language === 'en' ? 'SANRI Sessions' : 'SANRI Oturumu'}
          />
          <StatCard 
            icon={Target} 
            value={stats.total_rituals_completed || 0} 
            label={language === 'en' ? 'Rituals' : 'Ritüel'}
          />
          <StatCard 
            icon={MapPin} 
            value={stats.cities_explored || 0} 
            label={language === 'en' ? 'Cities' : 'Şehir'}
          />
          <StatCard 
            icon={Calendar} 
            value={stats.days_active || 0} 
            label={language === 'en' ? 'Days Active' : 'Aktif Gün'}
          />
        </motion.div>
        
        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Consciousness Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  {language === 'en' ? 'Consciousness Map' : 'Bilinç Haritası'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConsciousnessMap data={consciousnessMap} language={language} />
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  {language === 'en' ? 'Journey Milestones' : 'Yolculuk Kilometre Taşları'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                {milestones.map((milestone) => (
                  <MilestoneCard 
                    key={milestone.id} 
                    milestone={milestone} 
                    language={language} 
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Moon className="h-5 w-5 text-indigo-400" />
                  {language === 'en' ? 'Recent Activity' : 'Son Aktiviteler'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-[400px] overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} language={language} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Infinity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Your journey awaits...' : 'Yolculuğun seni bekliyor...'}
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-3 rounded-full">
                      <Link to="/sanriya-sor">
                        {language === 'en' ? 'Ask SANRI' : "SANRI'ya Sor"}
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Premium CTA for Free Users */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6 text-center">
                <Crown className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-serif text-xl text-foreground mb-2">
                  {language === 'en' ? 'Deepen Your Journey' : 'Yolculuğunu Derinleştir'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  {language === 'en' 
                    ? 'Unlock unlimited SANRI sessions, deep rituals, and advanced consciousness features.'
                    : 'Sınırsız SANRI oturumları, derin ritüeller ve gelişmiş bilinç özellikleri aç.'}
                </p>
                <Button 
                  onClick={() => showUpgradeModal(FEATURES.PROFILE_MIRROR)}
                  className="rounded-full bg-gradient-to-r from-primary to-accent"
                >
                  {language === 'en' ? 'Explore Premium' : 'Premium\'u Keşfet'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/sanriya-sor">
              <Infinity className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Ask SANRI' : "SANRI'ya Sor"}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/rituel">
              <Target className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Start Ritual' : 'Ritüel Başlat'}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/sehirler">
              <MapPin className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Explore Cities' : 'Şehirleri Keşfet'}
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full text-muted-foreground"
            onClick={fetchProfile}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Refresh' : 'Yenile'}
          </Button>
        </motion.div>
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={hideUpgradeModal}
        feature={FEATURES.PROFILE_MIRROR}
      />
    </div>
  );
};

export default ProfilePage;
