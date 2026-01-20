// SANRI - Consciousness Analytics Dashboard
// Admin Panel için bilinç analitikleri

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Brain, 
  TrendingUp, 
  Eye,
  Moon,
  Sun,
  Cloud,
  Heart,
  Activity,
  BarChart3,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Mode icons and colors
const modeConfig = {
  dream: { icon: Moon, color: "text-indigo-400", bg: "bg-indigo-500/10", label: "Rüya" },
  mirror: { icon: Eye, color: "text-cyan-400", bg: "bg-cyan-500/10", label: "Ayna" },
  divine: { icon: Sun, color: "text-amber-400", bg: "bg-amber-500/10", label: "İlahi" },
  shadow: { icon: Cloud, color: "text-violet-400", bg: "bg-violet-500/10", label: "Gölge" },
  light: { icon: Heart, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Işık" }
};

const StatCard = ({ title, value, icon: Icon, description, trend }) => (
  <Card className="bg-slate-900/50 border-slate-800">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-light text-white">{value}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-indigo-400" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400">
          <TrendingUp className="h-3 w-3" />
          <span>{trend}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const ModeDistributionBar = ({ modes }) => {
  const total = Object.values(modes || {}).reduce((a, b) => a + b, 0) || 1;
  
  return (
    <div className="space-y-3">
      {Object.entries(modes || {}).map(([mode, count]) => {
        const config = modeConfig[mode] || modeConfig.mirror;
        const percentage = ((count / total) * 100).toFixed(1);
        const Icon = config.icon;
        
        return (
          <div key={mode} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300">{config.label}</span>
                <span className="text-xs text-slate-500">{percentage}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${config.bg.replace('/10', '/50')}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SymbolCloud = ({ symbols }) => {
  if (!symbols || symbols.length === 0) return (
    <p className="text-slate-500 text-sm italic">Henüz sembol verisi yok</p>
  );
  
  const maxCount = Math.max(...symbols.map(s => s.count));
  
  return (
    <div className="flex flex-wrap gap-2">
      {symbols.map((item, index) => {
        const size = 0.7 + (item.count / maxCount) * 0.6;
        return (
          <motion.span
            key={item.symbol}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20"
            style={{ fontSize: `${size}rem` }}
          >
            {item.symbol}
            <span className="text-violet-500 ml-1 text-xs">({item.count})</span>
          </motion.span>
        );
      })}
    </div>
  );
};

const ThemeList = ({ themes }) => {
  if (!themes || themes.length === 0) return (
    <p className="text-slate-500 text-sm italic">Henüz tema verisi yok</p>
  );
  
  return (
    <div className="space-y-2">
      {themes.slice(0, 8).map((item, index) => (
        <motion.div
          key={item.theme}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50"
        >
          <span className="text-slate-300">{item.theme}</span>
          <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
            {item.count}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/consciousness/analytics/overview`);
      if (!response.ok) throw new Error("Analytics yüklenemedi");
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 text-indigo-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-400">Bilinç verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Brain className="h-4 w-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">Admin Panel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-white mb-2" 
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            SANRI – Consciousness Analytics
          </h1>
          <p className="text-slate-500 italic">Not data. Awareness.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Toplam Kullanıcı"
            value={analytics?.total_profiles || 0}
            icon={Users}
            description="Bilinç profili oluşturan"
          />
          <StatCard
            title="Ortalama Büyüme"
            value={`${analytics?.average_growth_index || 0}/100`}
            icon={TrendingUp}
            description="Growth Index"
          />
          <StatCard
            title="Ort. Soru/Kullanıcı"
            value={(analytics?.average_questions_per_user || 0).toFixed(1)}
            icon={Activity}
            description="Etkileşim derinliği"
          />
          <StatCard
            title="Aktif Modlar"
            value={Object.keys(analytics?.mode_distribution || {}).length}
            icon={BarChart3}
            description="Kullanılan bilinç modları"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mode Distribution */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-light text-white">
                Bilinç Modu Dağılımı
              </CardTitle>
              <CardDescription>
                Kullanıcıların tercih ettiği modlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModeDistributionBar modes={analytics?.mode_distribution} />
            </CardContent>
          </Card>

          {/* Sensitivity Distribution */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-light text-white">
                Hassasiyet Seviyeleri
              </CardTitle>
              <CardDescription>
                Kullanıcı duygu hassasiyeti dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics?.sensitivity_distribution || {}).map(([level, count]) => {
                  const colors = {
                    low: "bg-emerald-500/20 text-emerald-400",
                    medium: "bg-amber-500/20 text-amber-400",
                    high: "bg-rose-500/20 text-rose-400"
                  };
                  const labels = { low: "Düşük", medium: "Orta", high: "Yüksek" };
                  
                  return (
                    <div key={level} className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm ${colors[level]}`}>
                        {labels[level]} Hassasiyet
                      </span>
                      <span className="text-slate-400">{count} kullanıcı</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Symbols */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-light text-white flex items-center gap-2">
                <Cloud className="h-5 w-5 text-violet-400" />
                En Çok Görülen Semboller
              </CardTitle>
              <CardDescription>
                Kolektif bilinçaltı haritası
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SymbolCloud symbols={analytics?.top_symbols} />
            </CardContent>
          </Card>

          {/* Top Themes */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-light text-white flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-400" />
                Tekrarlayan Temalar
              </CardTitle>
              <CardDescription>
                En sık işlenen duygusal temalar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeList themes={analytics?.top_themes} />
            </CardContent>
          </Card>
        </div>

        {/* Insight Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-600 italic text-sm">
            {analytics?.insight}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
