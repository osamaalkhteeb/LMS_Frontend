import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Paper, 
  Divider,
  IconButton,
  TextField,
  Button,
  Stack,
  Alert,
  Badge
} from '@mui/material';
import { CircleLoader } from 'react-spinners';
import { Email, Edit, CameraAlt, Save, Cancel } from '@mui/icons-material';
import { useUserProfile } from '../hooks/useUsers';

const MyProfile = () => {
  const { profile, loading, error, refetch: fetchProfile, updateProfile, uploadImage } = useUserProfile();
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setTempBio(profile.bio || '');
    }
  }, [profile]);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Save changes
  const handleSave = async () => {
    try {
      setUpdateError('');
      setUpdateSuccess('');
      
      // Update profile data (bio and name only)
      await updateProfile({
        name: profile.name,
        bio: tempBio
      });
      
      // Upload new image if selected
      if (selectedFile) {
        await uploadImage(selectedFile);
        setSelectedFile(null);
      }
      
      setUpdateSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setUpdateError('Failed to update profile. Please try again.');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (profile) {
      setTempBio(profile.bio || '');
    }
    setSelectedFile(null);
    setUpdateError('');
    setUpdateSuccess('');
    setEditMode(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <CircleLoader size={60} color="#7f00ff" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 2,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 2,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Alert severity="info" sx={{ width: '100%', maxWidth: 500 }}>
          No profile data available.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 3
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 600,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
          }
        }}
      >
        {/* Error/Success Messages */}
        {(updateError || updateSuccess) && (
          <Box sx={{ mb: 3 }}>
            <Alert severity={updateError ? 'error' : 'success'} sx={{ borderRadius: 2 }}>
              {updateError || updateSuccess}
            </Alert>
          </Box>
        )}

        {/* Profile Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              editMode && (
                <>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      sx={{
                        backgroundColor: 'white',
                        boxShadow: 2,
                        '&:hover': {
                          backgroundColor: 'white',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <CameraAlt fontSize="small" />
                    </IconButton>
                  </label>
                </>
              )
            }
          >
            <Avatar
              alt={profile.name}
              src={selectedFile ? URL.createObjectURL(selectedFile) : (profile.avatar_url ? `${profile.avatar_url.trim().replace(/`/g, '')}?t=${Date.now()}` : profile.avatar_url)}
              sx={{
                width: 120,
                height: 120,
                border: '3px solid white',
                boxShadow: 3,
                mb: 2
              }}
            />
          </Badge>
          
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
            {profile.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <Email fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body1">{profile.email}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'divider' }} />
        
        {/* Bio Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            About Me
          </Typography>
          
          {editMode ? (
            <TextField
              label="Tell us about yourself"
              multiline
              rows={4}
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'divider'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            />
          ) : (
            <Typography 
              variant="body1" 
              sx={{ 
                p: 2,
                borderRadius: 2,
                backgroundColor: !profile.bio ? 'action.hover' : 'transparent',
                border: !profile.bio ? '1px dashed' : 'none',
                borderColor: 'divider',
                color: !profile.bio ? 'text.secondary' : 'text.primary',
                whiteSpace: 'pre-line'
              }}
            >
              {profile.bio || 'No bio added yet.'}
            </Typography>
          )}
        </Box>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {!editMode ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                  opacity: 0.9
                }
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    opacity: 0.9
                  }
                }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'text.secondary'
                  }
                }}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MyProfile;