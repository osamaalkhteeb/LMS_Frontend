import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from "@mui/material";
import { 
  Assessment as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  School as SchoolIcon
} from "@mui/icons-material";
import { useCourseAnalytics } from "../../hooks/useAnalytics";

const AnalyticsTab = ({ analytics, loading, error }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Use course analytics hook
  const { analytics: courseDetails, loading: detailsLoading, error: courseError } = useCourseAnalytics(selectedCourse?.id);

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setDetailsOpen(true);
    // Course details will be automatically fetched by the hook when selectedCourse changes
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedCourse(null);
  };

  const getProgressColor = (value) => {
    if (value >= 80) return 'success';
    if (value >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics || !analytics.analytics || analytics.analytics.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No published courses found. Create and publish courses to view analytics.
      </Alert>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {analytics?.analytics?.map((course) => (
          <Grid size={{ xs: 12, md: 4 }} key={course.id}>
            <Card sx={{ height: '100%', borderRadius: 2, position: 'relative' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2} noWrap>
                  {course.course}
                </Typography>
                
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">
                      Completion Rate: {course.completionRate}%
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`${course.completionRate}%`}
                      color={getProgressColor(course.completionRate)}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={course.completionRate}
                    color={getProgressColor(course.completionRate)}
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">
                      Average Progress: {course.avgScore}%
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`${course.avgScore}%`}
                      color={getProgressColor(course.avgScore)}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={course.avgScore}
                    color={getProgressColor(course.avgScore)}
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      Active Students: {course.activeStudents}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: {course.totalEnrollments}
                    </Typography>
                  </Box>
                </Box>
                
                <Button
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                  fullWidth
                  onClick={() => handleViewDetails(course)}
                >
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Analytics Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detailed Analytics - {selectedCourse?.course}
        </DialogTitle>
        <DialogContent>
          {detailsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : courseDetails ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {courseDetails.totalStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <SchoolIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {courseDetails.completedStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <TrendingUpIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {courseDetails.inProgressStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <PeopleIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {courseDetails.notStartedStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Not Started
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" mb={2}>Progress Overview</Typography>
                  <Box mb={2}>
                    <Typography variant="body2" mb={1}>
                      Overall Completion Rate: {courseDetails.completionRate}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={courseDetails.completionRate}
                      color={getProgressColor(courseDetails.completionRate)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" mb={1}>
                    Average Progress: {courseDetails.avgProgress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={courseDetails.avgProgress}
                    color={getProgressColor(courseDetails.avgProgress)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="error">
              Failed to load detailed analytics. Please try again.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AnalyticsTab;