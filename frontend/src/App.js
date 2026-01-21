import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import "@/App.css";
import ProjectsPage from "@/pages/ProjectsPage";
import EditorPage from "@/pages/EditorPage";
import FilmGeneratorPage from "@/pages/FilmGeneratorPage";
import { Toaster } from "@/components/ui/sonner";

// Hide React error overlay for third-party errors
function useHideThirdPartyErrors() {
  useEffect(() => {
    const hideOverlay = () => {
      const overlay = document.querySelector('iframe[style*="z-index: 2147483647"]');
      if (overlay) {
        const doc = overlay.contentDocument;
        if (doc) {
          const errorText = doc.body?.innerText || '';
          if (errorText.includes('postMessage') || 
              errorText.includes('PerformanceServerTiming') ||
              errorText.includes('posthog')) {
            overlay.style.display = 'none';
          }
        }
      }
    };

    const observer = new MutationObserver(hideOverlay);
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also check periodically
    const interval = setInterval(hideOverlay, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);
}

function App() {
  useHideThirdPartyErrors();

  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProjectsPage />} />
          <Route path="/editor/:projectId" element={<EditorPage />} />
          <Route path="/ai-director" element={<FilmGeneratorPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
