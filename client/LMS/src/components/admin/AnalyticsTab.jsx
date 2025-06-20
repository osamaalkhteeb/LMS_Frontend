
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
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
    console.log('AnalyticsTab - No analytics data available');
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No analytics data available.
      </Alert>
    );
  }
  

 

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card sx={{ height: '100%' }}>
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
        label: 'User Registrations',
        data: analytics?.userTrend?.data || [],
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const courseTrendChartData = {
    labels: analytics?.courseTrend?.labels || [],
    datasets: [
      {
        label: 'Course Creation',
        data: analytics?.courseTrend?.data || [],
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const userRoleChartData = {
    labels: analytics?.userRoleDistribution?.labels || [],
    datasets: [
      {
        data: analytics?.userRoleDistribution?.data || [],
        backgroundColor: [
          '#4caf50',
          '#2196f3',
          '#ff9800'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const courseStatusChartData = {
    labels: analytics?.courseStatusDistribution?.labels || [],
    datasets: [
      {
        data: analytics?.courseStatusDistribution?.data || [],
        backgroundColor: [
          '#4caf50',
          '#ff9800',
          '#f44336'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  // Courses by Category Chart Data

  
  const coursesByCategoryChartData = {
    labels: (Array.isArray(analytics.coursesByCategory) ? analytics.coursesByCategory : []).map(item => {
      if (!item.category_name || item.category_name === 'null' || item.category_name === null) {
        return 'Uncategorized';
      }
      return item.category_name;
    }),
    datasets: [
      {
        data: (Array.isArray(analytics.coursesByCategory) ? analytics.coursesByCategory : []).map(item => item.course_count),
        backgroundColor: [
          '#2196f3',
          '#4caf50',
          '#ff9800',
          '#9c27b0',
          '#f44336',
          '#00bcd4',
          '#795548',
          '#607d8b'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };



  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const dualAxisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Courses'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Enrollments'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Completion Rate (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top'
      }
    }
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
            title="Total Users"
            value={analytics.totalUsers}
            icon={FiUsers}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Active Users"
            value={analytics.activeUsers}
            icon={FiUserCheck}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Courses"
            value={analytics.totalCourses}
            icon={FiBookOpen}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Enrollments"
            value={analytics.totalEnrollments}
            icon={FiTarget}
            color="#9c27b0"
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
              <Doughnut data={courseStatusChartData} options={doughnutOptions} />
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
              <Doughnut data={coursesByCategoryChartData} options={doughnutOptions} />
            </Box>
          </Paper>
        </Grid>


      </Grid>
    </Box>
  );
};

export default AnalyticsTab;