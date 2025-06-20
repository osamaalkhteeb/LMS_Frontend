import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  Alert
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, People as PeopleIcon, MoreVert as MoreIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import { getInstructorCourses, publishCourse } from "../../services/courseService";

const CoursesTab = ({ courses: propCourses, loading: propLoading, error: propError, onRefresh, handleDialogOpen, handleMenuClick, handleCourseClick, handleViewStudents }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");

  useEffect(() => {
    if (propCourses) {
      setCourses(propCourses);
      setLoading(propLoading || false);
      setError(propError || null);
    } else {
      fetchCourses();
    }
  }, [propCourses, propLoading, propError]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInstructorCourses({ limit: 100 });
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchCourses} sx={{ ml: 2 }}>Retry</Button>
      </Alert>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">My Courses ({courses.length})</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen && handleDialogOpen("create")}
        >
          Create Course
        </Button>
      </Box>

      {courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No courses found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first course to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ position: "relative", cursor: 'pointer' }} onClick={() => handleCourseClick && handleCourseClick(course)}>
                  <img
                    src={course.thumbnail_url || '/api/placeholder/300/200'}
                    alt={course.title}
                    style={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                    }}
                  />
                  <Chip
                    label={course.is_published ? 'Published' : 'Draft'}
                    color={course.is_published ? "success" : "warning"}
                    size="small"
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => handleCourseClick && handleCourseClick(course)}>
                  <Typography variant="h6" gutterBottom>
                    {course.title}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PeopleIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">
                      {course.enrolled_count || 0} students
                    </Typography>
                  </Box>
                  
                  {!course.is_approved && (
                    <Chip 
                      label="Pending Approval" 
                      color="warning" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewStudents && handleViewStudents(course);
                    }}
                  >
                    View Students
                  </Button>
                  <IconButton
                    onClick={(e) => handleMenuClick && handleMenuClick(e, course)}
                    size="small"
                  >
                    <MoreIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default CoursesTab;
