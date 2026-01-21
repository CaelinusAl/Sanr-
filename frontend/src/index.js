import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress PostHog analytics errors in development
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('postMessage') || 
       args[0].includes('PerformanceServerTiming') ||
       args[0].includes('posthog'))
    ) {
      return; // Suppress PostHog-related errors
    }
    originalError.apply(console, args);
  };

  // Suppress unhandled errors from PostHog
  window.addEventListener('error', (event) => {
    if (event.message && 
        (event.message.includes('postMessage') || 
         event.message.includes('PerformanceServerTiming'))) {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
  }, true);

  // Suppress unhandled promise rejections from PostHog
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && 
        event.reason.message && 
        (event.reason.message.includes('postMessage') || 
         event.reason.message.includes('PerformanceServerTiming'))) {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
  }, true);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
