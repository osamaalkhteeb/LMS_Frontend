
import { useState, useEffect, useCallback, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  googleLogin,
  getToken,
  setToken,
  removeToken,
  isAuthenticated
} from '../services/authService';

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Hook for user registration
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser, setIsAuth } = useAuthContext();

  const registerUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await register(userData);
      if (result.token) {
        setToken(result.token);
        setUser(result.user);
        setIsAuth(true);
      }
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, setIsAuth]);

  return { registerUser, loading, error };
};

// Hook for user login
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser, setIsAuth } = useAuthContext();

  const loginUser = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const result = await login(credentials);
      if (result.token) {
        setUser(result.user);
        setIsAuth(true);
      }
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, setIsAuth]);

  return { loginUser, loading, error };
};

// Hook for user logout
export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const { setUser, setIsAuth } = useAuthContext();

  const logoutUser = useCallback(async () => {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuth(false);
      setLoading(false);
    }
  }, [setUser, setIsAuth]);

  return { logoutUser, loading };
};

// Hook for getting current user
export const useCurrentUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, setUser } = useAuthContext();

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  return { user, fetchCurrentUser, loading, error };
};

// Hook for token refresh
export const useRefreshToken = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await refreshToken();
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Token refresh failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { refresh, loading, error };
};

// Hook for Google OAuth
export const useGoogleAuth = () => {
  const initiateGoogleLogin = useCallback(() => {
    googleLogin();
  }, []);

  return { initiateGoogleLogin };
};

// Hook for authentication utilities
export const useAuthUtils = () => {
  return {
    getToken,
    setToken,
    removeToken,
    isAuthenticated
  };
};

// Main auth hook that combines everything
export const useAuth = () => {
  const context = useAuthContext();
  const { registerUser, loading: registerLoading, error: registerError } = useRegister();
  const { loginUser, loading: loginLoading, error: loginError } = useLogin();
  const { logoutUser, loading: logoutLoading } = useLogout();
  const { fetchCurrentUser, loading: userLoading, error: userError } = useCurrentUser();
  const { refresh, loading: refreshLoading, error: refreshError } = useRefreshToken();
  const { initiateGoogleLogin } = useGoogleAuth();
  const authUtils = useAuthUtils();

  return {
    // User state
    user: context.user,
    setUser: context.setUser,
    isAuthenticated: context.isAuth,
    loading: context.loading || registerLoading || loginLoading || logoutLoading || userLoading || refreshLoading,
    
    // Actions
    register: registerUser,
    login: loginUser,
    logout: logoutUser,
    refreshToken: refresh,
    getCurrentUser: fetchCurrentUser,
    googleLogin: initiateGoogleLogin,
    
    // Errors
    errors: {
      register: registerError,
      login: loginError,
      user: userError,
      refresh: refreshError
    },
    
    // Utils
    ...authUtils
  };
};

export default {
  useAuth,
  useAuthContext,
  useRegister,
  useLogin,
  useLogout,
  useCurrentUser,
  useRefreshToken,
  useGoogleAuth,
  useAuthUtils
};