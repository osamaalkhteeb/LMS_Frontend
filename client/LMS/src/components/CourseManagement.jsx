import React, { useState } from 'react';
import {
  Container, Grid, Card, CardContent, CardMedia, CardActions,
  Typography, Button, Chip, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl,
  InputLabel, Box, IconButton, Tabs, Tab, Divider
} from '@mui/material';
import {
  Add, Edit, Delete, PlayCircle, Article, Quiz,
  Bookmark, BookmarkBorder, Star, StarBorder
} from '@mui/icons-material';

// Sample course data
const initialCourses = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    category: 'Programming',
    description: 'Learn core JavaScript concepts',
    thumbnail: 'https://source.unsplash.com/random/300x200/?javascript',
    enrolled: true,
    rating: 4.5,
    content: {
      videos: 12,
      articles: 8,
      quizzes: 3
    }
  },
  {
    id: 2,
    title: 'Business Strategy',
    category: 'Business',
    description: 'Fundamentals of modern business strategy',
    thumbnail: 'https://source.unsplash.com/random/300x200/?business',
    enrolled: false,
    rating: 4.2,
    content: {
      videos: 8,
      articles: 10,
      quizzes: 2
    }
  }
];

const CourseManagement = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Categories for filtering
  const categories = ['All', 'Programming', 'Business', 'Design'];

  // Filter courses based on search and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = tabValue === 0 || course.category === categories[tabValue];
    return matchesSearch && matchesCategory;
  });

  // CRUD Operations
  const handleCreate = () => {
    setCurrentCourse({
      id: Math.max(...courses.map(c => c.id)) + 1,
      title: '',
      category: 'Programming',
      description: '',
      thumbnail: '',
      enrolled: false,
      rating: 0,
      content: { videos: 0, articles: 0, quizzes: 0 }
    });
    setOpenDialog(true);
  };

  const handleUpdate = (course) => {
    setCurrentCourse({...course});
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const handleSave = () => {
    if (currentCourse.id > Math.max(...courses.map(c => c.id))) {
      // Create new
      setCourses([...courses, currentCourse]);
    } else {
      // Update existing
      setCourses(courses.map(c => c.id === currentCourse.id ? currentCourse : c));
    }
    setOpenDialog(false);
  };

  const handleEnroll = (id) => {
    setCourses(courses.map(course => 
      course.id === id ? {...course, enrolled: !course.enrolled} : course
    ));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header and Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Course Catalog</Typography>
        <TextField
          label="Search Courses"
          variant="outlined"
          size="small"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* Category Tabs */}
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        {categories.map((category, index) => (
          <Tab key={index} label={category} />
        ))}
      </Tabs>

      {/* Admin Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleCreate}
        >
          Add New Course
        </Button>
      </Box>

      {/* Course Grid */}
      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={course.thumbnail}
                alt={course.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Chip label={course.category} size="small" color="primary" />
                  <Box>
                    {[...Array(5)].map((_, i) => (
                      i < Math.floor(course.rating) ? 
                        <Star key={i} color="warning" fontSize="small" /> : 
                        <StarBorder key={i} color="warning" fontSize="small" />
                    ))}
                  </Box>
                </Box>
                <Typography gutterBottom variant="h6" component="h3" sx={{ mt: 1 }}>
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {course.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Chip icon={<PlayCircle />} label={`${course.content.videos} Videos`} size="small" />
                  <Chip icon={<Article />} label={`${course.content.articles} Articles`} size="small" />
                  <Chip icon={<Quiz />} label={`${course.content.quizzes} Quizzes`} size="small" />
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button 
                  size="small" 
                  color={course.enrolled ? "success" : "primary"}
                  onClick={() => handleEnroll(course.id)}
                >
                  {course.enrolled ? 'Enrolled' : 'Enroll'}
                </Button>
                <Box>
                  <IconButton onClick={() => handleUpdate(course)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(course.id)}>
                    <Delete color="error" />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Course Edit/Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentCourse?.id > Math.max(...courses.map(c => c.id)) ? 'Create Course' : 'Edit Course'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Course Title"
              value={currentCourse?.title || ''}
              onChange={(e) => setCurrentCourse({...currentCourse, title: e.target.value})}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={currentCourse?.category || 'Programming'}
                label="Category"
                onChange={(e) => setCurrentCourse({...currentCourse, category: e.target.value})}
              >
                {categories.filter(c => c !== 'All').map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={currentCourse?.description || ''}
              onChange={(e) => setCurrentCourse({...currentCourse, description: e.target.value})}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Thumbnail URL"
              value={currentCourse?.thumbnail || ''}
              onChange={(e) => setCurrentCourse({...currentCourse, thumbnail: e.target.value})}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Content Details</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Videos"
                  value={currentCourse?.content.videos || 0}
                  onChange={(e) => setCurrentCourse({
                    ...currentCourse, 
                    content: {...currentCourse.content, videos: parseInt(e.target.value)}
                  })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Articles"
                  value={currentCourse?.content.articles || 0}
                  onChange={(e) => setCurrentCourse({
                    ...currentCourse, 
                    content: {...currentCourse.content, articles: parseInt(e.target.value)}
                  })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quizzes"
                  value={currentCourse?.content.quizzes || 0}
                  onChange={(e) => setCurrentCourse({
                    ...currentCourse, 
                    content: {...currentCourse.content, quizzes: parseInt(e.target.value)}
                  })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseManagement;nagement;