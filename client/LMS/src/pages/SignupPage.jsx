import signupImage from '../assets/signup.png';
import React, { useState } from 'react';
import { 
  Container,
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useFormHandler } from '../hooks/useFormHandler';
import { validateEmail, validateRequired, validatePassword, validatePasswordMatch } from '../utils/validation';

const SignupPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  
  // Form validation rules
  const validationRules = {
    name: [(value) => validateRequired(value, 'Name')],
    email: [validateEmail],
    password: [validatePassword],
    confirmPassword: [(value, formData) => validatePasswordMatch(value, formData.password)]
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
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student'
    },
    validationRules
  );

  const onSubmit = async (event) => {
    event.preventDefault();
    
    return handleSubmit(async (data) => {
      const { confirmPassword, ...registrationData } = data;
      const result = await register(registrationData);
      
      // Redirect to appropriate dashboard based on user role
      if (result && result.user) {
        const dashboardMap = {
          'student': '/dashboard/student',
          'instructor': '/dashboard/instructor',
          'admin': '/dashboard/admin'
        };
        navigate(dashboardMap[result.user.role] || '/dashboard/student');
      } else {
        navigate('/login');
      }
      
      return result;
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 2,
        backgroundColor: '#f8f9fa'
      }}
    >
      <Grid 
        container 
        spacing={4} 
        alignItems="center" 
        justifyContent="center"
        sx={{ 
          maxWidth: '1200px',
          width: '100%'
        }}
      >
        {/* Image Section */}
        <Grid 
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Box
            component="img"
            src={signupImage}
            alt="Sign up illustration"
            sx={{ 
              width: { xs: '70%', sm: '60%', md: '90%' },
              maxWidth: '500px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </Grid>
        
        {/* Form Section */}
        <Grid 
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              maxWidth: 450,
              p: { xs: 3, sm: 4 },
              mx: { xs: 2, sm: 0 },
              borderRadius: 2,
              position: 'relative'
            }}
          >
            {/* Back Button */}
            <IconButton
              onClick={handleBackToHome}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                color: 'primary.main'
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Typography
              variant="h4"
              component="h1"
              align="center"
              gutterBottom
              sx={{
                mb: 4,
                fontWeight: 600,
                color: 'primary.main',
                fontSize: { xs: '1.8rem', sm: '2rem' }
              }}
            >
              Create an Account
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

            <Box component="form" onSubmit={onSubmit} noValidate>
              {/* Name */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                autoFocus
                size="medium"
                sx={{ mb: 2 }}
                disabled={loading || isSubmitting}
                error={!!errors.name}
                helperText={errors.name}
              />

              {/* Email */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                size="medium"
                sx={{ mb: 2 }}
                disabled={loading || isSubmitting}
                error={!!errors.email}
                helperText={errors.email}
              />

              {/* Password */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="password"
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                size="medium"
                sx={{ mb: 2 }}
                disabled={loading || isSubmitting}
                error={!!errors.password}
                helperText={errors.password}
              />

              {/* Confirm Password */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="confirmPassword"
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                size="medium"
                sx={{ mb: 2 }}
                disabled={loading || isSubmitting}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />


              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || isSubmitting}
                sx={{ 
                  mt: 2,
                  mb: 3,
                  py: 1.5,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
              >
                {(loading || isSubmitting) ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign Up'
                )}
              </Button>

              {/* Login Link */}
              <Typography 
                variant="body2" 
                align="center"
                sx={{ 
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  fontWeight: 500
                }}
              >
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  color="error"
                  sx={{ 
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SignupPage;