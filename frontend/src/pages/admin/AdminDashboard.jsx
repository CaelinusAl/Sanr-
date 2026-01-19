// Admin Dashboard Page
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  BookOpen, 
  Layers, 
  Radio, 
  Brain,
  Users,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdmin } from "../../contexts/AdminContext";

const AdminDashboard = () => {
  const { adminFetch } = useAdmin();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminFetch("/dashboard/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Dashboard stats error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, subValue, color = "violet" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#12121a] rounded-xl border border-gray-800/50 p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subValue && (
            <p className="text-xs text-gray-500 mt-1">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-500/10`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  const QuickAction = ({ icon: Icon, label, to, color = "violet" }) => (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-3 p-4 rounded-xl bg-${color}-500/10 border border-${color}-500/20 hover:border-${color}-500/40 transition-all cursor-pointer`}
      >
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        <span className="text-white text-sm">{label}</span>
        <ArrowRight className="w-4 h-4 text-gray-500 ml-auto" />
      </motion.div>
    </Link>
  );

  const SystemStatus = ({ name, status }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-400">{name}</span>
      <div className="flex items-center gap-2">
        {status === "active" ? (
          <>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Aktif</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-xs text-red-400">Kapalı</span>
          </>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-white mb-2">Kontrol Odası</h1>
        <p className="text-gray-400">CAELINUS içerik ve sistem yönetimi</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Sparkles} 
          label="Ritüeller" 
          value={stats?.content?.rituals?.total || 0}
          subValue={`${stats?.content?.rituals?.published || 0} yayında`}
          color="violet"
        />
        <StatCard 
          icon={BookOpen} 
          label="Kitap Bölümleri" 
          value={stats?.content?.chapters?.total || 0}
          subValue={`${stats?.content?.chapters?.published || 0} yayında`}
          color="blue"
        />
        <StatCard 
          icon={Layers} 
          label="Bilinç Kartları" 
          value={stats?.content?.bilinc_cards?.total || 0}
          color="emerald"
        />
        <StatCard 
          icon={Brain} 
          label="SANRI Promptları" 
          value={stats?.engine?.prompts?.total || 0}
          subValue={`${stats?.engine?.prompts?.active || 0} aktif`}
          color="amber"
        />
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-serif text-white">Hızlı Aksiyonlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickAction 
              icon={Plus} 
              label="Yeni Ritüel Oluştur" 
              to="/admin/rituals/new"
              color="violet"
            />
            <QuickAction 
              icon={BookOpen} 
              label="Bölüm Ekle" 
              to="/admin/chapters/new"
              color="blue"
            />
            <QuickAction 
              icon={Brain} 
              label="Prompt Düzenle" 
              to="/admin/sanri-prompts"
              color="amber"
            />
            <QuickAction 
              icon={Layers} 
              label="Bilinç Kartı Ekle" 
              to="/admin/bilinc-cards/new"
              color="emerald"
            />
          </div>
        </div>

        {/* System Status */}
        <Card className="bg-[#12121a] border-gray-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg font-serif flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Sistem Durumu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <SystemStatus name="TTS Servisi" status={stats?.system_status?.tts} />
            <SystemStatus name="SANRI Motor" status={stats?.system_status?.sanri} />
            <SystemStatus name="Veritabanı" status={stats?.system_status?.database} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-[#12121a] border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white text-lg font-serif flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-400" />
            Son Aktiviteler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_activity?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activity.map((log, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-800/30 last:border-0">
                  <div className={`p-2 rounded-lg ${
                    log.action === "create" ? "bg-green-500/10" :
                    log.action === "update" ? "bg-blue-500/10" :
                    log.action === "delete" ? "bg-red-500/10" :
                    log.action === "publish" ? "bg-violet-500/10" :
                    "bg-gray-500/10"
                  }`}>
                    {log.action === "create" && <Plus className="w-4 h-4 text-green-400" />}
                    {log.action === "update" && <Activity className="w-4 h-4 text-blue-400" />}
                    {log.action === "delete" && <AlertCircle className="w-4 h-4 text-red-400" />}
                    {log.action === "publish" && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      <span className="text-gray-400">{log.user}</span>
                      {" "}{log.action === "create" ? "oluşturdu" : 
                            log.action === "update" ? "güncelledi" :
                            log.action === "delete" ? "sildi" :
                            log.action === "publish" ? "yayınladı" : log.action}
                      {": "}
                      <span className="text-violet-300">{log.entity_name}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Henüz aktivite yok</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
