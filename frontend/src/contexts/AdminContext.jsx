// Admin Context - Authentication & State
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminContext = createContext(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("caelinus_admin_token");
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/verify`, {
        headers: { "X-Admin-Token": tokenToVerify }
      });
      if (response.ok) {
        setToken(tokenToVerify);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("caelinus_admin_token");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem("caelinus_admin_token", data.token);
        return { success: true };
      }
      
      return { success: false, error: data.detail || "Giriş başarısız" };
    } catch (error) {
      return { success: false, error: "Bağlantı hatası" };
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("caelinus_admin_token");
  };

  // API helper with auth header
  const adminFetch = useCallback(async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}/api/admin${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        "X-Admin-Token": token,
        "Content-Type": "application/json"
      }
    });
    
    if (response.status === 401) {
      logout();
      throw new Error("Oturum süresi doldu");
    }
    
    return response;
  }, [token]);

  return (
    <AdminContext.Provider value={{
      isAuthenticated,
      isLoading,
      token,
      login,
      logout,
      adminFetch
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
