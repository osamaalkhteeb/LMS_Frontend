
import React, { useState } from 'react';
import { 
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Button
} from '@mui/material';

import {
  Menu as MenuIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  MenuBook as MenuBookIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggleButton from './ThemeToggleButton';
import { useThemeContext } from '../contexts/ThemeContext.jsx';

// Styled components
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '25px',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.2),
    border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  },
  '&:focus-within': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    border: `1px solid ${alpha(theme.palette.common.white, 0.4)}`,
    boxShadow: `0 0 0 2px ${alpha(theme.palette.common.white, 0.1)}`,
  },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  width: '100%',
  maxWidth: '500px',
  transition: theme.transitions.create(['width', 'background-color', 'border', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    fontSize: '0.95rem',
    fontWeight: 400,
    transition: theme.transitions.create('width'),
    '&::placeholder': {
      color: alpha(theme.palette.common.white, 0.7),
      opacity: 1,
    },
    [theme.breakpoints.up('md')]: {
      width: '25ch',
      '&:focus': {
        width: '35ch',
      },
    },
  },
}));

const HeaderButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0, 0.5),
  fontWeight: 500,
  color: theme.palette.common.white,
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  },
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.9),
    },
  },
}));

const HeaderIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  },
}));

const ContentContainer = styled(Box)({
  width: '100%',
  maxWidth: '1480px',
  margin: '0 auto',
  display: 'flex',
});

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleCoursesClick = () => {
    navigate('/courses');
    handleMobileMenuClose();
  };

  const handleLoginClick = () => {
    navigate('/login');
    handleMobileMenuClose();
  };

  const handleRegisterClick = () => {
    navigate('/signup');
    handleMobileMenuClose();
  };

  const handleDashboardClick = () => {
    if (user) {
      navigate(`/dashboard/${user.role}`);
    }
    handleMobileMenuClose();
  };

  const handleProfileClick = () => {
    navigate('/MyProfile');
    handleMenuClose();
  };

  const handleSettingsClick = () => {
    navigate('/SettingsPage');
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const menuId = 'primary-search-account-menu';
  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id="profile-menu"
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: {
          width: 220,
        },
      }}
    >
      <MenuItem>
        <ThemeToggleButton />
        <p>{mode === 'light' ? 'Dark' : 'Light'} Mode</p>
      </MenuItem>

      {user && (
        <MenuItem onClick={handleDashboardClick}>
          <IconButton size="large" color="inherit">
            <DashboardIcon />
          </IconButton>
          <p>Dashboard</p>
        </MenuItem>
      )}

      {(!user || user?.role === 'student') && (
        <MenuItem onClick={handleCoursesClick}>
          <IconButton size="large" color="inherit">
            <MenuBookIcon />
          </IconButton>
          <p>Courses</p>
        </MenuItem>
      )}

      {user && (
        <MenuItem onClick={handleProfileClick}>
          <IconButton size="large" color="inherit">
            <AccountCircleIcon />
          </IconButton>
          <p>Profile</p>
        </MenuItem>
      )}

      {user && (
        <MenuItem onClick={handleSettingsClick}>
          <IconButton size="large" color="inherit">
            <SettingsIcon />
          </IconButton>
          <p>Settings</p>
        </MenuItem>
      )}

      {user && (
        <MenuItem onClick={handleLogout}>
          <IconButton size="large" color="inherit">
            <AccountCircleIcon />
          </IconButton>
          <p>Logout</p>
        </MenuItem>
      )}

      {!user && [
        <MenuItem key="login" onClick={handleLoginClick}>
          <IconButton size="large" color="inherit">
            <AccountCircleIcon />
          </IconButton>
          <p>Login</p>
        </MenuItem>,
        <MenuItem key="register" onClick={handleRegisterClick}>
          <IconButton size="large" color="inherit">
            <AccountCircleIcon />
          </IconButton>
          <p>Register</p>
        </MenuItem>
      ]}
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "none",
          backdropFilter: "blur(20px)",
        }}
      >
        <Toolbar sx={{ padding: "0 !important" }}>
          <Box
            sx={{
              width: "100%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <ContentContainer>
              {/* Mobile menu button */}
              <HeaderIconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open menu"
                sx={{ mr: 1, display: { xs: 'flex', md: 'none' } }}
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </HeaderIconButton>

              {/* Logo - hidden on mobile */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  cursor: 'pointer',
                  flexGrow: { xs: 1, md: 0 },
                  mr: { md: 2 },
                }}
                onClick={handleDashboardClick}
              >
                <SchoolIcon sx={{ mr: 1, fontSize: 28 }} />
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ fontWeight: 700 }}
                >
                  SkillUP
                </Typography>
              </Box>

              {/* Search - always visible */}
              <Box sx={{ flexGrow: 1, display: 'flex', px: 2 }}>
                <Search sx={{ width: '100%' }}>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search courses..."
                    inputProps={{ 'aria-label': 'search' }}
                  />
                </Search>
              </Box>

              {/* Desktop actions */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                }}
              >
                <ThemeToggleButton />

              {user && (
                <Tooltip title="Dashboard">
                  <HeaderButton
                    onClick={handleDashboardClick}
                    startIcon={<DashboardIcon />}
                  >
                    Dashboard
                  </HeaderButton>
                </Tooltip>
              )}

              {(!user || user?.role === 'student') && (
                <Tooltip title="Courses">
                  <HeaderButton
                    onClick={handleCoursesClick}
                    startIcon={<MenuBookIcon />}
                  >
                    Courses
                  </HeaderButton>
                </Tooltip>
              )}

              {user && (
                <>
                  <Tooltip title="Settings">
                    <HeaderIconButton
                      size="large"
                      onClick={handleSettingsClick}
                    >
                      <SettingsIcon />
                    </HeaderIconButton>
                  </Tooltip>

                  <Tooltip title="Account settings">
                    <HeaderIconButton
                      size="large"
                      edge="end"
                      aria-label="account of current user"
                      aria-controls="profile-menu"
                      aria-haspopup="true"
                      onClick={handleProfileMenuOpen}
                    >
                      <AccountCircleIcon />
                    </HeaderIconButton>
                  </Tooltip>
                </>
              )}

              {!user && (
                <>
                  <HeaderButton onClick={handleLoginClick}>
                    Login
                  </HeaderButton>
                  <HeaderButton
                    variant="contained"
                    onClick={handleRegisterClick}
                    sx={{ ml: 1 }}
                  >
                    Sign Up
                  </HeaderButton>
                </>
              )}
              </Box>
            </ContentContainer>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
      {renderMobileMenu}
      {renderProfileMenu}
    </Box>
  );
};

export default Header;
