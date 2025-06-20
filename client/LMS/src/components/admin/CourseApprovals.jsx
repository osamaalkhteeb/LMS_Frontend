import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { getPendingCourses, approveCourse } from "../../services/courseService";

const CourseApprovals = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});


  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPendingCourses({ limit: 100 });
      setPendingCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching pending courses:', error);
      setError('Failed to load pending courses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      setActionLoading(prev => ({ ...prev, [courseId]: 'approving' }));
      await approveCourse(courseId, { is_approved: true });
      setPendingCourses(pendingCourses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Error approving course:', error);
      setError('Failed to approve course');
    } finally {
      setActionLoading(prev => ({ ...prev, [courseId]: null }));
    }
  };



  // Removed hardcoded data - now using real API data only



  return (
    <>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Pending Course Approvals
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Instructor</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Alert severity="error">{error}</Alert>
                    </TableCell>
                  </TableRow>
                ) : pendingCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No pending courses found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={course.thumbnail_url ? `${course.thumbnail_url}?t=${Date.now()}` : course.thumbnail_url}
                            alt={course.title}
                            variant="rounded"
                            sx={{ width: 60, height: 40 }}
                          >
                            {course.title?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{course.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {course.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{course.instructor_name}</TableCell>
                      <TableCell>{course.category_name}</TableCell>
                      <TableCell>
                        {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={course.status || "Pending"}
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleApprove(course.id)}
                            disabled={actionLoading[course.id] === 'approving'}
                          >
                            {actionLoading[course.id] === 'approving' ? 'Approving...' : 'Approve'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default CourseApprovals;
