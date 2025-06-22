import React from "react";
import { Box, Typography, Avatar, Card, CardContent, Grid, useTheme, useMediaQuery } from "@mui/material";
import { CheckCircle, Description as FileText } from '@mui/icons-material';
import StatCard from './StatCard';

const StudentProfile = ({ student }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box mb={4}>
      {/* Profile Section - Responsive adjustments */}
      <Box 
        display="flex" 
        flexDirection={isMobile ? "column" : "row"}
        alignItems={isMobile ? "flex-start" : "center"} 
        gap={3} 
        mb={4}
        sx={{
          p: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          boxShadow: theme.shadows[3],
          overflow: 'hidden'
        }}
      >
        <Avatar
          src={student.avatar}
          sx={{
            width: isMobile ? 80 : 100,
            height: isMobile ? 80 : 100,
            fontSize: isMobile ? "2rem" : "2.5rem",
            bgcolor: "primary.dark",
            border: '3px solid white'
          }}
        >
          {student.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar>
        <Box sx={{ 
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight="bold" 
            gutterBottom
            sx={{
              wordBreak: 'break-word',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            Welcome back, {student.name}!
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              opacity: 0.9,
              wordBreak: 'break-word'
            }}
          >
            Keep up the great work on your learning journey
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards - Adjusted grid for better mobile display */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Enrolled Courses"
            value={student.enrolledCourses}
            icon={CheckCircle}
            color="primary"
            variant="gradient"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={student.completedCourses}
            icon={CheckCircle}
            color="success"
            variant="gradient"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Certificates"
            value={student.certificatesEarned}
            icon={FileText}
            color="warning"
            variant="gradient"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Study Streak"
            value="1 day"
            icon={CheckCircle}
            color="info"
            variant="gradient"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentProfile;