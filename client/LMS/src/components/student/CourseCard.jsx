import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Button,
  CardMedia,
} from "@mui/material";
import { PlayCircle } from "@mui/icons-material";

const CourseCard = ({ course, onContinue }) => {
  return (
    <Card sx={{ height: "100%", borderRadius: 2 }}>
      {/* Course Thumbnail */}
      <CardMedia
        component="img"
        height="140"
        image={course.thumbnail}
        alt={course.name}
      />
      
      <CardContent>
        {/* Course Name */}
        <Typography variant="h6" fontWeight="bold" mb={1}>
          {course.name}
        </Typography>
        
        {/* Instructor */}
        <Typography variant="body2" color="text.secondary" mb={2}>
          Instructor: {course.instructor}
        </Typography>

        {/* Progress Section */}
        <Box mb={3}>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            color="primary.main"
            textAlign="center"
            mb={1}
          >
            {course.progress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={course.progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Continue Button */}
        <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            startIcon={<PlayCircle />}
            sx={{ borderRadius: 2 }}
            onClick={onContinue}
            fullWidth
          >
            Continue
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;