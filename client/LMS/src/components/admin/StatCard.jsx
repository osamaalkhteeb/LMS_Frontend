import React from "react";
import { Card, CardContent, Box, Typography, Avatar, useTheme } from "@mui/material";

const StatCard = ({ title, value, icon: IconComponent, color = "primary", variant }) => {
  const theme = useTheme();
  
  // Define color mapping for different card types
  const getCardColors = () => {
    const colors = {
      primary: {
        bgGradient: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        avatarBg: theme.palette.primary.light,
        avatarColor: theme.palette.primary.dark,
        textGradient: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
      },
      secondary: {
        bgGradient: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
        avatarBg: theme.palette.secondary.light,
        avatarColor: theme.palette.secondary.dark,
        textGradient: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
      },
      success: {
        bgGradient: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
        avatarBg: theme.palette.success.light,
        avatarColor: theme.palette.success.dark,
        textGradient: `linear-gradient(45deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
      },
      warning: {
        bgGradient: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
        avatarBg: theme.palette.warning.light,
        avatarColor: theme.palette.warning.dark,
        textGradient: `linear-gradient(45deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
      },
      info: {
        bgGradient: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
        avatarBg: theme.palette.info.light,
        avatarColor: theme.palette.info.dark,
        textGradient: `linear-gradient(45deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`
      },
      error: {
        bgGradient: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
        avatarBg: theme.palette.error.light,
        avatarColor: theme.palette.error.dark,
        textGradient: `linear-gradient(45deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
      }
    };
    
    return colors[color] || colors.primary;
  };
  
  const cardColors = getCardColors();
  
  // Apply gradient background if variant is 'gradient'
  const cardStyle = variant === 'gradient' ? {
    background: cardColors.bgGradient,
    color: 'white'
  } : {};
  
  return (
    <Card sx={{ 
      minHeight: "100%", 
      borderRadius: 3,
      boxShadow: theme.shadows[2],
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[6]
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" gap={3}>
          <Avatar 
            variant="rounded"
            sx={{ 
              bgcolor: cardColors.avatarBg, 
              color: cardColors.avatarColor,
              width: 56, 
              height: 56,
              borderRadius: 2
            }}
          >
            <IconComponent fontSize="large" />
          </Avatar>
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{ 
                fontSize: '2rem',
                background: cardColors.textGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;