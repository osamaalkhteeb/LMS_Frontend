
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { getAssignmentsByLesson, submitAssignment, deleteSubmission } from "../../services/assignmentService";
import { format, isAfter } from "date-fns";

const AssignmentsTab = ({ enrolledCourses }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitDialog, setSubmitDialog] = useState({ open: false, assignment: null });
  const [viewDialog, setViewDialog] = useState({ open: false, assignment: null });
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [enrolledCourses]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all assignments from enrolled courses using module data
      const allAssignments = [];
      
      for (const course of enrolledCourses) {
        try {
          // Get modules with assignments for this course
          const { getModulesByCourse } = await import('../../services/moduleService');
          const modules = await getModulesByCourse(course.id);
          
          // Extract assignments and fetch their detailed status
          for (const module of modules) {
            if (module.assignments && module.assignments.length > 0) {
              for (const assignment of module.assignments) {
                try {
                  // Fetch detailed assignment info with submission status
                  const { getAssignment } = await import('../../services/assignmentService');
                  const fullAssignment = await getAssignment(assignment.id);
                  
                  const assignmentWithDetails = {
                    ...assignment,
                    ...fullAssignment,
                    courseName: course.name || course.title,
                    courseId: course.id,
                    moduleTitle: module.title,
                    // Ensure status is properly set
                    status: fullAssignment.status || 'Pending',
                    submittedAt: fullAssignment.submitted_at
                  };
                  
                  allAssignments.push(assignmentWithDetails);
                } catch (assignmentErr) {
                  console.warn(`Failed to fetch details for assignment ${assignment.id}:`, assignmentErr);
                  // Fallback to basic assignment data
                  allAssignments.push({
                    ...assignment,
                    courseName: course.name || course.title,
                    courseId: course.id,
                    moduleTitle: module.title,
                    status: 'Pending'
                  });
                }
              }
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch assignments for course ${course.name || course.title}:`, err);
        }
      }
      
      setAssignments(allAssignments);
    } catch (err) {
      setError("Failed to load assignments. Please try again.");
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!submitDialog.assignment) return;
    
    try {
      setSubmitting(true);
      
      console.log('Submitting with file:', submissionFile);
      console.log('Submitting with text:', submissionText);
      
      const formData = new FormData();
      formData.append('content', submissionText);
      if (submissionFile) {
        formData.append('submissionFile', submissionFile);
        console.log('File appended to FormData:', submissionFile.name, submissionFile.size);
      } else {
        console.log('No file to append');
      }
      
      // Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log('FormData entry:', key, value);
      }
      
      await submitAssignment(submitDialog.assignment.id, formData);
      
      // Update assignment status locally
      setAssignments(prev => prev.map(assignment => 
        assignment.id === submitDialog.assignment.id 
          ? { ...assignment, status: 'Submitted', submittedAt: new Date().toISOString() }
          : assignment
      ));
      
      setSubmitDialog({ open: false, assignment: null });
      setSubmissionText("");
      setSubmissionFile(null);
    } catch (err) {
      setError("Failed to submit assignment. Please try again.");
      console.error("Error submitting assignment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmission = async (assignment) => {
    if (!assignment) return;
    
    // Check if deadline has passed
    if (assignment.deadline && isAfter(new Date(), new Date(assignment.deadline))) {
      setError("Cannot delete submission after the deadline has passed.");
      return;
    }
    
    try {
      await deleteSubmission(assignment.id);
      
      // Update assignment status locally
      setAssignments(prev => prev.map(a => 
        a.id === assignment.id 
          ? { ...a, status: 'Pending', submittedAt: null }
          : a
      ));
      
      setError(null);
    } catch (err) {
      setError("Failed to delete submission. Please try again.");
      console.error("Error deleting submission:", err);
    }
  };

  const handleViewSubmission = (assignment) => {
    setViewDialog({ open: true, assignment });
  };

  const getStatusColor = (assignment) => {
    if (!assignment) return 'default';
    if (assignment.status === 'Submitted') return 'success';
    if (assignment.deadline && isAfter(new Date(), new Date(assignment.deadline))) {
      return 'error';
    }
    return 'warning';
  };

  const getStatusLabel = (assignment) => {
    if (!assignment) return 'Unknown';
    if (assignment.status === 'Submitted') return 'Submitted';
    if (assignment.deadline && isAfter(new Date(), new Date(assignment.deadline))) {
      return 'Overdue';
    }
    return 'Pending';
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              My Assignments ({assignments.length})
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {assignments.length === 0 ? (
            <Box textAlign="center" py={4}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No assignments found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any assignments yet.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {assignment.title}
                        </Typography>
                        {assignment.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {assignment.description.substring(0, 100)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{assignment.courseName}</TableCell>
                      <TableCell>
                        {assignment.deadline ? (
                          <Box display="flex" alignItems="center">
                            <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {format(new Date(assignment.deadline), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No deadline
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(assignment)}
                          color={getStatusColor(assignment)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {assignment.grade ? (
                          <Typography variant="body2" fontWeight="medium">
                            {assignment.grade}%
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not graded
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {assignment.status === 'Submitted' ? (
                            <>
                              <Tooltip title="View submission">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleViewSubmission(assignment)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete submission">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteSubmission(assignment)}
                                  disabled={assignment.deadline && isAfter(new Date(), new Date(assignment.deadline))}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<UploadIcon />}
                              onClick={() => setSubmitDialog({ open: true, assignment })}
                              disabled={assignment.deadline && isAfter(new Date(), new Date(assignment.deadline))}
                            >
                              Submit
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Submit Assignment Dialog */}
      <Dialog 
        open={submitDialog.open} 
        onClose={() => setSubmitDialog({ open: false, assignment: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submit Assignment: {submitDialog.assignment?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Assignment Content"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Enter your assignment content here..."
              sx={{ mb: 2 }}
            />
            
            <input
              type="file"
              name="submissionFile"
              accept=".doc,.docx,.pdf,.txt"
              onChange={(e) => {
                const file = e.target.files[0];
                console.log('File selected:', file);
                setSubmissionFile(file);
              }}
              style={{ marginBottom: 16 }}
            />
            
            {submissionFile && (
              <Typography variant="body2" color="text.secondary">
                Selected file: {submissionFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSubmitDialog({ open: false, assignment: null })}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAssignment}
            variant="contained"
            disabled={submitting || (!submissionText.trim() && !submissionFile)}
            startIcon={submitting ? <CircularProgress size={16} /> : <UploadIcon />}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Submission Dialog */}
      <Dialog 
        open={viewDialog.open} 
        onClose={() => setViewDialog({ open: false, assignment: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Submission Details: {viewDialog.assignment?.title}
            </Typography>
            <Chip
              label={getStatusLabel(viewDialog.assignment)}
              color={getStatusColor(viewDialog.assignment)}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Assignment Info */}
            <Card sx={{ mb: 2, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Assignment Information
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2">
                    <strong>Course:</strong> {viewDialog.assignment?.courseName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Module:</strong> {viewDialog.assignment?.moduleTitle}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Lesson:</strong> {viewDialog.assignment?.lessonTitle}
                  </Typography>
                  {viewDialog.assignment?.deadline && (
                    <Typography variant="body2">
                      <strong>Deadline:</strong> {format(new Date(viewDialog.assignment.deadline), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  )}
                  {viewDialog.assignment?.description && (
                    <Typography variant="body2">
                      <strong>Description:</strong> {viewDialog.assignment.description}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Submission Details */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Submission Status
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2">
                    <strong>Status:</strong> {viewDialog.assignment?.status || 'Pending'}
                  </Typography>
                  {viewDialog.assignment?.submittedAt && (
                    <Typography variant="body2">
                      <strong>Submitted:</strong> {format(new Date(viewDialog.assignment.submittedAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  )}
                  {viewDialog.assignment?.grade !== null && viewDialog.assignment?.grade !== undefined ? (
                    <Typography variant="body2">
                      <strong>Grade:</strong> {viewDialog.assignment.grade}%
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Grade:</strong> Not graded yet
                    </Typography>
                  )}
                  {viewDialog.assignment?.feedback && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Instructor Feedback:</strong>
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                        <Typography variant="body2">
                          {viewDialog.assignment.feedback}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Submission Content */}
            {viewDialog.assignment?.status === 'Submitted' && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Your Submission
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {viewDialog.assignment?.submission_url ? (
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          Submitted file:
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => window.open(viewDialog.assignment.submission_url, '_blank')}
                          sx={{ mb: 1 }}
                        >
                          View Submission File
                        </Button>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No file submitted or submission content not available
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setViewDialog({ open: false, assignment: null })}
          >
            Close
          </Button>
          {viewDialog.assignment?.submission_url && (
            <Button 
              variant="contained"
              startIcon={<ViewIcon />}
              onClick={() => window.open(viewDialog.assignment.submission_url, '_blank')}
            >
              Download Submission
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssignmentsTab;