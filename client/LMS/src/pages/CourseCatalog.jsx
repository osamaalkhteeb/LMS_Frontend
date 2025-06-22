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
  Alert,
  Snackbar,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { CircleLoader } from 'react-spinners';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { FiBook, FiAward, FiClock, FiTrendingUp } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Modern styled components matching admin dashboard
const ModernPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[6],
  },
}));

const ModernTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    height: "4px",
    borderRadius: "2px",
  },
}));

const ModernTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.875rem",
  minWidth: "unset",
  padding: theme.spacing(1, 2),
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
}));

const ModernCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: "12px",
  boxShadow: theme.shadows[2],
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  '&:hover': {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
  },
}));

const CourseCatalog = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircleLoader size={60} color="#7f00ff" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Modern Header Section */}
      <Box mb={4}>
        <Box
          display="flex"
          alignItems="center"
          gap={3}
          mb={4}
          sx={{
            p: 3,
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            color: "white",
            boxShadow: theme.shadows[2],
          }}
        >
          <Avatar
            src={user?.avatar_url || ''}
            sx={{
              width: 72,
              height: 72,
              fontSize: "1.75rem",
              bgcolor: "primary.dark",
              border: "3px solid rgba(255,255,255,0.2)",
            }}
          >
            {user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome to the Course Catalog, {user?.name || 'Student'}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Browse and enroll in our wide range of courses
            </Typography>
          </Box>
        </Box>

        {/* Search and Filter Section */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 3,
          mb: 4
        }}>
          <TextField
            fullWidth
            sx={{ maxWidth: 400 }}
            size="small"
            placeholder="Search courses..."
            variant="outlined"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              sx: { borderRadius: '50px', backgroundColor: 'background.paper' }
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon color="action" />
              <Typography variant="body2" color="text.secondary">
                Sort by:
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ 
                  borderRadius: '50px',
                  '& .MuiSelect-select': { py: 1 }
                }}
              >
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="students">Popularity</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* Modern Category Tabs */}
      <ModernPaper sx={{ mb: 4 }}>
        <ModernTabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((category, index) => (
            <ModernTab key={index} label={category.name} />
          ))}
        </ModernTabs>
      </ModernPaper>

      {/* Course Count */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Available
      </Typography>

      {/* Modern Course Grid */}
        {filteredCourses.length === 0 ? (
        <ModernPaper sx={{ 
          p: 4, 
          textAlign: 'center',
        }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No courses found matching your search.' : 'No courses available in this category.'}
          </Typography>
          {searchTerm && (
            <ModernButton 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </ModernButton>
          )}
        </ModernPaper>
      ) : (
        <Grid container spacing={3}>
          {filteredCourses.map((course) => {
            const enrolled = isEnrolled(course.id);
            const categoryName = categories.find(cat => cat.id === course.category_id)?.name || 'Uncategorized';
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                <ModernCard>
                  <CardMedia
                    component="img"
                    image={course.thumbnail_url || '/placeholder-course.jpg'}
                    alt={course.title}
                    sx={{ 
                      width: '100%',
                      height: 160,
                      objectFit: 'contain',
                      backgroundColor: 'background.default',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px'
                    }}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Chip 
                        label={categoryName} 
                        size="small" 
                        color="primary" 
                        sx={{ 
                          borderRadius: 1,
                          fontWeight: 500
                        }} 
                      />
                      {enrolled && (
                        <Chip 
                          label="Enrolled" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                          sx={{
                            borderRadius: 1,
                            fontWeight: 500
                          }}
                        />
                      )}
                    </Box>
                    
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="h3"
                      sx={{ 
                        fontWeight: 600,
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {course.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Instructor: {course.instructor_name || 'Unknown'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Students: {course.enrolled_count || 0}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <ModernButton
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handlePreview(course)}
                      sx={{ flexGrow: 1 }}
                    >
                      Preview
                    </ModernButton>
                    <ModernButton
                      size="small"
                      variant="contained"
                      color={enrolled ? "success" : "primary"}
                      onClick={enrolled ? undefined : () => handleEnroll(course.id)}
                      disabled={enrolled}
                      sx={{ 
                        flexGrow: 1,
                        '&.Mui-disabled': {
                          backgroundColor: 'success.main',
                          color: 'white'
                        }
                      }}
                    >
                      {enrolled ? "Enrolled" : "Enroll Now"}
                    </ModernButton>
                  </CardActions>
                </ModernCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modern Course Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        {previewDialog.course && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pb: 1,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="h5" component="div" fontWeight="bold">
                {previewDialog.course.title}
              </Typography>
              <IconButton onClick={handleClosePreview} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ 
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: 'background.default',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: { xs: 200, sm: 300 }
              }}>
                <img
                  src={previewDialog.course.thumbnail_url || '/placeholder-course.jpg'}
                  alt={previewDialog.course.title}
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Course Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {previewDialog.course.description || 'No description available.'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <ModernPaper elevation={0} sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Course Details
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Instructor:
                      </Typography>
                      <Typography variant="body1">
                        {previewDialog.course.instructor_name || 'Unknown'}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Category:
                        </Typography>
                        <Chip 
                          label={categories.find(cat => cat.id === previewDialog.course.category_id)?.name || 'Uncategorized'}
                          size="small"
                          color="primary"
                          sx={{ borderRadius: 1 }}
                        />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Students:
                        </Typography>
                        <Typography variant="body1">
                          {previewDialog.course.enrolled_count || 0}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Status:
                        </Typography>
                        <Chip 
                          label={isEnrolled(previewDialog.course.id) ? "Enrolled" : "Available"} 
                          size="small" 
                          color={isEnrolled(previewDialog.course.id) ? "success" : "primary"} 
                        />
                      </Grid>
                    </Grid>
                  </ModernPaper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <ModernButton 
                onClick={() => setPreviewDialog({ open: false, course: null })}
                variant="outlined"
                color="inherit"
              >
                Close
              </ModernButton>
              {!isEnrolled(previewDialog.course.id) && (
                <ModernButton 
                  onClick={() => handleEnroll(previewDialog.course.id)}
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 120 }}
                >
                  Enroll Now
                </ModernButton>
              )}
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