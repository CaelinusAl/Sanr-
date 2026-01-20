// CAELINUS AI - Premium Subscription Context
// Manages subscription state, feature gates, and upgrade flows

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from './LanguageContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Plan types - Updated with new naming
export const PLAN_TYPES = {
  FREE: 'free',
  INITIATE: 'initiate',
  SOUL: 'soul',
  ORACLE: 'oracle'
};

// Feature keys for checking access
export const FEATURES = {
  // SANRI
  SANRI_BASIC: 'sanri_basic',
  SANRI_UNLIMITED: 'sanri_unlimited',
  SANRI_PREVIEW_ONLY: 'sanri_preview_only',
  SANRI_DEEP_ANALYSIS: 'sanri_deep_analysis',
  SANRI_VISUAL_ANALYSIS: 'sanri_visual_analysis',
  SANRI_FATE_LAYER: 'sanri_fate_layer',
  SANRI_TIMELINE: 'sanri_timeline',
  SANRI_ORACLE_MODE: 'sanri_oracle_mode',
  
  // Content
  CONSCIOUSNESS_FULL: 'consciousness_full',
  FREQUENCY_FULL: 'frequency_full',
  CITIES_FULL: 'cities_full',
  CITIES_PREVIEW_ONLY: 'cities_preview_only',
  CITIES_SANRI: 'cities_sanri',
  BOOK_112_FULL: 'book_112_full',
  HIDDEN_LAYER: 'hidden_layer',
  
  // Rituals
  RITUAL_PREVIEW_ONLY: 'ritual_preview_only',
  RITUAL_MICRO: 'ritual_micro',
  RITUAL_DEEP: 'ritual_deep',
  RITUAL_NEURAL_ECSTASY: 'ritual_neural_ecstasy',
  RITUAL_HIGH_FREQUENCY: 'ritual_high_frequency',
  
  // Visual
  VISUAL_GENERATE: 'visual_generate',
  VISUAL_ANALYZE: 'visual_analyze',
  VISUAL_NO_WATERMARK: 'visual_no_watermark',
  
  // Profile
  PROFILE_MIRROR: 'profile_mirror',
  PROFILE_CONSCIOUSNESS_MAP: 'profile_consciousness_map',
  PROFILE_FATE_LINE: 'profile_fate_line',
  VOICE_SANRI: 'voice_sanri',
  VOICE_PERSONALIZED: 'voice_personalized',
  SOUL_WEEKLY_MESSAGE: 'soul_weekly_message',
  ORACLE_MESSAGES: 'oracle_messages'
};

// Plan hierarchy for comparisons
const PLAN_LEVELS = {
  free: 0,
  initiate: 1,
  soul: 2,
  oracle: 3
};

