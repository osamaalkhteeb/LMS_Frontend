import { useState, useEffect } from 'react';

/**
 * Custom hook for managing theme mode with localStorage persistence
 * @returns {Object} Object containing mode, toggleMode function, and setMode function
 */
export const useThemeMode = () => {
  // Get initial theme from localStorage or default to 'light'
  const getInitialTheme = () => {
    try {
      const savedTheme = localStorage.getItem('themeMode');
      return savedTheme && (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
      return 'light';
    }
  };

  const [mode, setMode] = useState(getInitialTheme);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('themeMode', mode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [mode]);

  // Toggle between light and dark mode
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Set specific mode
  const setThemeMode = (newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setMode(newMode);
    }
  };

  return {
    mode,
    toggleMode,
    setMode: setThemeMode
  };
};

/**
 * Alternative implementation using cookies (if you prefer cookies over localStorage)
 * Uncomment this if you want to use cookies instead
 */
/*
import Cookies from 'js-cookie'; // You would need to install js-cookie: npm install js-cookie

export const useThemeModeWithCookies = () => {
  const getInitialTheme = () => {
    try {
      const savedTheme = Cookies.get('themeMode');
      return savedTheme && (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
    } catch (error) {
      console.warn('Failed to read theme from cookies:', error);
      return 'light';
    }
  };

  const [mode, setMode] = useState(getInitialTheme);

  useEffect(() => {
    try {
      Cookies.set('themeMode', mode, { expires: 365 }); // Expires in 1 year
    } catch (error) {
      console.warn('Failed to save theme to cookies:', error);
    }
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setMode(newMode);
    }
  };

  return {
    mode,
    toggleMode,
    setMode: setThemeMode
  };
};
*/