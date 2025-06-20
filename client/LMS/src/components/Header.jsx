import React from 'react';
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
  Dashboard as DashboardIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Styled components
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.common.white, 0.15)
    : alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.25)
      : alpha(theme.palette.common.black, 0.08),
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
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
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '24ch',
    },
  },
  '& .MuiInputBase-input:focus': {
    width: '32ch',
  },
}));

const HeaderButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '12px',
  padding: '8px 16px',
  margin: '0 4px',
  fontWeight: 500,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.primary.contrastText,
  backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.text.primary, 0.08) : theme.palette.primary.dark,
  },
  '&:focus': {
    outline: 'none',
    boxShadow: 'none',
  },
}));

const HeaderIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '12px',
  padding: '8px',
  margin: '0 4px',
  color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.primary.contrastText,
  backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.primary.main,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.text.primary, 0.08) : theme.palette.primary.dark,
    transform: 'scale(1.05)',
  },
  '&:focus': {
    outline: 'none',
    boxShadow: 'none',
  },
}));

const Header = ({ mode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const { user, logout } = useAuth();

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
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
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
    >
      <MenuItem onClick={toggleDarkMode}>
        <IconButton size="large" color="inherit">
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
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
        <MenuItem onClick={handleSettingsClick}>
          <IconButton size="large" color="inherit">
            <SettingsIcon />
          </IconButton>
          <p>Settings</p>
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
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.primary.main,
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
          borderBottom: (theme) => 
            `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
          color: (theme) => 
            theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.primary.contrastText
        }}
      >
        <Toolbar>
          <Box sx={{
            maxWidth: '1520px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px'
          }}>
            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: 2,
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 }
              }}
              onClick={() => user ? handleDashboardClick() : navigate('/')}
            >
              <SchoolIcon sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                EduGo
              </Typography>
            </Box>

            {/* Mobile menu button */}
            <HeaderIconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
              onClick={handleMobileMenuOpen}
              disableRipple
            >
              <MenuIcon />
            </HeaderIconButton>

            {/* Search Bar */}
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>

            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop Icons */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                <HeaderIconButton
                  size="large"
                  color="inherit"
                  onClick={toggleDarkMode}
                  disableRipple
                >
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </HeaderIconButton>
              </Tooltip>

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
                      disableRipple
                    >
                      <SettingsIcon />
                    </HeaderIconButton>
                  </Tooltip>

                  <Tooltip title="Account">
                    <HeaderIconButton
                      size="large"
                      edge="end"
                      aria-label="account of current user"
                      aria-controls={menuId}
                      aria-haspopup="true"
                      onClick={handleProfileMenuOpen}
                      disableRipple
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
                    variant="outlined"
                    onClick={handleRegisterClick}
                    sx={{
                      borderColor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.23)' 
                          : 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        borderColor: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.3)' 
                            : 'rgba(255, 255, 255, 0.9)',
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.08)' 
                            : 'rgba(255, 255, 255, 0.04)',
                      }
                    }}
                  >
                    Register
                  </HeaderButton>
                </>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
};

export default Header;