// Feature requirements (which plan is needed)
const FEATURE_REQUIREMENTS = {
  // Free tier
  [FEATURES.SANRI_BASIC]: PLAN_TYPES.FREE,
  [FEATURES.SANRI_PREVIEW_ONLY]: PLAN_TYPES.FREE,
  [FEATURES.RITUAL_MICRO]: PLAN_TYPES.FREE,
  [FEATURES.CITIES_PREVIEW_ONLY]: PLAN_TYPES.FREE,
  [FEATURES.RITUAL_PREVIEW_ONLY]: PLAN_TYPES.FREE,
  [FEATURES.VISUAL_GENERATE]: PLAN_TYPES.FREE,
  
  // Initiate tier
  [FEATURES.SANRI_UNLIMITED]: PLAN_TYPES.INITIATE,
  [FEATURES.SANRI_DEEP_ANALYSIS]: PLAN_TYPES.INITIATE,
  [FEATURES.CONSCIOUSNESS_FULL]: PLAN_TYPES.INITIATE,
  [FEATURES.FREQUENCY_FULL]: PLAN_TYPES.INITIATE,
  [FEATURES.CITIES_FULL]: PLAN_TYPES.INITIATE,
  [FEATURES.RITUAL_DEEP]: PLAN_TYPES.INITIATE,
  [FEATURES.PROFILE_MIRROR]: PLAN_TYPES.INITIATE,
  [FEATURES.VISUAL_NO_WATERMARK]: PLAN_TYPES.INITIATE,
  
  // Soul tier
  [FEATURES.SANRI_VISUAL_ANALYSIS]: PLAN_TYPES.SOUL,
  [FEATURES.SANRI_FATE_LAYER]: PLAN_TYPES.SOUL,
  [FEATURES.SANRI_TIMELINE]: PLAN_TYPES.SOUL,
  [FEATURES.CITIES_SANRI]: PLAN_TYPES.SOUL,
  [FEATURES.RITUAL_NEURAL_ECSTASY]: PLAN_TYPES.SOUL,
  [FEATURES.BOOK_112_FULL]: PLAN_TYPES.SOUL,
  [FEATURES.PROFILE_CONSCIOUSNESS_MAP]: PLAN_TYPES.SOUL,
  [FEATURES.VOICE_SANRI]: PLAN_TYPES.SOUL,
  [FEATURES.VISUAL_ANALYZE]: PLAN_TYPES.SOUL,
  [FEATURES.SOUL_WEEKLY_MESSAGE]: PLAN_TYPES.SOUL,
  
  // Oracle tier
  [FEATURES.SANRI_ORACLE_MODE]: PLAN_TYPES.ORACLE,
  [FEATURES.HIDDEN_LAYER]: PLAN_TYPES.ORACLE,
  [FEATURES.RITUAL_HIGH_FREQUENCY]: PLAN_TYPES.ORACLE,
  [FEATURES.PROFILE_FATE_LINE]: PLAN_TYPES.ORACLE,
  [FEATURES.VOICE_PERSONALIZED]: PLAN_TYPES.ORACLE,
  [FEATURES.ORACLE_MESSAGES]: PLAN_TYPES.ORACLE
};

// Content limits per plan
const CONTENT_LIMITS = {
  free: {
    consciousness_cards: 6,
    frequency_items: 5,
    cities_list: 20,
    sanri_daily: 3,
    book_chapters: 0
  },
  initiate: {
    consciousness_cards: -1,
    frequency_items: -1,
    cities_list: -1,
    sanri_daily: -1,
    book_chapters: 3
  },
  soul: {
    consciousness_cards: -1,
    frequency_items: -1,
    cities_list: -1,
    sanri_daily: -1,
    book_chapters: -1
  },
  oracle: {
    consciousness_cards: -1,
    frequency_items: -1,
    cities_list: -1,
    sanri_daily: -1,
    book_chapters: -1
  }
};

// Default context value
const defaultContextValue = {
  // State
  isLoading: true,
  subscription: null,
  plans: [],
  currentPlan: PLAN_TYPES.FREE,
  isPremium: false,
  isOracleInvited: false,
  upgradePrompt: null,
  
  // Methods
  hasFeature: () => false,
  getContentLimit: () => 0,
  checkDailyLimit: () => ({ allowed: true, remaining: 3 }),
  refreshSubscription: () => {},
  upgradeToPlan: () => {},
  redeemInviteCode: () => {},
  
  // UI helpers
  showUpgradeModal: () => {},
  hideUpgradeModal: () => {},
  isUpgradeModalOpen: false
};

const PremiumContext = createContext(defaultContextValue);

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

// Quick check without context (for components that may not be wrapped)
export const isPlanAtLeast = (userPlan, requiredPlan) => {
  return (PLAN_LEVELS[userPlan] || 0) >= (PLAN_LEVELS[requiredPlan] || 0);
};

