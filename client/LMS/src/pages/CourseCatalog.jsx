import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  PlayCircle,
  Article,
  Quiz,
  Bookmark,
  BookmarkBorder,
  Star,
  StarBorder,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CourseCatalog = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [previewDialog, setPreviewDialog] = useState({
    open: false,
    course: null
  });

  // Fetch data on component mount and when user changes
  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCourses(),
        fetchCategories(),
        user ? fetchEnrollments() : Promise.resolve()
      ]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/public`);
      setCourses(response.data.data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      throw err;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      const categoryData = response.data.data || [];
      setCategories([{ id: 0, name: 'All' }, ...categoryData]);
    } catch (err) {
      console.error('Error fetching categories:', err);
      throw err;
    }
  };

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_BASE_URL}/enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      // Don't throw here as enrollments are optional for guests
    }
  };

  // Helper function to check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  // Filter and sort courses based on search, category, and sort option
  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const selectedCategory = categories[tabValue];
      const matchesCategory = !selectedCategory || selectedCategory.name === 'All' || course.category_id === selectedCategory.id;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'students':
          return (b.enrolled_count || 0) - (a.enrolled_count || 0); // More students first
        default:
          return 0;
      }
    });

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handlePreview = (course) => {
    setPreviewDialog({ open: true, course });
  };

  const handleClosePreview = () => {
    setPreviewDialog({ open: false, course: null });
  };

  // Handle enrollment
  const handleEnroll = async (courseId) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Please log in to enroll in courses.',
        severity: 'warning'
      });
      return;
    }

    if (user.role === 'admin' || user.role === 'instructor') {
      setSnackbar({
        open: true,
        message: 'Instructors and admins cannot enroll in courses.',
        severity: 'info'
      });
      return;
    }

    // Check if already enrolled
    if (enrollments.some(enrollment => enrollment.course_id === courseId)) {
      setSnackbar({
        open: true,
        message: 'You are already enrolled in this course.',
        severity: 'info'
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/enrollments`, 
        { course_id: courseId },
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          } 
        }
      );
      
      // Refresh enrollments
      await fetchEnrollments();
      
      setSnackbar({
        open: true,
        message: 'Successfully enrolled in the course!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to enroll in course.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header and Filters */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Course Catalog
        </Typography>
        <TextField
          label="Search Courses"
          variant="outlined"
          size="small"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* Category Tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        {categories.map((category, index) => (
          <Tab key={index} label={category.name} />
        ))}
      </Tabs>

      {/* Course Grid */}
      <Grid container spacing={3}>
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="students">Students</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        {filteredCourses.length === 0 ? (
          <Grid size={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                {searchTerm ? 'No courses found matching your search.' : 'No courses available.'}
              </Typography>
            </Box>
          </Grid>
        ) : (
          filteredCourses.map((course) => {
            const enrolled = isEnrolled(course.id);
            const categoryName = categories.find(cat => cat.id === course.category_id)?.name || 'Uncategorized';
            
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={course.id}>
                <Card
                  sx={{ 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column",
                    minHeight: '400px'
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={course.thumbnail_url || '/placeholder-course.jpg'}
                    alt={course.title}
                    sx={{ 
                      objectFit: 'cover',
                      width: '100%',
                      aspectRatio: '16/9'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Chip label={categoryName} size="small" color="primary" clickable={false} />
                      {enrolled && (
                        <Chip label="Enrolled" size="small" color="success" variant="outlined" clickable={false} />
                      )}
                    </Box>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="h3"
                      sx={{ mt: 1 }}
                    >
                      {course.title}
                    </Typography>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Instructor: {course.instructor_name || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Students: {course.enrolled_count || 0} enrolled
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handlePreview(course)}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      variant={enrolled ? "outlined" : "contained"}
                      color={enrolled ? "success" : "primary"}
                      onClick={enrolled ? undefined : () => handleEnroll(course.id)}
                      disabled={enrolled}
                    >
                      {enrolled ? "Enrolled" : "Enroll"}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Course Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        {previewDialog.course && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="div">
                {previewDialog.course.title}
              </Typography>
              <IconButton onClick={handleClosePreview}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <img
                  src={previewDialog.course.thumbnail_url || '/placeholder-course.jpg'}
                  alt={previewDialog.course.title}
                  style={{ 
                    width: '100%', 
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    margin: '0 auto',
                    display: 'block'
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Course Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Instructor:</strong> {previewDialog.course.instructor_name || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Category:</strong> {categories.find(cat => cat.id === previewDialog.course.category_id)?.name || 'Uncategorized'}
                    </Typography>
                  </Grid>
                  {previewDialog.course.created_at && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Created:</strong> {new Date(previewDialog.course.created_at).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Students:</strong> {previewDialog.course.enrolled_count || 0} enrolled
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Status:</strong> 
                      <Chip 
                        label={isEnrolled(previewDialog.course.id) ? "Enrolled" : "Available"} 
                        size="small" 
                        color={isEnrolled(previewDialog.course.id) ? "success" : "primary"} 
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {previewDialog.course.description && (
                 <Box sx={{ mb: 3 }}>
                   <Typography variant="h6" gutterBottom>
                     Course Description
                   </Typography>
                   <Typography variant="body1" paragraph>
                     {previewDialog.course.description}
                   </Typography>
                 </Box>
               )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleClosePreview} variant="outlined">
                Close
              </Button>
              <Button
                variant="contained"
                color={isEnrolled(previewDialog.course.id) ? "success" : "primary"}
                onClick={() => {
                  if (!isEnrolled(previewDialog.course.id)) {
                    handleEnroll(previewDialog.course.id);
                  }
                  handleClosePreview();
                }}
                disabled={isEnrolled(previewDialog.course.id)}
              >
                {isEnrolled(previewDialog.course.id) ? "Already Enrolled" : "Enroll Now"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CourseCatalog;