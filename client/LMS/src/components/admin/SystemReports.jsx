import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Box,
  Chip
} from "@mui/material";
import {
  BarChart as ChartIcon,
  People as PeopleIcon,
  Book as CourseIcon,

  Settings as SettingsIcon,

  Download as DownloadIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";

import { getReports, generateReport, downloadReport } from "../../services/systemService";


const SystemReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState({});

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReports();
      setReports(response || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType) => {
    try {
      setGenerating(prev => ({ ...prev, [reportType]: true }));
      const response = await generateReport(reportType);
      // Refresh reports list after generating
      await fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
    } finally {
      setGenerating(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      await downloadReport(reportId);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report');
    }
  };



  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card sx={{ height: '100%', borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                System Reports
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchReports}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Generated Date</TableCell>
                      <TableCell>Downloads</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No reports available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.name}</TableCell>
                          <TableCell>{report.type}</TableCell>
                          <TableCell>{report.generatedDate}</TableCell>
                          <TableCell>{report.downloads}</TableCell>
                          <TableCell>
                            <Chip 
                              label={report.status || 'Available'} 
                              color={report.status === 'Available' ? 'success' : 'default'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadReport(report.id)}
                              >
                                Download
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Quick Reports
            </Typography>
            <List>
              <ListItem 
                component="button" 
                onClick={() => handleGenerateReport('user-registration')}
                disabled={generating['user-registration']}
              >
                <ListItemIcon>
                  {generating['user-registration'] ? (
                    <CircularProgress size={20} />
                  ) : (
                    <PeopleIcon color="primary" />
                  )}
                </ListItemIcon>
                <ListItemText primary="User Registration Trends" />
              </ListItem>
              <Divider />
              <ListItem 
                component="button" 
                onClick={() => handleGenerateReport('course-enrollment')}
                disabled={generating['course-enrollment']}
              >
                <ListItemIcon>
                  {generating['course-enrollment'] ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CourseIcon color="secondary" />
                  )}
                </ListItemIcon>
                <ListItemText primary="Course Enrollment Stats" />
              </ListItem>
              <Divider />
              <ListItem 
                component="button" 
                onClick={() => handleGenerateReport('course-creation')}
                disabled={generating['course-creation']}
              >
                <ListItemIcon>
                  {generating['course-creation'] ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CourseIcon color="success" />
                  )}
                </ListItemIcon>
                <ListItemText primary="Course Creation Report" />
              </ListItem>
              <Divider />

              <ListItem 
                component="button" 
                onClick={() => handleGenerateReport('system-usage')}
                disabled={generating['system-usage']}
              >
                <ListItemIcon>
                  {generating['system-usage'] ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SettingsIcon color="info" />
                  )}
                </ListItemIcon>
                <ListItemText primary="System Usage Metrics" />
              </ListItem>
            </List>

          </CardContent>
        </Card>
      </Grid>


    </Grid>
  );
};

export default SystemReports;