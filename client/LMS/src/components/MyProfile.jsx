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
  CircularProgress
} from '@mui/material';
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
      
      // Update profile data (include required name field)
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
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
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
          p: 2
        }}
      >
        <Alert severity="error">{error}</Alert>
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
          p: 2
        }}
      >
        <Alert severity="info">No profile data available.</Alert>
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
        backgroundColor: '#f5f5f5',
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        {/* Error/Success Messages */}
        {updateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {updateError}
          </Alert>
        )}
        {updateSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {updateSuccess}
          </Alert>
        )}

        {/* Profile Picture Section */}
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            alt={profile.name}
            src={selectedFile ? URL.createObjectURL(selectedFile) : (profile.avatar_url ? `${profile.avatar_url.trim().replace(/`/g, '')}?t=${Date.now()}` : profile.avatar_url)}
            sx={{
              width: 120,
              height: 120,
              margin: '0 auto 16px',
              border: '3px solid #3f51b5'
            }}
          />
          {editMode && (
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
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    backgroundColor: 'white',
                    boxShadow: 1
                  }}
                >
                  <CameraAlt />
                </IconButton>
              </label>
            </>
          )}
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {profile.name}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <IconButton aria-label="email" color="primary">
            <Email />
          </IconButton>
          <Typography variant="body1" color="text.secondary">
            {profile.email}
          </Typography>
        </Box>
        
        {/* Bio Section */}
        {editMode ? (
          <TextField
            label="Bio"
            multiline
            rows={4}
            value={tempBio}
            onChange={(e) => setTempBio(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
        ) : (
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'left', whiteSpace: 'pre-line' }}>
            {profile.bio || 'No bio available.'}
          </Typography>
        )}
        
        {/* Edit/Save Buttons */}
        {!editMode ? (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default MyProfile;