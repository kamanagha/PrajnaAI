// authUtils.js - Authentication utility functions

// Check if user is logged in
export const isLoggedIn = () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    // You can also check token expiry here
    if (token) {
      // Optional: Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          logout();
          return false;
        }
      } catch (error) {
        console.error('Token validation error:', error);
        return false;
      }
      return true;
    }
    
    return !!(user);
  };
  
  // Get current user
  export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  };
  
  // Get auth token
  export const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };
  
  // Set authentication data
  export const setAuthData = (token, user) => {
    if (token) localStorage.setItem('authToken', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  };
  
  // Logout user
  export const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Clear any other auth-related data
    sessionStorage.clear();
  };
  
  // Protected route wrapper (optional)
  export const requireAuth = (navigate) => {
    if (!isLoggedIn()) {
      navigate('/login');
      return false;
    }
    return true;
  };