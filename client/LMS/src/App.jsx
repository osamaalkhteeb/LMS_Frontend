
import React from 'react';
import './App.css'
import { AuthProvider } from './components/AuthProvider'
import AppRouter from './router/AppRouter'
import { CssBaseline } from "@mui/material";
import DebugHooks from './components/DebugHooks';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext.jsx';

// Inner App component that uses theme context
const AppContent = () => {
  return (
    <>
      <CssBaseline />
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </>
  );
};

// Main App component that provides theme context
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;


