
import React, { useState } from 'react';
import './App.css'
import { AuthProvider } from './components/AuthProvider'
import AppRouter from './router/AppRouter'
import { useTheme } from '@mui/material/styles';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import DebugHooks from './components/DebugHooks';

function App() {
  const [mode, setMode] = useState("light");

  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: "#4169E1",
        light: "#6A89FF",
        dark: "#27408B",
        contrastText: "#FFFFFF",
      },
      background: {
        default: mode === "light" ? "#FFFFFF" : "#121212",
        paper: mode === "light" ? "#F5F5F5" : "#1E1E1E",
      },
    },
  });

  const toggleDarkMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    // <ThemeProvider theme={theme}>
    //   <CssBaseline />
    //   <AuthProvider>
    //     {/* Temporarily show only DebugHooks */}
    //     <DebugHooks />
    //   </AuthProvider>
    // </ThemeProvider>
    
    // Original app (commented out for testing)
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRouter mode={mode} toggleDarkMode={toggleDarkMode} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


