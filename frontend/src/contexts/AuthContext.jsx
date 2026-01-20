// CAELINUS AI - Authentication Context
// Google OAuth + JWT Auth + Bilinç Profili

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // Check auth status on mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true
      });
      
      if (response.data && response.data.user_id) {
        setUser(response.data);
        setIsAuthenticated(true);
        setHasProfile(response.data.has_profile || false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setHasProfile(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setHasProfile(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Google OAuth login
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const loginWithGoogle = useCallback(() => {
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  }, []);

  // Apple Sign In (iOS App Store requirement)
  // Uses same Emergent Auth with Apple provider
  const loginWithApple = useCallback(() => {
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?provider=apple&redirect=${encodeURIComponent(redirectUrl)}`;
  }, []);

  // Email/Password login
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/email/login`, 
        { email, password },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setHasProfile(response.data.has_profile);
        return { success: true, hasProfile: response.data.has_profile };
      }
      return { success: false, error: 'Giriş başarısız' };
    } catch (error) {
      const message = error.response?.data?.detail || 'Giriş başarısız';
      return { success: false, error: message };
    }
  }, []);

  // Email/Password register
  const registerWithEmail = useCallback(async (email, password, name, profile = null) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/email/register`,
        { email, password, name, profile },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setHasProfile(response.data.has_profile);
        return { success: true, isNewUser: true, hasProfile: response.data.has_profile };
      }
      return { success: false, error: 'Kayıt başarısız' };
    } catch (error) {
      const message = error.response?.data?.detail || 'Kayıt başarısız';
      return { success: false, error: message };
    }
  }, []);

  // Process Google OAuth callback
  const processGoogleCallback = useCallback(async (sessionId) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/google/session`,
        { session_id: sessionId },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setHasProfile(response.data.has_profile);
        return {
          success: true,
          isNewUser: response.data.is_new_user,
          hasProfile: response.data.has_profile,
          user: response.data.user
        };
      }
      return { success: false, error: 'Oturum işleme hatası' };
    } catch (error) {
      const message = error.response?.data?.detail || 'Oturum işleme hatası';
      return { success: false, error: message };
    }
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(async (profileData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/onboarding`,
        profileData,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setHasProfile(true);
        // Refresh user data
        await checkAuth();
        return { success: true };
      }
      return { success: false, error: 'Profil oluşturma hatası' };
    } catch (error) {
      const message = error.response?.data?.detail || 'Profil oluşturma hatası';
      return { success: false, error: message };
    }
  }, [checkAuth]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setHasProfile(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/api/user/profile`,
        profileData,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        await checkAuth();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail };
    }
  }, [checkAuth]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    hasProfile,
    loginWithGoogle,
    loginWithApple,
    loginWithEmail,
    registerWithEmail,
    processGoogleCallback,
    completeOnboarding,
    logout,
    updateProfile,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
