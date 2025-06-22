import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Button,
  CardMedia,
  useTheme
} from "@mui/material";
import { PlayCircle } from "@mui/icons-material";

const CourseCard = ({ course, onContinue }) => {
  const theme = useTheme();

  return (
    <Card sx={{
      width: 300,
      height: 450,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 3,
      boxShadow: theme.shadows[2],
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[6]
      }
    }}>
      {/* Course Thumbnail - Fixed Height */}
      <CardMedia
        component="img"
        sx={{
          height: 160,
          objectFit: 'cover',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}
        image={course.thumbnail}
        alt={course.name}
      />
      
      {/* Card Content - Flex grow to fill remaining space */}
      <CardContent sx={{
        p: 3,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Course Name - Fixed height with line clamp */}
        <Typography
          variant="h6"
          fontWeight="bold"
          mb={1}
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '64px'
          }}
        >
          {course.name}
        </Typography>
        
        {/* Instructor - Fixed height */}
        <Typography
          variant="body2"
          color="text.secondary"
          mb={2}
          sx={{
            fontStyle: 'italic',
            minHeight: '20px'
          }}
        >
          By {course.instructor}
        </Typography>

        {/* Progress Section - Fixed height */}
        <Box mb={3} sx={{ minHeight: '52px' }}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="primary.main"
            >
              {course.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={course.progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* Continue Button - Fixed at bottom */}
        <Box sx={{ mt: 'auto' }}>
          <Button
            variant="contained"
            startIcon={<PlayCircle />}
            onClick={onContinue}
            fullWidth
            sx={{
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '0.9375rem'
            }}
          >
            {course.progress > 0 ? 'Continue' : 'Start Learning'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;