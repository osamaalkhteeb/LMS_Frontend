import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext.jsx';

/**
 * A reusable theme toggle button component
 * Can be used in headers, settings pages, or anywhere theme switching is needed
 */
const ThemeToggleButton = ({ size = 'medium', ...props }) => {
  const { mode, toggleMode, isDark } = useThemeContext();

  return (
    <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        size={size}
        {...props}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton;