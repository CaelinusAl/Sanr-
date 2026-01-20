// Admin Layout with Sidebar Navigation
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Radio,
  Brain,
  Users,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Wand2,
  FileText,
  Layers,
  Image as ImageIcon,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "../../contexts/AdminContext";

const menuItems = [
  {
    section: "Kontrol",
    items: [
      { path: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true }
    ]
  },
  {
    section: "Premium & Abonelik",
    items: [
      { path: "/admin/subscriptions", icon: Crown, label: "Subscription Yönetimi" }
    ]
  },
  {
    section: "İçerik Tapınağı",
    items: [
      { path: "/admin/rituals", icon: Sparkles, label: "Ritüel Builder" },
      { path: "/admin/chapters", icon: BookOpen, label: "Kitap Bölümleri" },
      { path: "/admin/bilinc-cards", icon: Layers, label: "Bilinç Kartları" },
      { path: "/admin/frekans-cards", icon: Radio, label: "Frekans Kartları" },
      { path: "/admin/media", icon: FileText, label: "Medya Kütüphanesi" }
    ]
  },
  {
    section: "Motor Tapınağı",
    items: [
      { path: "/admin/sanri-prompts", icon: Brain, label: "SANRI Prompt Studio" },
      { path: "/admin/visual-presets", icon: ImageIcon, label: "Visual Presets" },
      { path: "/admin/tts-settings", icon: Wand2, label: "TTS Ayarları" }
    ]
  },
  {
    section: "Kollektif Tapınağı",
    items: [
      { path: "/admin/users", icon: Users, label: "Kullanıcılar" },
      { path: "/admin/moderation", icon: Shield, label: "Moderasyon" },
      { path: "/admin/analytics", icon: BarChart3, label: "Analitik" }
    ]
  },
  {
    section: "Sistem",
    items: [
      { path: "/admin/settings", icon: Settings, label: "Ayarlar" }
    ]
  }
];

const AdminLayout = ({ children }) => {
  const { logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const NavItem = ({ item }) => {
    const active = isActive(item.path, item.exact);
    const Icon = item.icon;
    
    return (
      <Link
        to={item.path}
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
          active 
            ? "bg-violet-600/20 text-violet-300 border-l-2 border-violet-500" 
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {sidebarOpen && <span className="text-sm">{item.label}</span>}
      </Link>
    );
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "" : "w-64"}`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-800/50">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-purple-600/30 border border-violet-500/30 flex items-center justify-center">
            <span className="text-violet-300 font-serif text-lg">C</span>
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="text-white font-serif text-lg">CAELINUS</h1>
              <p className="text-[10px] text-gray-500 tracking-[0.15em] uppercase">Admin Panel</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            {sidebarOpen && (
              <h3 className="text-[10px] text-gray-600 uppercase tracking-wider mb-2 px-3">
                {section.section}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="text-sm">Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-[#0d0d14] border-r border-gray-800/50 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}>
        <Sidebar />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#12121a] rounded-lg border border-gray-800/50 text-white"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-[#0d0d14] border-r border-gray-800/50 z-50"
            >
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Admin</span>
              <ChevronRight className="w-4 h-4 text-gray-600" />
              <span className="text-white">
                {menuItems.flatMap(s => s.items).find(i => isActive(i.path, i.exact))?.label || "Dashboard"}
              </span>
            </div>

            {/* Toggle Sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
