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
  Alert,
  Box,
  IconButton,
  Tooltip,
  LinearProgress,
  Paper,
  Container
} from "@mui/material";
import { CircleLoader } from "react-spinners";
import {
  ArrowBack as BackIcon,
  Visibility as ViewIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Schedule as TimeIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { getQuizAttempts, getQuiz } from "../services/quizService";
import { format } from "date-fns";

const QuizHistoryPage = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizHistory();
  }, [quizId]);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch quiz details and all attempts
      const [quizData, attemptsData] = await Promise.all([
          getQuiz(quizId),
          getQuizAttempts(quizId),
        ]);
      
      setQuiz(quizData);
      setAttempts(attemptsData || []);
    } catch (err) {
      setError("Failed to load quiz history. Please try again.");
      console.error("Error fetching quiz history:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAttemptStatus = (attempt) => {
    if (!attempt.completed_at) return 'In Progress';
    return attempt.score >= (quiz?.passing_score || 0) ? 'Passed' : 'Failed';
  };

  const getStatusColor = (attempt) => {
    const status = getAttemptStatus(attempt);
    switch (status) {
      case 'Passed': return 'success';
      case 'Failed': return 'error';
      default: return 'warning';
    }
  };

  const getStatusIcon = (attempt) => {
    const status = getAttemptStatus(attempt);
    switch (status) {
      case 'Passed': return <PassIcon />;
      case 'Failed': return <FailIcon />;
      default: return <TimeIcon />;
    }
  };

  const handleViewAttempt = (attemptId) => {
    // Navigate to quiz results page with specific attempt
    navigate(`/quiz/${quizId}/results?attempt=${attemptId}`);
  };

  const handleBackToQuizzes = () => {
    navigate('/dashboard/student?tab=2');
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircleLoader size={60} color="#ffffff" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            maxWidth: 500,
            borderRadius: 3,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
          }}
        >
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={handleBackToQuizzes}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Back to Quizzes
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton 
            onClick={handleBackToQuizzes} 
            sx={{ 
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.05)'
              },
              borderRadius: 2
            }}
          >
            <BackIcon />
          </IconButton>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ color: 'white', fontWeight: 700 }}
            >
              Quiz History
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {quiz?.title}
            </Typography>
            {quiz?.course_title && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Course: {quiz.course_title}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Quiz Summary */}
        <Paper 
          elevation={8}
          sx={{ 
            p: 3, 
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <QuizIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Quiz Summary</Typography>
          </Box>
        <Box display="flex" gap={4} flexWrap="wrap">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Attempts
            </Typography>
            <Typography variant="h6">{attempts.length}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Best Score
            </Typography>
            <Typography variant="h6">
              {attempts.length > 0 ? Math.max(...attempts.map(a => a.score || 0)) : 0}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Passed Attempts
            </Typography>
            <Typography variant="h6">
              {attempts.filter(a => a.score >= (quiz?.passing_score || 0)).length}
            </Typography>
          </Box>
        </Box>
        </Paper>

        {/* Attempts History */}
        <Card 
          elevation={8}
          sx={{
            borderRadius: 3,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Attempt History
            </Typography>
          
          {attempts.length === 0 ? (
            <Box textAlign="center" py={4}>
              <QuizIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No attempts found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You haven't taken this quiz yet.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Attempt #</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time Taken</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Correct Answers</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attempts.map((attempt) => {
                    const status = getAttemptStatus(attempt);
                    
                    return (
                      <TableRow key={attempt.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="medium">
                            Attempt {attempt.attempt_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {attempt.completed_at 
                              ? format(new Date(attempt.completed_at), 'MMM dd, yyyy HH:mm')
                              : format(new Date(attempt.started_at), 'MMM dd, yyyy HH:mm')
                            }
                          </Typography>
                          {!attempt.completed_at && (
                            <Typography variant="caption" color="warning.main">
                              (In Progress)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {attempt.score || 0}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={attempt.score || 0} 
                              sx={{ 
                                height: 4, 
                                borderRadius: 2, 
                                mt: 0.5,
                                backgroundColor: 'grey.200'
                              }}
                              color={status === 'Passed' ? 'success' : 'error'}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                              label={status}
                              color={getStatusColor(attempt)}
                              size="small"
                              icon={getStatusIcon(attempt)}
                              sx={{ borderRadius: 2 }}
                            />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {attempt.time_taken || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {attempt.correct_answers || 0} / {attempt.total_questions || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {attempt.completed_at && (
                            <Tooltip title="View detailed results">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ViewIcon />}
                                onClick={() => handleViewAttempt(attempt.id)}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600
                                }}
                              >
                                View
                              </Button>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default QuizHistoryPage;