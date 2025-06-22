import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, ArrowBack as BackIcon } from '@mui/icons-material';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
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
      <Box
        sx={{
          width: '90%',
          maxWidth: '600px',
          minHeight: '500px',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          backgroundColor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 4, sm: 6, md: 8 },
          textAlign: 'center'
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '450px' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', sm: '6rem' },
              fontWeight: 700,
              color: 'primary.main',
              mb: 3
            }}
          >
            404
          </Typography>
          
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 3,
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.8rem', sm: '2.2rem' }
            }}
          >
            Page Not Found
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}
          >
            The page you're looking for doesn't exist or has been moved.
          </Typography>
        
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                  opacity: 0.9
                }
              }}
            >
              Go Home
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={handleGoBack}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderColor: 'text.secondary'
                }
              }}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFoundPage;