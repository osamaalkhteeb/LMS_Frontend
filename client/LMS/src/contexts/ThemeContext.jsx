import React, { createContext, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useThemeMode } from '../hooks/useTheme';

// Create the theme context
const ThemeContext = createContext();

/**
 * Custom hook to use the theme context
 * @returns {Object} Theme context value with mode, toggleMode, and setMode
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme provider component that wraps the app with theme functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  const { mode, toggleMode, setMode } = useThemeMode();

  // Create the Material-UI theme based on current mode
  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: "#7f00ff",
        light: "#6A89FF",
        dark: "#27408B",
        contrastText: "#FFFFFF",
      },
      background: {
        default: mode === "light" ? "#FFFFFF" : "#121212",
        paper: mode === "light" ? "#F5F5F5" : "#1E1E1E",
      },
      // Add more theme customizations here
      text: {
        primary: mode === "light" ? "#000000" : "#FFFFFF",
        secondary: mode === "light" ? "#666666" : "#AAAAAA",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      // Add typography customizations
    },
    components: {
      // Add component-specific theme overrides
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // Disable uppercase transformation
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === "light" 
              ? "0 2px 8px rgba(0,0,0,0.1)" 
              : "0 2px 8px rgba(255,255,255,0.1)",
          },
        },
      },
    },
  });

  const contextValue = {
    mode,
    toggleMode,
    setMode,
    theme,
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Higher-order component for components that need theme functionality
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Wrapped component with theme props
 */
export const withTheme = (Component) => {
  return function ThemedComponent(props) {
    const themeContext = useThemeContext();
    return <Component {...props} theme={themeContext} />;
  };
};