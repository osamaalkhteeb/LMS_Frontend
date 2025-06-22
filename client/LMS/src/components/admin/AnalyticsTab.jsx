import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import { ClockLoader } from "react-spinners";
import { FiTrendingUp, FiUsers, FiBookOpen, FiDollarSign, FiUserCheck, FiTarget } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useAdminAnalytics } from '../../hooks/useAnalytics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsTab = () => {
  const { analytics, loading, error } = useAdminAnalytics();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={300}
      >
        <ClockLoader size={50} color="#7f00ff" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No analytics data available.
      </Alert>
    );
  }

  // Color palette based on #7f00ff
  const colorShades = [
    "#7f00ff", // Base
    "#9c27ff", // Slightly lighter
    "#b266ff", // Lighter
    "#c299ff", // Softer
    "#d1b3ff", // Very light
    "#a84dff", // Vibrant variant
    "#8c1aff", // Deep variant
    "#6600cc", // Darker variant
  ];

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Icon size={40} color={color} />
        </Box>
      </CardContent>
    </Card>
  );

  // Chart configurations
  const userTrendChartData = {
    labels: analytics?.userTrend?.labels || [],
    datasets: [
      {
        label: "User Registrations",
        data: analytics?.userTrend?.data || [],
        borderColor: colorShades[0],
        backgroundColor: "rgba(127, 0, 255, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const courseTrendChartData = {
    labels: analytics?.courseTrend?.labels || [],
    datasets: [
      {
        label: "Course Creation",
        data: analytics?.courseTrend?.data || [],
        borderColor: colorShades[1],
        backgroundColor: "rgba(156, 39, 255, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const userRoleChartData = {
    labels: analytics?.userRoleDistribution?.labels || [],
    datasets: [
      {
        data: analytics?.userRoleDistribution?.data || [],
        backgroundColor: [colorShades[0], colorShades[1], colorShades[2]],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const courseStatusChartData = {
    labels: analytics?.courseStatusDistribution?.labels || [],
    datasets: [
      {
        data: analytics?.courseStatusDistribution?.data || [],
        backgroundColor: [colorShades[3], colorShades[4], colorShades[5]],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const coursesByCategoryChartData = {
    labels: (Array.isArray(analytics.coursesByCategory)
      ? analytics.coursesByCategory
      : []
    ).map((item) => {
      if (
        !item.category_name ||
        item.category_name === "null" ||
        item.category_name === null
      ) {
        return "Uncategorized";
      }
      return item.category_name;
    }),
    datasets: [
      {
        data: (Array.isArray(analytics.coursesByCategory)
          ? analytics.coursesByCategory
          : []
        ).map((item) => item.course_count),
        backgroundColor: [
          colorShades[0],
          colorShades[1],
          colorShades[2],
          colorShades[3],
          colorShades[4],
          colorShades[5],
          colorShades[6],
          colorShades[7],
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>

        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Active Users"
            value={analytics.activeUsers}
            icon={FiUserCheck}
            color={colorShades[1]}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Courses"
            value={analytics.totalCourses}
            icon={FiBookOpen}
            color={colorShades[2]}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Enrollments"
            value={analytics.totalEnrollments}
            icon={FiTarget}
            color={colorShades[3]}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* User Registration Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              User Registration Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={userTrendChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Course Creation Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Course Creation Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={courseTrendChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* User Role Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              User Role Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut data={userRoleChartData} options={doughnutOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Course Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Course Status Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={courseStatusChartData}
                options={doughnutOptions}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Courses by Category */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Courses by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={coursesByCategoryChartData}
                options={doughnutOptions}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsTab;