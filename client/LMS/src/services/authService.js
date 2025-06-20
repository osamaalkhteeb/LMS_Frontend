import apiClient from './apiClient';

// Authentication functions
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    const data = response.data?.data || response.data;
    
    // Store token if provided (server returns accessToken)
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken);
      // Also add token property for compatibility
      data.token = data.accessToken;
    }
    
    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    const data = response.data?.data || response.data;
    
    // Store token if provided (server returns accessToken)
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken);
      // Also add token property for compatibility
      data.token = data.accessToken;
    }
    
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    
    // Clear stored token
    localStorage.removeItem('token');
    
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    // Clear token even if logout fails
    localStorage.removeItem('token');
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await apiClient.post('/auth/refresh-token');
    const data = response.data?.data || response.data;
    
    // Update stored token if provided
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// OAuth functions
export const googleLogin = () => {
  window.location.href = `${apiClient.defaults.baseURL}/auth/google`;
};

// Token management
export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export default {
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
};