import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/pages/HomePage"));
const CitiesPage = lazy(() => import("@/pages/CitiesPage"));
const CityDetailPage = lazy(() => import("@/pages/CityDetailPage"));
const ReadingLayersPage = lazy(() => import("@/pages/ReadingLayersPage"));
const SanriyaSorPage = lazy(() => import("@/pages/SanriyaSorPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BilincPage = lazy(() => import("@/pages/BilincPage"));
const FrekansPage = lazy(() => import("@/pages/FrekansPage"));
const RituelAlaniPage = lazy(() => import("@/pages/RituelAlaniPage"));
const BilincAlaniPage = lazy(() => import("@/pages/BilincAlaniPage"));
const GorselinPage = lazy(() => import("@/pages/GorselinPage"));

// Admin Pages
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const RitualsList = lazy(() => import("@/pages/admin/RitualsList"));
const RitualBuilder = lazy(() => import("@/pages/admin/RitualBuilder"));

// Components
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
        <span className="font-serif text-xl text-primary">∞</span>
      </div>
      <p className="text-muted-foreground text-sm">Yükleniyor...</p>
    </div>
  </div>
);

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdmin();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

// Layout wrapper to hide navbar/footer on admin pages and home page
const LayoutWrapper = ({ children, isDark, toggleTheme }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';
  
  // Home page has its own full-screen design
  if (isAdminRoute || isHomePage) {
    return children;
  }
  
  return (
    <>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <main>{children}</main>
      <Footer />
    </>
  );
};

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('caelinus-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('caelinus-theme', !isDark ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-background">
      <BrowserRouter>
        <LanguageProvider>
          <AdminProvider>
            <LayoutWrapper isDark={isDark} toggleTheme={toggleTheme}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/sehirler" element={<CitiesPage />} />
                  <Route path="/sehir/:cityId" element={<CityDetailPage />} />
                  <Route path="/okuma-katmanlari" element={<ReadingLayersPage />} />
                  <Route path="/sanriya-sor" element={<SanriyaSorPage />} />
                  <Route path="/bilinc" element={<BilincPage />} />
                  <Route path="/frekans" element={<FrekansPage />} />
                  <Route path="/rituel" element={<RituelAlaniPage />} />
                  <Route path="/bilinc-alani" element={<BilincAlaniPage />} />
                  <Route path="/gorselin" element={<GorselinPage />} />
                  <Route path="/hakkinda" element={<AboutPage />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/rituals" element={<AdminRoute><RitualsList /></AdminRoute>} />
                  <Route path="/admin/rituals/new" element={<AdminRoute><RitualBuilder /></AdminRoute>} />
                  <Route path="/admin/rituals/:id" element={<AdminRoute><RitualBuilder /></AdminRoute>} />
                </Routes>
              </Suspense>
            </LayoutWrapper>
            <Toaster position="bottom-right" />
          </AdminProvider>
        </LanguageProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
