import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/pages/HomePage"));
const CitiesPage = lazy(() => import("@/pages/CitiesPage"));
const CityDetailPage = lazy(() => import("@/pages/CityDetailPage"));
const ReadingLayersPage = lazy(() => import("@/pages/ReadingLayersPage"));
const SanriyaSorPage = lazy(() => import("@/pages/SanriyaSorPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));

// Components
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/sehirler" element={<CitiesPage />} />
              <Route path="/sehir/:cityId" element={<CityDetailPage />} />
              <Route path="/okuma-katmanlari" element={<ReadingLayersPage />} />
              <Route path="/sanriya-sor" element={<SanriyaSorPage />} />
              <Route path="/hakkinda" element={<AboutPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
