
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Alert,
  styled
} from "@mui/material";
import { CircleLoader } from 'react-spinners';
import { useNavigate, useSearchParams } from "react-router-dom";
import StudentProfile from "../../components/student/StudentProfile";
import StatCard from "../../components/student/StatCard";
import CourseCard from "../../components/student/CourseCard";
import CourseDetailsView from "../../components/student/CourseDetailsView";
import AssignmentsTab from "../../components/student/AssignmentsTab";
import QuizzesTab from "../../components/student/QuizzesTab";

import AssignmentDialog from "../../components/student/AssignmentsDialog";
import { validateFileUpload } from '../../utils/constants';
import { FiBook, FiAward, FiClock, FiTrendingUp } from "react-icons/fi";

import { useAuthContext } from "../../hooks/useAuth";
import { useMyEnrollments } from "../../hooks/useEnrollments";
import { useQuizzesByLesson } from "../../hooks/useQuizzes";
import { useAssignmentsByLesson } from "../../hooks/useAssignments";
import { useModulesByCourse } from '../../hooks/useModules';

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

const StudentDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  const handleTabChange = useCallback((event, newValue) => {
    setSelectedTab(newValue);
    if (newValue !== 0) {
      setSelectedCourse(null);
    }
  }, []);

  const handleCourseSelect = useCallback((course) => {
    setSelectedCourse(course);
    setCurrentLesson(null);
    setCurrentVideo(null);
  }, []);

  const handleProgressUpdate = useCallback((newProgress) => {
    if (selectedCourse) {
      setSelectedCourse(prev => ({
        ...prev,
        progress: newProgress
      }));
      // Refresh enrollments to keep the course list in sync with updated progress
      refetchEnrollments();
    }
  }, [selectedCourse]);

  const handleBackToDashboard = useCallback(() => {
    setSelectedCourse(null);
    setCurrentLesson(null);
    setCurrentVideo(null);
    refetchEnrollments();
  }, [refetchEnrollments]);

  const handleLessonSelect = useCallback((lesson) => {
    setCurrentLesson(lesson);
    if (lesson.video_url) {
      setCurrentVideo(lesson.video_url);
    }
  }, []);

  const handleAssignmentClick = useCallback((assignment) => {
    setSelectedAssignment(assignment);
    setOpenAssignmentDialog(true);
  }, []);

  const handleFileUpload = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  }, []);

  const handleSubmitAssignment = useCallback(() => {
    setOpenAssignmentDialog(false);
    setFile(null);
  }, []);

  if (enrollmentsLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircleLoader size={50} color="#7f00ff" />
        </Box>
      </Container>
    );
  }

  if (enrollmentsError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
            {enrollmentsError}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (selectedCourse && selectedTab === 0) {
    if (modulesLoading) {
      return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircleLoader size={50} color="#7f00ff" />
          </Box>
        </Container>
      );
    }

    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
            src={user?.avatar_url?.trim().replace(/`/g, '') || ''}
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
              Welcome back, {user?.name || 'Student'}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Here's your learning progress and upcoming activities
            </Typography>
          </Box>
        </Box>

        {/* Modern Stats Cards */}
        <Grid container spacing={isMobile ? 2 : 3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Enrolled Courses"
              value={studentStats.enrolledCourses}
              icon={FiBook}
              color="primary"
              variant="gradient"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed Courses"
              value={studentStats.completedCourses}
              icon={FiAward}
              color="success"
              variant="gradient"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Courses"
              value={studentStats.studyStreak}
              icon={FiClock}
              color="info"
              variant="gradient"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Modern Tabs Section */}
      <ModernPaper sx={{ mb: 4 }}>
        <ModernTabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <ModernTab value={0} label="My Courses" />
          <ModernTab value={1} label="Assignments" />
          <ModernTab value={2} label="Quizzes" />
        </ModernTabs>
      </ModernPaper>

      {/* Tab Content */}
      <Box sx={{ mb: 4 }}>
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
                <ModernPaper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">No enrolled courses found.</Typography>
                </ModernPaper>
              </Grid>
            )}
          </Grid>
        )}
        
        {selectedTab === 1 && (
          <ModernPaper sx={{ p: 3 }}>
            <AssignmentsTab
              enrolledCourses={enrolledCourses}
            />
          </ModernPaper>
        )}
        
        {selectedTab === 2 && (
          <ModernPaper sx={{ p: 3 }}>
            <QuizzesTab
              enrolledCourses={enrolledCourses}
            />
          </ModernPaper>
        )}
      </Box>

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
