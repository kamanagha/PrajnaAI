// hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    // Check multiple storage locations for compatibility
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const name = localStorage.getItem('name');
    const userData = localStorage.getItem('user');
    
    let userName = null;
    let userEmail = null;
    
    if (name) {
      userName = name;
    } else if (userData) {
      try {
        const parsed = JSON.parse(userData);
        userName = parsed.name || parsed.username || "User";
        userEmail = parsed.email;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Check if token exists and user is logged in
    if (token && (userName || userEmail)) {
      setUser(userName || userEmail || "User");
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for custom auth change events
    const handleAuthChange = () => {
      checkAuth();
    };
    
    // Listen for storage events (when localStorage changes in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'authToken' || e.key === 'name' || e.key === 'user') {
        checkAuth();
      }
    };
    
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Optional: Check every 2 seconds for changes (ensures navbar updates)
    const interval = setInterval(() => {
      checkAuth();
    }, 2000);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('name');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('email');
    
    // Clear session storage if any
    sessionStorage.clear();
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
    
    // Dispatch events to notify all components
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('storage'));
  };

  return { user, loading, isAuthenticated, logout, checkAuth };
};

export default useAuth;