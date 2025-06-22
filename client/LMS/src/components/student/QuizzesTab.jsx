
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
} from "@mui/material";
import { ClockLoader } from 'react-spinners';
import {
  Quiz as QuizIcon,
  PlayArrow as StartIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import quizService, { getQuizzesByLesson, getQuizResults, getQuizAttempts } from "../../services/quizService";
import { getLessonsByCourse } from "../../services/lessonService";
import { format } from "date-fns";

const QuizzesTab = ({ enrolledCourses }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, [enrolledCourses]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await quizService.getUserQuizzes();
      const userQuizzes = response.data || [];
      
      // Transform the data to match the expected format
      const transformedQuizzes = userQuizzes.map(quiz => ({
        ...quiz,
        attempts: quiz.best_attempt ? [quiz.best_attempt] : [],
        status: getQuizStatusFromBatch(quiz)
      }));
      
      setQuizzes(transformedQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatus = (quiz, attempts) => {
    if (!attempts || attempts.length === 0) {
      return 'not_attempted';
    }
    
    const bestAttempt = attempts.reduce((best, current) => {
      return (current.score > best.score) ? current : best;
    }, attempts[0]);
    
    if (bestAttempt.score >= quiz.passing_score) {
      return 'passed';
    } else if (attempts.length >= quiz.max_attempts) {
      return 'failed';
    } else {
      return 'in_progress';
    }
  };

  const getQuizStatusFromBatch = (quiz) => {
    if (quiz.total_attempts === 0) {
      return 'not_attempted';
    }
    
    if (quiz.best_attempt && quiz.best_attempt.score >= quiz.passing_score) {
      return 'passed';
    } else if (quiz.total_attempts >= quiz.max_attempts) {
      return 'failed';
    } else {
      return 'in_progress';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'not_attempted':
      default:
        return 'default';
    }
  };

  const getScoreDisplay = (quiz) => {
    if (quiz.best_attempt && quiz.best_attempt.score !== undefined) {
      const score = quiz.best_attempt.score;
      const totalScore = quiz.best_attempt.total_score || 100;
      
      return `${score}/${totalScore}`;
    }
    return 'Not taken';
  };

  const handleTakeQuiz = (quizId) => {
    // Navigate to quiz taking page
    navigate(`/quiz/${quizId}`);
  };

  const handleViewResults = (quizId) => {
    // Navigate to quiz results page
    navigate(`/quiz/${quizId}/results`);
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <ClockLoader size={50} color="#1976d2" />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <QuizIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            My Quizzes ({quizzes.length})
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {quizzes.length === 0 ? (
          <Box textAlign="center" py={4}>
            <QuizIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No quizzes found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don't have any quizzes yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quiz Title</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Questions</TableCell>
                  <TableCell>Time Limit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quizzes.map((quiz) => {
                  const status = quiz.status;
                  return (
                    <TableRow key={quiz.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {quiz.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {quiz.lesson_title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{quiz.course_title}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {quiz.question_count || 'N/A'} questions
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {quiz.time_limit ? (
                          <Box display="flex" alignItems="center">
                            <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {quiz.time_limit} min
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No limit
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status === 'not_attempted' ? 'Not Started' : 
                                 status === 'in_progress' ? 'In Progress' : 
                                 status === 'passed' ? 'Passed' : 
                                 status === 'failed' ? 'Failed' : status}
                          color={getStatusColor(status)}
                          size="small"
                          icon={status === 'passed' ? <CompleteIcon /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {getScoreDisplay(quiz)}
                        </Typography>
                        {quiz.best_attempt && quiz.best_attempt.score !== undefined && (
                          <Box sx={{ mt: 0.5 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(100, Math.max(0, (quiz.best_attempt.score / (quiz.best_attempt.total_score || 100)) * 100))} 
                              sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: quiz.best_attempt.score === 0 ? '#f44336' : undefined
                                }
                              }}
                            />
                            <Typography 
                              variant="caption" 
                              color={quiz.best_attempt.score === 0 ? 'error' : 'text.secondary'}
                            >
                              {Math.round((quiz.best_attempt.score / (quiz.best_attempt.total_score || 100)) * 100)}%
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {status === 'passed' || status === 'failed' ? (
                            <>
                              <Tooltip title="View latest results">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<ViewIcon />}
                                  onClick={() => handleViewResults(quiz.id)}
                                >
                                  Results
                                </Button>
                              </Tooltip>
                              <Tooltip title="View all attempts">
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => navigate(`/quiz/${quiz.id}/history`)}
                                >
                                  History
                                </Button>
                              </Tooltip>
                            </>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<StartIcon />}
                              onClick={() => handleTakeQuiz(quiz.id)}
                              disabled={quiz.total_attempts >= quiz.max_attempts}
                            >
                              {status === 'in_progress' ? 'Continue' : 'Start'}
                            </Button>
                          )}
                        </Box>
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
  );
};

export default QuizzesTab;