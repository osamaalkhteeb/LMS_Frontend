import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = React.useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('No authentication token received');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Store the token
        localStorage.setItem('token', token);
        
        // Set the token in apiClient headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user data with the token
        const response = await apiClient.get('/auth/me');

        if (response.status === 200) {
          const userData = response.data;
          setUser(userData.data);
          
          // Redirect to appropriate dashboard based on user role
          const dashboardMap = {
            'student': '/dashboard/student',
            'instructor': '/dashboard/instructor', 
            'admin': '/dashboard/admin'
          };
          
          navigate(dashboardMap[userData.data.role] || '/dashboard/student', { replace: true });
        } else {
          setError('Failed to authenticate user');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, setUser]);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <Alert severity="error">{error}</Alert>
        <p>Redirecting to login...</p>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress />
      <p>Completing authentication...</p>
    </Box>
  );
};

export default OAuthCallback;