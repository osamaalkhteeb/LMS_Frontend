import React, { useState, useEffect } from 'react';
import AuthContext from '../contexts/AuthContext';
import { getCurrentUser, getToken, removeToken } from '../services/authService';

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuth(true);
        } catch (error) {
          console.error('Failed to get current user:', error);
          removeToken();
          setIsAuth(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    isAuth,
    setIsAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;