import loginImage from "../assets/login.png";
import React, { useState } from "react";
import {
  Container,
  Box,
  Grid,
  Typography,
  Divider,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  IconButton
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ClockLoader } from "react-spinners";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useFormHandler } from "../hooks/useFormHandler";
import { validateEmail, validateRequired } from "../utils/validation";


const LoginPage = () => {
  const { login, googleLogin, loading } = useAuth();
  const navigate = useNavigate();
  
  // Form validation rules
  const validationRules = {
    email: [validateEmail],
    password: [(value) => validateRequired(value, 'Password')]
  };
  
  // Use the form handler hook
  const {
    formData,
    errors,
    isSubmitting,
    submitError,
    submitSuccess,
    handleChange,
    handleSubmit
  } = useFormHandler(
    { email: '', password: '' },
    validationRules
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    
    return handleSubmit(async (data) => {
      const result = await login(data);
      
      // Redirect to appropriate dashboard based on user role
      if (result && result.user) {
        const dashboardMap = {
          'student': '/dashboard/student',
          'instructor': '/dashboard/instructor',
          'admin': '/dashboard/admin'
        };
        navigate(dashboardMap[result.user.role] || '/dashboard/student');
      } else {
        navigate('/dashboard');
      }
      
      return result;
    });
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  const handleBackToHome = () => {
    navigate('/');
  };
  
  return (
    <Container 
      maxWidth={false} 
      disableGutters
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4
      }}
    >
      <Grid 
        container 
        sx={{ 
          maxWidth: { xs: '95%', md: '90%', lg: '1200px' },
          minHeight: { xs: 'auto', md: '85vh' },
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          backgroundColor: 'background.paper'
        }}
      >
        {/* Image Section */}
        <Grid 
          item 
          xs={12} 
          md={6}
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <Box
            component="img"
            src={loginImage}
            alt="Login illustration"
            sx={{ 
              width: '90%',
              maxWidth: '500px',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
            }}
          />
        </Grid>
        
        {/* Form Section */}
        <Grid 
          item 
          xs={12} 
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 4, sm: 6, md: 8 }
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 450
            }}
          >
            {/* Back Button */}
            <IconButton
              onClick={handleBackToHome}
              sx={{
                position: 'absolute',
                top: { xs: 24, sm: 32 },
                left: { xs: 24, sm: 32 },
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'primary.main'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                mb: 3,
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                textAlign: 'center'
              }}
            >
              Welcome Back
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
                textAlign: 'center',
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Sign in to access your personalized dashboard
            </Typography>

            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}
            
            {submitSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {submitSuccess}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={onSubmit}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                sx={{
                  mb: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  borderRadius: 1,
                  borderColor: '#7f00ff',
                  color: '#7f00ff',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'text.secondary'
                  }
                }}
                onClick={handleGoogleLogin}
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? <ClockLoader size={24} color="#7f00ff" /> : 'Continue with Google'}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  or sign in with email
                </Typography>
              </Divider>

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                size="medium"
                sx={{ mb: 2 }}
                value={formData.email}
                onChange={handleChange}
                disabled={loading || isSubmitting}
                error={!!errors.email}
                helperText={errors.email}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 1,
                    '& fieldset': {
                      borderColor: 'divider'
                    }
                  }
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                size="medium"
                sx={{ mb: 1 }}
                value={formData.password}
                onChange={handleChange}
                disabled={loading || isSubmitting}
                error={!!errors.password}
                helperText={errors.password}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 1,
                    '& fieldset': {
                      borderColor: 'divider'
                    }
                  }
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mb: 3
                }}
              >
                <Link 
                  href="#" 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: 'primary.main'
                    }
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 1,
                  mb: 3,
                  py: 1.5,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 1,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    opacity: 0.9
                  }
                }}
                disabled={loading || isSubmitting}
              >
                {(loading || isSubmitting) ? <ClockLoader size={24} color="#ffffff" /> : 'Sign In'}
              </Button>

              <Typography 
                variant="body2" 
                align="center"
                sx={{ 
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  fontWeight: 500,
                  color: 'text.secondary'
                }}
              >
                Don't have an account?{' '}
                <Link 
                  href="/signup" 
                  sx={{ 
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: 'primary.main',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;