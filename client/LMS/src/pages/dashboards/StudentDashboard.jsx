
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Grid, Paper, Tabs, Tab, Container, CircularProgress, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import StudentProfile from "../../components/student/StudentProfile";
import StatCard from "../../components/student/StatCard";
import CourseCard from "../../components/student/CourseCard";
import CourseDetailsView from "../../components/student/CourseDetailsView";
import AssignmentsTab from "../../components/student/AssignmentsTab";
import QuizzesTab from "../../components/student/QuizzesTab";

import AssignmentDialog from "../../components/student/AssignmentsDialog";
import { CheckCircle, School, EmojiEvents, LocalFireDepartment } from '@mui/icons-material';
import { Description as FileText } from '@mui/icons-material';

// Import hooks
import { useAuthContext } from "../../hooks/useAuth";
import { useMyEnrollments } from "../../hooks/useEnrollments";
import { useQuizzesByLesson } from "../../hooks/useQuizzes";
import { useAssignmentsByLesson } from "../../hooks/useAssignments";
import { useModulesByCourse } from '../../hooks/useModules'; // Fixed path

const StudentDashboard = () => {
  // State declarations
  const [selectedTab, setSelectedTab] = useState(0);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Hooks for real data
  const { user } = useAuthContext();
  const { enrollments, loading: enrollmentsLoading, error: enrollmentsError, refetch: refetchEnrollments } = useMyEnrollments();
  const { quizzes, loading: quizzesLoading } = useQuizzesByLesson(currentLesson?.id);
  const { assignments, loading: assignmentsLoading } = useAssignmentsByLesson(currentLesson?.id);
  const { modules: courseModules, loading: modulesLoading } = useModulesByCourse(selectedCourse?.id);

  // Calculate student stats from real data
  const studentStats = {
    enrolledCourses: enrollments?.length || 0,
    completedCourses: enrollments?.filter(enrollment => enrollment.progress === 100)?.length || 0,
    certificatesEarned: enrollments?.filter(enrollment => enrollment.certificate_earned)?.length || 0,
    studyStreak: enrollments?.filter(enrollment => enrollment.progress > 0)?.length || 0,
  };

  // Transform enrollment data to match the expected course structure - memoized to prevent re-renders
  const enrolledCourses = useMemo(() => {
    return enrollments?.map(enrollment => ({
      id: enrollment.course_id,
      name: enrollment.title || 'Unknown Course',
      instructor: enrollment.instructor_name || 'Unknown Instructor',
      progress: enrollment.progress || 0,
      thumbnail: enrollment.thumbnail_url || '',
      description: enrollment.description || '',
      modules: [],
      enrollmentId: enrollment.id,
      enrolledAt: enrollment.enrolled_at,
      completedAt: enrollment.completed_at
    })) || [];
  }, [enrollments]);

  // Create a memoized course object to prevent unnecessary re-renders - MOVED OUTSIDE CONDITIONAL
  const courseWithModules = useMemo(() => ({
    ...selectedCourse,
    modules: courseModules || []
  }), [selectedCourse, courseModules]);

  // Handle tab parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabIndex = parseInt(tabParam, 10);
      if (tabIndex >= 0 && tabIndex <= 3) {
        setSelectedTab(tabIndex);
      }
    }
  }, [searchParams]);

  // ALL HANDLER FUNCTIONS - MOVE THESE HERE
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (newValue !== 0) {
      setSelectedCourse(null);
    }
  };

  const handleCourseSelect = useCallback(async (course) => {
    try {
      // Fetch complete course data for better course information
      const { getCourse } = await import('../../services/courseService');
      const fullCourseData = await getCourse(course.id);
      
      // Combine enrollment data with full course data
      const courseWithEnrollmentData = {
        ...fullCourseData,
        progress: course.progress,
        enrollmentId: course.enrollmentId,
        enrolledAt: course.enrolledAt,
        completedAt: course.completedAt
      };
      
      setSelectedCourse(courseWithEnrollmentData);
      setCurrentLesson(null);
      setCurrentVideo(null);
    } catch (error) {
      console.error('Error fetching course details:', error);
      // Fallback to basic course data if fetch fails
      setSelectedCourse(course);
      setCurrentLesson(null);
      setCurrentVideo(null);
    }
  }, []);

  const handleProgressUpdate = (newProgress) => {
    if (selectedCourse) {
      setSelectedCourse(prev => ({
        ...prev,
        progress: newProgress
      }));
      // Refresh enrollments to keep the course list in sync with updated progress
      refetchEnrollments();
    }
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
    setCurrentLesson(null);
    setCurrentVideo(null);
    // Refetch enrollments to get updated progress
    refetchEnrollments();
  };

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    if (lesson.video_url) {
      setCurrentVideo(lesson.video_url);
    }
  };

  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
    setOpenAssignmentDialog(true);
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };

  const handleSubmitAssignment = () => {
    setOpenAssignmentDialog(false);
    setFile(null);
  };

  // Loading and error states
  if (enrollmentsLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          Loading your dashboard...
        </Box>
      </Container>
    );
  }

  // Error state
  if (enrollmentsError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          Error loading dashboard: {enrollmentsError}
        </Box>
      </Container>
    );
  }

  // If a course is selected from My Courses tab, show the course detail view
  if (selectedCourse && selectedTab === 0) {
    // Show loading while modules are being fetched
    if (modulesLoading) {
      return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading course content...</Typography>
          </Box>
        </Container>
      );
    }

    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <CourseDetailsView
          selectedCourse={courseWithModules}
          onBack={handleBackToDashboard}
          onProgressUpdate={handleProgressUpdate}
          currentVideo={currentVideo}
          currentLesson={currentLesson}
          onLessonSelect={handleLessonSelect}
          notes={notes}
          onNotesChange={setNotes}
        />
      </Container>
    );
  }

  // Main dashboard view
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Student Profile */}
        <Grid item xs={12}>
          <StudentProfile 
            student={{
              name: user?.name || 'Student',
              email: user?.email || '',
              avatar: user?.avatar_url?.trim().replace(/`/g, '') || '',
              ...studentStats
            }} 
          />
        </Grid>


      </Grid>

      {/* Tabs Section */}
      <Paper sx={{ borderRadius: 2, mb: 4, mt: 4 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="My Courses" />
          <Tab label="Assignments" />
          <Tab label="Quizzes" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ minHeight: '400px' }}>
        {selectedTab === 0 && (
          <Grid container spacing={3}>
            {enrolledCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CourseCard
                  course={course}
                  onContinue={() => handleCourseSelect(course)}
                />
              </Grid>
            ))}
            {enrolledCourses.length === 0 && (
              <Grid item xs={12}>
                <Box textAlign="center" py={4}>
                  <p>No enrolled courses found. Start learning by enrolling in a course!</p>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
        
        {/* Assignments Tab */}
        {selectedTab === 1 && (
          <AssignmentsTab
            enrolledCourses={enrolledCourses}
          />
        )}
        
        {/* Quizzes Tab */}
        {selectedTab === 2 && (
          <QuizzesTab
            enrolledCourses={enrolledCourses}
          />
        )}
        

      </Box>

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={openAssignmentDialog}
        onClose={() => setOpenAssignmentDialog(false)}
        assignment={selectedAssignment}
        file={file}
        onFileUpload={handleFileUpload}
        onSubmit={handleSubmitAssignment}
      />
    </Container>
  );
};

export default StudentDashboard;
