import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

const enrichUser = (userData) => ({
  ...userData,
  isAdmin: userData.email?.endsWith('@ksg.ac.ke') || userData.role === 'admin',
  loginTime: new Date().toISOString(),
});

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    apiClient.get('/users/profile')
      .then(res => setUser(enrichUser(res.data)))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await apiClient.post('/users/login', { email, password });
      const enriched = enrichUser(data.user);
      localStorage.setItem('token', data.access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
      setUser(enriched);
      return { success: true, user: enriched };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const { data } = await apiClient.post('/users/register', userData);
      const enriched = enrichUser(data.user);
      localStorage.setItem('token', data.access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
      setUser(enriched);
      return { success: true, user: enriched };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin === true,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}