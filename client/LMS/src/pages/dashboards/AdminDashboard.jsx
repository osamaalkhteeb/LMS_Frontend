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
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import StatCard from "../../components/admin/StatCard";
import UserManagement from "../../components/admin/UserManagement";
import CourseApprovals from "../../components/admin/CourseApprovals";
import SystemHealth from "../../components/admin/SystemHealth";
import AnalyticsTab from "../../components/admin/AnalyticsTab";
import SystemReports from "../../components/admin/SystemReports";
import { FiUsers, FiBookOpen, FiUserCheck, FiActivity } from "react-icons/fi";
import { getUserStats } from "../../services/userService";
import {
  getCourseStats,
  getPendingCourses,
} from "../../services/courseService";

const AdminDashboard = () => {
  const { user } = useAuth();
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
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={3} mb={4}>
          <Avatar
            src={
              admin.avatar ? `${admin.avatar}?t=${Date.now()}` : admin.avatar
            }
            sx={{
              width: 80,
              height: 80,
              fontSize: "2rem",
              bgcolor: "primary.main",
            }}
          >
            {admin.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome, {admin.name}
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards */}
        {stats.loading ? (
          <Grid container spacing={3} mb={4}>
            {[...Array(4)].map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Box
                    sx={{
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : stats.error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {stats.error}
          </Alert>
        ) : (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Users"
                value={(() => {
                  const value = stats.userStats?.totalUsers || 0;

                  return value;
                })()}
                icon={FiUsers}
                color="primary"
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
                color="info"
              />
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Tabs Section */}
      <Paper sx={{ borderRadius: 2, mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="overview" label="Overview" />
          <Tab value="users" label="User Management" />
          <Tab value="courses" label="Course Approvals" />
          <Tab value="analytics" label="Analytics" />
          <Tab value="system" label="System Health" />
          <Tab value="reports" label="Reports" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
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
          </Paper>
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
