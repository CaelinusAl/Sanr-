import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

// Pages
import HomePage from "@/pages/HomePage";
import CitiesPage from "@/pages/CitiesPage";
import CityDetailPage from "@/pages/CityDetailPage";
import ReadingLayersPage from "@/pages/ReadingLayersPage";
import SanriyaSorPage from "@/pages/SanriyaSorPage";
import AboutPage from "@/pages/AboutPage";

// Components
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sehirler" element={<CitiesPage />} />
            <Route path="/sehir/:cityId" element={<CityDetailPage />} />
            <Route path="/okuma-katmanlari" element={<ReadingLayersPage />} />
            <Route path="/sanriya-sor" element={<SanriyaSorPage />} />
            <Route path="/hakkinda" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
