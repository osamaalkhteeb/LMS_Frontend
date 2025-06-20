import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUsers';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Email,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Lock,
  Person
} from '@mui/icons-material';

const SettingsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const { profile, loading: profileLoading, error: profileError, updateProfile, updatePassword } = useUserProfile();
  
  // User data state
  const [user, setUser] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      setUser(prev => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || ''
      }));
    } else if (authUser) {
      setUser(prev => ({
        ...prev,
        name: authUser.name || '',
        email: authUser.email || ''
      }));
    }
  }, [profile, authUser]);

  // Edit mode and UI states
  const [editNameMode, setEditNameMode] = useState(false);
  const [editPasswordMode, setEditPasswordMode] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    
    if (editNameMode && !user.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (editPasswordMode) {
      if (!user.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (!user.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (user.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (user.newPassword !== user.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save name changes
  const handleSaveName = async () => {
    if (!validate()) return;
    
    try {
      await updateProfile({ name: user.name }, (updatedProfile) => {
        // Immediately update the AuthContext user state for instant UI update
        if (setAuthUser) {
          setAuthUser(prev => ({ ...prev, name: updatedProfile.name }));
        }
      });
      setSuccessMessage('Name updated successfully');
      setEditNameMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ name: error.message || 'Failed to update name' });
    }
  };

  // Save password changes
  const handleSavePassword = async () => {
    if (!validate()) return;
    
    try {
      await updatePassword({
        currentPassword: user.currentPassword,
        newPassword: user.newPassword
      });
      setSuccessMessage('Password updated successfully');
      setUser(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setEditPasswordMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      // Extract the actual error message from the API response
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.data?.message || 
                           error.response?.data?.error || 
                           error.response?.statusText || 
                           error.message || 
                           'Failed to update password';
      setErrors({ currentPassword: errorMessage });
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditNameMode(false);
    setEditPasswordMode(false);
    setErrors({});
    
    // Revert name to original value from profile or authUser
    const originalName = profile?.name || authUser?.name || '';
    setUser(prev => ({ 
      ...prev, 
      name: originalName,
      currentPassword: '', 
      newPassword: '', 
      confirmPassword: '' 
    }));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 }, // Responsive padding
          width: '100%',
          maxWidth: 600,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Account Settings
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        {profileError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {profileError}
          </Alert>
        )}
        
        {profileLoading && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Loading profile data...
          </Alert>
        )}

        {/* Email (non-editable) */}
        <Typography variant="subtitle1" gutterBottom>
          Email
        </Typography>
        <TextField
          value={user.email}
          fullWidth
          disabled
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Responsive Name Section */}
        <Typography variant="subtitle1" gutterBottom>
          Name
        </Typography>
        {editNameMode ? (
          <Box sx={{ mb: 3 }}>
            <TextField
              name="name"
              value={user.name}
              onChange={handleChange}
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Stack 
              direction={isMobile ? "column" : "row"} 
              spacing={2} 
              justifyContent="flex-end"
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSaveName}
                disabled={profileLoading}
                fullWidth={isMobile}
              >
                {profileLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={handleCancel}
                fullWidth={isMobile}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={2} 
            alignItems={isMobile ? "stretch" : "center"}
            sx={{ mb: 3 }}
          >
            <TextField
              value={user.name}
              fullWidth
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditNameMode(true)}
              fullWidth={isMobile}
            >
              Edit
            </Button>
          </Stack>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Password Section */}
        <Typography variant="subtitle1" gutterBottom>
          Password
        </Typography>
        {editPasswordMode ? (
          <Box sx={{ mb: 3 }}>
            <TextField
              name="currentPassword"
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              value={user.currentPassword}
              onChange={handleChange}
              fullWidth
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              name="newPassword"
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={user.newPassword}
              onChange={handleChange}
              fullWidth
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              value={user.confirmPassword}
              onChange={handleChange}
              fullWidth
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Stack 
              direction={isMobile ? "column" : "row"} 
              spacing={2} 
              justifyContent="flex-end"
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSavePassword}
                disabled={profileLoading}
                fullWidth={isMobile}
              >
                {profileLoading ? 'Changing...' : 'Change Password'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={handleCancel}
                fullWidth={isMobile}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        ) : (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditPasswordMode(true)}
            sx={{ mb: 3 }}
            fullWidth={isMobile}
          >
            Change Password
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default SettingsPage;