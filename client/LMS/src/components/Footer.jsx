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
        py: 1,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          {/* Section 1: About */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <School sx={{ 
                mr: 1, 
                fontSize: 28,
                color: theme.palette.text.primary
              }} />
              <Typography variant="h5" fontWeight="bold">
                EduGo
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{ 
                mb: 3, 
                lineHeight: 1.6,
                color: theme.palette.text.secondary
              }}
            >
              An advanced educational platform designed to provide the best
              courses and learning resources to help you develop your skills and
              achieve your professional and academic goals.
            </Typography>

            {/* Contact Info */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Email sx={{ 
                  mr: 1, 
                  fontSize: 18,
                  color: theme.palette.text.secondary 
                }} />
                <Typography variant="body2">nour3lwan99@gmail.com</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Phone sx={{ 
                  mr: 1, 
                  fontSize: 18,
                  color: theme.palette.text.secondary 
                }} />
                <Typography variant="body2">+962 7 2839 753</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LocationOn sx={{ 
                  mr: 1, 
                  fontSize: 18,
                  color: theme.palette.text.secondary 
                }} />
                <Typography variant="body2">Amman, Jordan</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ 
          my: 4, 
          backgroundColor: theme.palette.divider
        }} />

        {/* Copyright & Legal */}
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary 
            }}>
              © {new Date().getFullYear()} EduGo Learning Management System. All
              rights reserved.
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            sx={{ textAlign: { xs: "left", md: "right" } }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: { xs: "flex-start", md: "flex-end" },
                mt: { xs: 2, md: 0 },
              }}
            >
              <Link
                href="#"
                color="inherit"
                underline="hover"
                variant="body2"
                sx={{ 
                  color: theme.palette.text.secondary,
                  "&:hover": { 
                    color: theme.palette.text.primary 
                  } 
                }}
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                variant="body2"
                sx={{ 
                  color: theme.palette.text.secondary,
                  "&:hover": { 
                    color: theme.palette.text.primary 
                  } 
                }}
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                variant="body2"
                sx={{ 
                  color: theme.palette.text.secondary,
                  "&:hover": { 
                    color: theme.palette.text.primary 
                  } 
                }}
              >
                Support
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;