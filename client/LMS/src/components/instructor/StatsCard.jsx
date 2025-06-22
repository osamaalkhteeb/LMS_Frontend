import React from "react";
import { Card, CardContent, Box, Typography, Avatar, useTheme } from "@mui/material";

const StatCard = ({ title, value, icon: IconComponent, color = "primary" }) => {
  const theme = useTheme();
  
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
              bgcolor: `${color}.light`, 
              color: `${color}.dark`,
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
                background: `linear-gradient(45deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
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