import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Visibility, 
  Grade, 
  Assignment as AssignmentIcon,
  People,
  Close,
  Download,
  Link as LinkIcon
} from '@mui/icons-material';
import { getInstructorAssignments, getAssignmentSubmissions, gradeSubmission } from '../../services/assignmentService';

const SubmissionsTab = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInstructorAssignments();
      if (response.success) {
        setAssignments(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch assignments');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmissions = async (assignment) => {
    try {
      setSelectedAssignment(assignment);
      setSubmissionsLoading(true);
      setSubmissionsDialogOpen(true);
      
      const response = await getAssignmentSubmissions(assignment.course_id, assignment.id);
      if (response.success && response.data) {
        setSubmissions(response.data || []);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    });
    setGradeDialogOpen(true);
  };

  const submitGrade = async () => {
    try {
      setGrading(true);
      const response = await gradeSubmission(selectedAssignment.course_id, selectedSubmission.id, gradeForm);
      if (response.success) {
        // Refresh submissions
        await handleViewSubmissions(selectedAssignment);
        setGradeDialogOpen(false);
        setSelectedSubmission(null);
        setGradeForm({ grade: '', feedback: '' });
      }
    } catch (err) {
      console.error('Error grading submission:', err);
    } finally {
      setGrading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'warning';
      case 'graded':
        return 'success';
      case 'late':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchAssignments}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Assignment Management
        </Typography>
        <Button variant="outlined" onClick={fetchAssignments}>
          Refresh
        </Button>
      </Box>

      {assignments && assignments.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Assignment Title</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Module/Lesson</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Submissions</TableCell>
                <TableCell>Graded</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AssignmentIcon color="primary" />
                      <Typography variant="body2" fontWeight="medium">
                        {assignment.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{assignment.course_title}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {assignment.module_title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {assignment.lesson_title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(assignment.deadline)}
                    </Typography>
                    {new Date(assignment.deadline) < new Date() && (
                      <Chip label="Overdue" color="error" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={assignment.submission_count || 0} 
                      color="primary" 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={assignment.graded_count || 0} 
                      color="success" 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<People />}
                      onClick={() => handleViewSubmissions(assignment)}
                      variant="outlined"
                    >
                      View Submissions
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="300px"
          textAlign="center"
        >
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No assignments found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You haven't created any assignments yet.
          </Typography>
          <Button variant="outlined" onClick={fetchAssignments}>
            Refresh
          </Button>
        </Box>
      )}

      {/* Submissions Dialog */}
      <Dialog 
        open={submissionsDialogOpen} 
        onClose={() => setSubmissionsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Submissions for: {selectedAssignment?.title}
            </Typography>
            <IconButton onClick={() => setSubmissionsDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {submissionsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : submissions.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Submitted Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {submission.student_name || 'Unknown Student'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {submission.student_email}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={submission.grade ? 'Graded' : 'Submitted'} 
                          color={submission.grade ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {submission.grade ? (
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {submission.grade}/100
                            </Typography>
                            <Rating value={submission.grade / 20} readOnly size="small" />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not graded
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {submission.submission_url && (
                            <Tooltip title="View Submission">
                              <IconButton 
                                size="small"
                                onClick={() => {
                                  if (submission.submission_url.startsWith('http')) {
                                    window.open(submission.submission_url, '_blank');
                                  } else {
                                    // Handle text content
                                    alert(submission.submission_url);
                                  }
                                }}
                              >
                                {submission.submission_url.startsWith('http') ? <LinkIcon /> : <Visibility />}
                              </IconButton>
                            </Tooltip>
                          )}
                          <Button
                            size="small"
                            startIcon={<Grade />}
                            onClick={() => handleGradeSubmission(submission)}
                            variant={submission.grade ? 'outlined' : 'contained'}
                          >
                            {submission.grade ? 'Update Grade' : 'Grade'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" p={3}>
              <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No submissions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Students haven't submitted this assignment yet.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog 
        open={gradeDialogOpen} 
        onClose={() => setGradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Grade Submission
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Student: {selectedSubmission?.student_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Assignment: {selectedAssignment?.title}
            </Typography>
            
            <TextField
              fullWidth
              label="Grade (0-100)"
              type="number"
              value={gradeForm.grade}
              onChange={(e) => {
                const value = e.target.value;
                setGradeForm({ ...gradeForm, grade: value });
                
                // Show warning for negative values
                if (value < 0) {
                  console.warn('Warning: Negative grades are not recommended. Please use values between 0-100.');
                }
              }}
              inputProps={{ min: 0, max: 100 }}
              margin="normal"
              error={gradeForm.grade && gradeForm.grade > 100}
              helperText={
                gradeForm.grade && gradeForm.grade > 100
                  ? "Grade cannot exceed 100"
                  : "Enter a grade between 0-100"
              }
            />
            
            <TextField
              fullWidth
              label="Feedback"
              multiline
              rows={4}
              value={gradeForm.feedback}
              onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              margin="normal"
              placeholder="Provide feedback for the student..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={submitGrade}
            variant="contained"
            disabled={!gradeForm.grade || grading || gradeForm.grade > 100 || gradeForm.grade < 0}
          >
            {grading ? <CircularProgress size={20} /> : 'Submit Grade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubmissionsTab;