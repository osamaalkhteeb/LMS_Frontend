import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
  Quiz as QuizIcon,
  Score as ScoreIcon,
  Timer as TimerIcon,
  ArrowBack as BackIcon,
  Refresh as RetakeIcon,
  TrendingUp as PerformanceIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizResults } from '../hooks/useQuizzes';
import { format } from 'date-fns';

const QuizResultsPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { results, loading, error } = useQuizResults(quizId);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent work! Outstanding performance!';
    if (percentage >= 80) return 'Great job! You did very well!';
    if (percentage >= 70) return 'Good work! You have a solid understanding!';
    if (percentage >= 60) return 'Not bad! Consider reviewing the material.';
    return 'Keep studying! You can improve with more practice.';
  };

  const getGradeFromPercentage = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !results) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Quiz results not found'}
        </Alert>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }


  const percentage = results.score || results.percentage || 0;
  const scoreColor = getScoreColor(percentage);
  const grade = getGradeFromPercentage(percentage);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/dashboard/student')}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Quiz Results
        </Typography>
      </Box>

      {/* Score Overview */}
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
        <QuizIcon sx={{ fontSize: 64, color: `${scoreColor}.main`, mb: 2 }} />
        <Typography variant="h3" fontWeight="bold" color={`${scoreColor}.main`} gutterBottom>
          {results.score || 0}/{results.total_score || results.totalScore || 100}
        </Typography>
        <Typography variant="h5" color={`${scoreColor}.main`} gutterBottom>
          {percentage.toFixed(1)}% - Grade {grade}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {results.quiz_title || 'Quiz'}
        </Typography>
        
        <Box sx={{ mt: 3, mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={percentage} 
            color={scoreColor}
            sx={{ height: 12, borderRadius: 6 }}
          />
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          {getPerformanceMessage(percentage)}
        </Typography>
      </Paper>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CorrectIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {results.correct_answers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Correct
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <IncorrectIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {results.incorrect_answers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Incorrect
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <QuizIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {results.total_questions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimerIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {results.time_taken || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time Taken
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>



      {/* Detailed Results */}
      {results.question_results && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Question-by-Question Results
            </Typography>
            <Button 
              onClick={() => setShowDetailedResults(!showDetailedResults)}
              variant="outlined"
              size="small"
            >
              {showDetailedResults ? 'Hide Details' : 'Show Details'}
            </Button>
          </Box>
          
          {showDetailedResults && (
            <List>
              {results.question_results.map((questionResult, index) => (
                <React.Fragment key={questionResult.question_id || index}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
                    <Box display="flex" alignItems="center" width="100%" mb={1}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {questionResult.is_correct ? (
                          <CorrectIcon color="success" />
                        ) : (
                          <IncorrectIcon color="error" />
                        )}
                      </ListItemIcon>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          Question {index + 1}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {questionResult.question_text}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${questionResult.points_earned || 0}/${questionResult.points_possible || 0} pts`}
                        size="small"
                        color={questionResult.is_correct ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </Box>
                    
                    {questionResult.selected_answer && (
                      <Box sx={{ ml: 5, width: '100%' }}>
                        <Typography variant="body2" color="text.secondary">
                          Your answer: {questionResult.selected_answer}
                        </Typography>
                        {!questionResult.is_correct && questionResult.correct_answer && (
                          <Typography variant="body2" color="success.main">
                            Correct answer: {questionResult.correct_answer}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </ListItem>
                  {index < results.question_results.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* Actions */}
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          What's Next?
        </Typography>
        <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
          <Button 
            variant="outlined" 
            startIcon={<BackIcon />}
            onClick={() => navigate('/dashboard/student')}
          >
            Back to Dashboard
          </Button>
          
          {results.can_retake && (
            <Button 
              variant="contained" 
              startIcon={<RetakeIcon />}
              onClick={() => navigate(`/quiz/${quizId}`)}
              color="primary"
            >
              Retake Quiz
            </Button>
          )}
          
          <Button 
            variant="outlined" 
            startIcon={<PerformanceIcon />}
            onClick={() => navigate('/dashboard/student?tab=2')} // Navigate to quizzes tab
          >
            View All Quizzes
          </Button>
        </Box>
        
        {percentage < (results.passing_score || 60) && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Don't worry! Review the material and try again. You can do better next time!
            </Typography>
          </Alert>
        )}
        
        {percentage >= 90 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Congratulations! You've demonstrated excellent mastery of this material!
            </Typography>
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default QuizResultsPage;