export const PremiumProvider = ({ children }) => {
  const { language } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalTarget, setUpgradeModalTarget] = useState(null);
  const [dailyUsage, setDailyUsage] = useState({});
  
  // Derived state
  const currentPlan = subscription?.plan_type || PLAN_TYPES.FREE;
  const isPremium = currentPlan !== PLAN_TYPES.FREE;
  const isOracleInvited = subscription?.oracle_invited || false;
  const upgradePrompt = subscription?.upgrade_prompt || null;
  
  // Fetch subscription status
  const refreshSubscription = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subscription/status`, {
        params: { language },
        withCredentials: true
      });
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      // Set default free subscription on error
      setSubscription({
        plan_type: PLAN_TYPES.FREE,
        is_active: true,
        features: CONTENT_LIMITS.free
      });
    }
  }, [language]);
  
  // Fetch available plans
  const fetchPlans = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subscription/plans`, {
        params: { language }
      });
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  }, [language]);
  
  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([refreshSubscription(), fetchPlans()]);
      setIsLoading(false);
    };
    init();
  }, [refreshSubscription, fetchPlans]);
  
  // Check if user has access to a feature
  const hasFeature = useCallback((feature) => {
    const requiredPlan = FEATURE_REQUIREMENTS[feature] || PLAN_TYPES.FREE;
    return isPlanAtLeast(currentPlan, requiredPlan);
  }, [currentPlan]);
  
  // Get content limit for a type
  const getContentLimit = useCallback((contentType) => {
    const limits = CONTENT_LIMITS[currentPlan] || CONTENT_LIMITS.free;
    return limits[contentType] ?? 0;
  }, [currentPlan]);
  
  // Check daily limit (returns { allowed, remaining, limit })
  const checkDailyLimit = useCallback((limitType) => {
    const limits = CONTENT_LIMITS[currentPlan] || CONTENT_LIMITS.free;
    const limit = limits[`${limitType}_daily`] ?? limits[limitType] ?? -1;
    
    if (limit === -1) {
      return { allowed: true, remaining: -1, limit: -1 }; // Unlimited
    }
    
    const used = dailyUsage[limitType] || 0;
    const remaining = Math.max(0, limit - used);
    
    return {
      allowed: remaining > 0,
      remaining,
      limit
    };
  }, [currentPlan, dailyUsage]);
  
  // Upgrade to a plan (mock for now)
  const upgradeToPlan = useCallback(async (targetPlan) => {
    try {
      const response = await axios.post(`${API_URL}/api/subscription/upgrade`, {
        target_plan: targetPlan
      }, { withCredentials: true });
      
      if (response.data.success) {
        await refreshSubscription();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: 'Upgrade failed' };
    } catch (error) {
      console.error('Upgrade failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Upgrade failed' 
      };
    }
  }, [refreshSubscription]);
  
  // Redeem invite code
  const redeemInviteCode = useCallback(async (code) => {
    try {
      const response = await axios.post(`${API_URL}/api/subscription/redeem-invite`, {
        code
      }, { withCredentials: true });
      
      if (response.data.success) {
        await refreshSubscription();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: 'Redemption failed' };
    } catch (error) {
      console.error('Invite redemption failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Invalid invite code'
      };
    }
  }, [refreshSubscription]);
  
  // UI helpers
  const showUpgradeModal = useCallback((targetPlan = null) => {
    setUpgradeModalTarget(targetPlan);
    setIsUpgradeModalOpen(true);
  }, []);
  
  const hideUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalTarget(null);
  }, []);
  
  // Get required plan for a feature (for UI display)
  const getRequiredPlan = useCallback((feature) => {
    return FEATURE_REQUIREMENTS[feature] || PLAN_TYPES.FREE;
  }, []);
  
  // Get plan info by ID
  const getPlanInfo = useCallback((planId) => {
    return plans.find(p => p.id === planId);
  }, [plans]);
  
  const value = {
    // State
    isLoading,
    subscription,
    plans,
    currentPlan,
    isPremium,
    isOracleInvited,
    upgradePrompt,
    upgradeModalTarget,
    
    // Feature checks
    hasFeature,
    getContentLimit,
    checkDailyLimit,
    getRequiredPlan,
    getPlanInfo,
    
    // Actions
    refreshSubscription,
    upgradeToPlan,
    redeemInviteCode,
    
    // UI helpers
    showUpgradeModal,
    hideUpgradeModal,
    isUpgradeModalOpen
  };
  
  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};

export default PremiumContext;
