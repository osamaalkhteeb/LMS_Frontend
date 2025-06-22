import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Tabs,
  Tab,
  Alert,
  useTheme,
  useMediaQuery,
  styled
} from "@mui/material";
import { CircleLoader } from 'react-spinners';
import { useAuth } from "../../hooks/useAuth";
import StatCard from "../../components/admin/StatCard";
import UserManagement from "../../components/admin/UserManagement";
import CourseApprovals from "../../components/admin/CourseApprovals";
import SystemHealth from "../../components/admin/SystemHealth";
import AnalyticsTab from "../../components/admin/AnalyticsTab";
import SystemReports from "../../components/admin/SystemReports";
import { FiUsers, FiBookOpen, FiUserCheck, FiActivity } from "react-icons/fi";

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
import { getUserStats } from "../../services/userService";
import {
  getCourseStats,
  getPendingCourses,
} from "../../services/courseService";

const AdminDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    userStats: null,
    courseStats: null,
    pendingCoursesCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true, error: null }));

        const [userStatsResponse, courseStatsResponse, pendingCoursesResponse] =
          await Promise.all([
            getUserStats(),
            getCourseStats(),
            getPendingCourses({ limit: 100 }), // Get pending courses to count them
          ]);

        setStats({
          userStats: userStatsResponse,
          courseStats: courseStatsResponse,
          pendingCoursesCount: pendingCoursesResponse.data.pagination.total,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load dashboard statistics",
        }));
      }
    };

    fetchStats();
  }, []);

  // Admin data using real user info
  const admin = {
    name: user?.name || "Admin User",
    email: user?.email || "admin@example.com",
    avatar: user?.avatar_url || "/api/placeholder/40/40",
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
        }}
      >
        <Box display="flex" alignItems="center" gap={3} mb={2}>
          <Avatar
            src={
              admin.avatar ? `${admin.avatar}?t=${Date.now()}` : admin.avatar
            }
            sx={{
              width: 80,
              height: 80,
              fontSize: "2rem",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              border: '3px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            {admin.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
              Welcome back, {admin.name}!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {admin.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box mb={4}>
        {/* Stats Cards */}
        {stats.loading ? (
          <Grid container spacing={{ xs: 2, md: 3 }} mb={4}>
            {[...Array(4)].map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <ModernPaper sx={{ p: 2, textAlign: "center" }}>
                  <Box
                    sx={{
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircleLoader size={24} color="#7f00ff" />
                  </Box>
                </ModernPaper>
              </Grid>
            ))}
          </Grid>
        ) : stats.error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {stats.error}
          </Alert>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3 }} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Users"
                value={(() => {
                  const value = stats.userStats?.totalUsers || 0;

                  return value;
                })()}
                icon={FiUsers}
                color="primary"
                variant="gradient"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending Courses"
                value={(() => {
                  const value = stats.pendingCoursesCount;

                  return value;
                })()}
                icon={FiBookOpen}
                color="warning"
                variant="gradient"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Instructors"
                value={(() => {
                  const value = stats.userStats?.instructors || 0;

                  return value;
                })()}
                icon={FiUserCheck}
                color="success"
                variant="gradient"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Courses"
                value={(() => {
                  const value = stats.courseStats?.totalCourses || 0;

                  return value;
                })()}
                icon={FiActivity}
                color="secondary"
                variant="gradient"
              />
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Tabs Section */}
      <ModernPaper sx={{ mb: 4 }}>
        <ModernTabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <ModernTab value="overview" label="Overview" />
          <ModernTab value="users" label="User Management" />
          <ModernTab value="courses" label="Course Approvals" />
          <ModernTab value="analytics" label="Analytics" />
          <ModernTab value="system" label="System Health" />
          <ModernTab value="reports" label="Reports" />
        </ModernTabs>
      </ModernPaper>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <Box sx={{ mb: 4 }}>
          <ModernPaper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="semibold" mb={3}>
              Quick Stats
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {stats.userStats?.students || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Students
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {stats.userStats?.activeUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="secondary.main"
                  >
                    {stats.courseStats?.publishedCourses || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Published Courses
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    {stats.userStats?.recentLogins || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recent Logins
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </ModernPaper>
        </Box>
      )}
      {activeTab === "users" && <UserManagement />}
      {activeTab === "courses" && <CourseApprovals />}
      {activeTab === "analytics" && <AnalyticsTab />}
      {activeTab === "system" && <SystemHealth />}
      {activeTab === "reports" && <SystemReports />}
    </Container>
  );
};

export default AdminDashboard;
