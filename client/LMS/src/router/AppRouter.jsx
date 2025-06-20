import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import StudentDashboard from '../pages/dashboards/StudentDashboard';
import InstructorDashboard from '../pages/dashboards/InstructorDashboard';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import CourseCatalog from '../pages/CourseCatalog';
import NotFoundPage from '../pages/NotFoundPage';
import QuizTakingPage from '../pages/QuizTakingPage';
import QuizResultsPage from '../pages/QuizResultsPage';
import QuizHistoryPage from '../pages/QuizHistoryPage';
import MyProfile from '../components/MyProfile';
import SettingsPage from '../pages/SettingsPage';
import ProtectedRoute from '../components/ProtectedRoute';
import OAuthCallback from '../components/OAuthCallback';
import { useAuth } from '../hooks/useAuth';

const AppRouter = ({ mode, toggleDarkMode }) => {
  const { user } = useAuth();

  // Redirect authenticated users from login/signup to their dashboard
  const AuthRedirect = ({ children }) => {
    if (user) {
      const dashboardMap = {
        'student': '/dashboard/student',
        'instructor': '/dashboard/instructor',
        'admin': '/dashboard/admin'
      };
      return <Navigate to={dashboardMap[user.role] || '/dashboard/student'} replace />;
    }
    return children;
  };

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <Box sx={{ flex: 1 }}>
          <Routes>
            {/* Home Page - Courses Catalog with Header */}
            <Route path="/" element={
              <>
                <Header mode={mode} toggleDarkMode={toggleDarkMode} />
                <CourseCatalog />
              </>
            } />
            
            {/* Public Routes - WITH HEADER for back navigation */}
            <Route path="/login" element={
              <AuthRedirect>
                <>
                  <Header mode={mode} toggleDarkMode={toggleDarkMode} />
                  <LoginPage />
                </>
              </AuthRedirect>
            } />
            <Route path="/signup" element={
              <AuthRedirect>
                <>
                  <Header mode={mode} toggleDarkMode={toggleDarkMode} />
                  <SignupPage />
                </>
              </AuthRedirect>
            } />
            <Route path="/oauth-callback" element={<OAuthCallback />} />
            
            {/* Courses route redirect to home */}
            <Route path="/courses" element={<Navigate to="/" replace />} />
            
            {/* Protected Dashboard Routes - WITH HEADER */}
            <Route path="/dashboard/student" element={
              <>
                <Header mode={mode} toggleDarkMode={toggleDarkMode} />
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              </>
            } />
            <Route path="/dashboard/instructor" element={
              <>
                <Header mode={mode} toggleDarkMode={toggleDarkMode} />
                <ProtectedRoute requiredRole="instructor">
                  <InstructorDashboard />
                </ProtectedRoute>
              </>
            } />
            <Route path="/dashboard/admin" element={
              <>
                <Header mode={mode} toggleDarkMode={toggleDarkMode} />
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              </>
            } />
            
            {/* Profile and Settings Routes */}
            <Route path="/MyProfile" element={
              <>
                <Header mode={mode} toggleDarkMode={toggleDarkMode} />
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              </>
            } />
            <Route path="/SettingsPage" element={
              <>
                <Header mode={mode} toggleDarkMode={toggleDarkMode} />
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              </>
            } />
            
            {/* Quiz Routes */}
            <Route path="/quiz/:quizId" element={
              <>
                <Header mode={mode} toggleDarkMode={toggleDarkMode} />
                <ProtectedRoute requiredRole="student">
                  <QuizTakingPage />
                </ProtectedRoute>
              </>
            } />
            <Route path="/quiz/:quizId/results" element={
              <>
                <Header mode={mode} toggleDarkMode={toggleDarkMode} />
                <ProtectedRoute requiredRole="student">
                  <QuizResultsPage />
                </ProtectedRoute>
              </>
            } />
            <Route path="/quiz/:quizId/history" element={
              <>
                <Header mode={mode} toggleDarkMode={toggleDarkMode} />
                <ProtectedRoute requiredRole="student">
                  <QuizHistoryPage />
                </ProtectedRoute>
              </>
            } />
            
            {/* Generic dashboard redirect */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navigate to={user ? `/dashboard/${user.role}` : '/login'} replace />
              </ProtectedRoute>
            } />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Box>
        
        <Footer />
      </Box>
    </Router>
  );
};

export default AppRouter;