import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  useTheme,
} from "@mui/material";
import { Email, Phone, LocationOn, School } from "@mui/icons-material";

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        py: 6,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Section 1: About */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              mb: 3,
              '&:hover': {
                cursor: 'pointer'
              }
            }}>
              <School sx={{ 
                mr: 1.5, 
                fontSize: 32,
                color: theme.palette.primary.main
              }} />
              <Typography variant="h5" fontWeight="700" sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                SkillUp
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{ 
                mb: 3, 
                lineHeight: 1.7,
                color: theme.palette.text.secondary,
                fontSize: '0.95rem'
              }}
            >
              An advanced educational platform designed to provide the best
              courses and learning resources to help you develop your skills.
            </Typography>

            {/* Contact Info */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                { icon: <Email />, text: 'osama200181@gmail.com' },
                { icon: <Phone />, text: '+962 7 7972 834' },
                { icon: <LocationOn />, text: 'Amman, Jordan' }
              ].map((item, index) => (
                <Box key={index} sx={{ 
                  display: "flex", 
                  alignItems: "center",
                  '&:hover': {
                    '& .MuiSvgIcon-root': {
                      transform: 'scale(1.1)',
                      color: theme.palette.primary.main
                    }
                  }
                }}>
                  <Box sx={{ 
                    mr: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.action.hover,
                    transition: 'all 0.3s ease'
                  }}>
                    {React.cloneElement(item.icon, {
                      sx: { 
                        fontSize: 18,
                        color: theme.palette.text.secondary,
                        transition: 'all 0.3s ease'
                      }
                    })}
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.text.secondary,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: theme.palette.text.primary
                    }
                  }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ 
          my: 4, 
          borderColor: theme.palette.divider,
          opacity: 0.5
        }} />

        {/* Copyright & Legal */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ 
            color: theme.palette.text.secondary,
            fontSize: '0.85rem'
          }}>
            © {new Date().getFullYear()} SkillUp Learning Management System. All
            rights reserved.
          </Typography>
          
          <Box sx={{
            display: 'flex',
            gap: 3
          }}>
            {['Privacy Policy', 'Terms of Service', 'Support'].map((item) => (
              <Link
                key={item}
                href="#"
                underline="none"
                variant="body2"
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.85rem',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    color: theme.palette.primary.main,
                    transform: 'translateY(-2px)'
                  } 
                }}
              >
                {item}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;