// CAELINUS AI - Upgrade Flow Hook
// Day 3: Soft prompt, Day 7: Main invitation

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const useUpgradeFlow = () => {
  const [trigger, setTrigger] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [daysSinceSignup, setDaysSinceSignup] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const checkTrigger = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/subscription/upgrade-trigger`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.show_prompt && data.trigger) {
        setTrigger(data.trigger);
        setShowPrompt(true);
      }
      
      if (data.days_since_signup) {
        setDaysSinceSignup(data.days_since_signup);
      }
    } catch (err) {
      console.error('Error checking upgrade trigger:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const dismissPrompt = useCallback(async () => {
    if (!trigger) return;
    
    try {
      await fetch(`${API_URL}/api/subscription/dismiss-prompt?prompt_type=${trigger.type}`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Error dismissing prompt:', err);
    }
    
    setShowPrompt(false);
    setTrigger(null);
  }, [trigger]);
  
  useEffect(() => {
    // Check trigger on mount
    checkTrigger();
    
    // Check again after 5 minutes (in case user stays on page)
    const interval = setInterval(checkTrigger, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkTrigger]);
  
  return {
    trigger,
    showPrompt,
    daysSinceSignup,
    isLoading,
    dismissPrompt,
    checkTrigger
  };
};

export default useUpgradeFlow;
