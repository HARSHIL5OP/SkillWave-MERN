import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/authAPI';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on first render
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('userData');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }

        // Verify token with backend
        try {
          const res = await authAPI.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('userData', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Stored token is invalid or expired:', err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      const { user: loggedInUser, token: authToken } = res.data;

      localStorage.setItem('token', authToken);
      localStorage.setItem('userData', JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      setToken(authToken);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(userData);
      const { user: registeredUser, token: authToken } = res.data;

      localStorage.setItem('token', authToken);
      localStorage.setItem('userData', JSON.stringify(registeredUser));

      setUser(registeredUser);
      setToken(authToken);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setLoading(false);
    }
  };

  const updateUserProfile = (updatedData) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedData };
      localStorage.setItem('userData', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    userId: user?._id || user?.user_id,
    login,
    register,
    logout,
    updateUserProfile,
    setUserId: () => {}, // compatibility no-op
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
