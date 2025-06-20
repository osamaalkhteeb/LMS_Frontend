import React from "react";
import { Box, Typography, Avatar, Card, CardContent, Grid } from "@mui/material";
import { CheckCircle, Description as FileText } from '@mui/icons-material';
import StatCard from './StatCard';

const StudentProfile = ({ student }) => {
  return (
    <Box mb={4}>
      {/* Profile Section */}
      <Box display="flex" alignItems="center" gap={3} mb={4}>
        <Avatar
          src={student.avatar}
          sx={{
            width: 80,
            height: 80,
            fontSize: "2rem",
            bgcolor: "primary.main",
          }}
        >
          {student.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Welcome back, {student.name}!
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Enrolled Courses"
            value={student.enrolledCourses}
            icon={CheckCircle}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={student.completedCourses}
            icon={CheckCircle}
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Certificates"
            value={student.certificatesEarned}
            icon={FileText}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Study Streak"
            value="1 day"
            icon={CheckCircle}
            color="info"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentProfile;