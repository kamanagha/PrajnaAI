import { useState, useEffect } from 'react';
import API from '../services/api';

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const isStaff = localStorage.getItem('is_staff') === 'true';
    const isSuperuser = localStorage.getItem('is_superuser') === 'true';
    
    if (token && storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        const userData = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser({ 
          ...userData, 
          is_staff: isStaff, 
          is_superuser: isSuperuser 
        });
      } catch (e) {
        console.error("Error parsing user data:", e);
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await API.post('/users/login/', { email, password });
      const { 
        access, 
        refresh, 
        user_id, 
        username, 
        email: userEmail, 
        name, 
        is_staff, 
        is_superuser 
      } = response.data;
      
      // Store all user data in localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('username', username);
      localStorage.setItem('email', userEmail);
      localStorage.setItem('name', name || username);
      localStorage.setItem('is_staff', is_staff);
      localStorage.setItem('is_superuser', is_superuser);
      localStorage.setItem('user', JSON.stringify({ 
        id: user_id, 
        username, 
        email: userEmail, 
        name: name || username,
        is_staff, 
        is_superuser 
      }));
      
      const userObject = { 
        id: user_id, 
        username, 
        email: userEmail, 
        name: name || username, 
        is_staff, 
        is_superuser 
      };
      
      setUser(userObject);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, loading, isAuthenticated, login, logout };
}

export default useAuth;