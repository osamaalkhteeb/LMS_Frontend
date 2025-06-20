import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  IconButton,
  Chip
} from '@mui/material';
import {
  Timer as TimerIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  ArrowBack as PrevIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuizzes';
import { submitQuiz } from '../services/quizService';
import { format } from 'date-fns';
import Timer from '../components/Timer';

const QuizTakingPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { quiz, loading, error } = useQuiz(quizId);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Timer expiry handler
  const handleTimeUp = () => {
    handleAutoSubmit();
  };

  const handleStartQuiz = () => {
    const startTime = new Date();
    setQuizStarted(true);
    setQuizStartTime(startTime);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Flag a question for review
  const handleFlagQuestion = () => {
    if (flagged.includes(currentQuestionIndex)) {
      setFlagged(flagged.filter((q) => q !== currentQuestionIndex));
    } else {
      setFlagged([...flagged, currentQuestionIndex]);
    }
  };

  const handleNextQuestion = () => {
    if (quiz.questions?.length && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Check if all questions are answered
      const unansweredQuestions = quiz.questions.filter(question => {
        const answer = answers[question.id];
        // For multiple choice and true/false, answer should be a non-empty string (option ID)
        // For short answer, answer should be a non-empty trimmed string
        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
          return answer === undefined || answer === null || answer === '';
        } /* else {
          // For short answer questions
          return !answer || (typeof answer === 'string' && answer.trim() === '');
        } */
      });
      
      if (unansweredQuestions.length > 0) {
        setSubmitError(`Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remaining.`);
        setIsSubmitting(false);
        return;
      }
      
      // Format answers for submission with option IDs
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = quiz.questions.find(q => q.id === parseInt(questionId));
        
        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
          // answer is already the option ID as a string from RadioGroup
          const optionId = parseInt(answer);
          
          return {
            questionId: parseInt(questionId),
            selected_options: [optionId]
          };
        } /* else {
          // For short answer questions
          return {
            questionId: parseInt(questionId),
            answerText: answer,
            selected_options: []
          };
        } */
      });
      
      await submitQuiz(quizId, formattedAnswers, quizStartTime);
      navigate(`/quiz/${quizId}/results`);
      setShowSubmitDialog(false);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit quiz');
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = useCallback(() => {
    handleSubmitQuiz();
  }, []);

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const isQuestionAnswered = (questionId) => {
    return answers.hasOwnProperty(questionId) && answers[questionId] !== null && answers[questionId] !== undefined;
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

  if (error || !quiz) {
    const isNotFound = error && (error.includes('404') || error.includes('not found'));
    
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {isNotFound ? 'Quiz Not Found' : 'Error Loading Quiz'}
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {isNotFound 
              ? `The quiz you're looking for doesn't exist or may have been removed.`
              : error || 'Failed to load quiz. Please try again.'}
          </Alert>
          
          <Box display="flex" gap={2} justifyContent="center">
            <Button 
              startIcon={<BackIcon />} 
              onClick={() => navigate(-1)}
              variant="outlined"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/student?tab=2')}
              variant="contained"
            >
              View All Quizzes
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!quizStarted) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          {/* Back Button */}
          <Box display="flex" justifyContent="flex-start" sx={{ mb: 2 }}>
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ 
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'grey.200' }
              }}
            >
              <BackIcon />
            </IconButton>
          </Box>
          
          <QuizIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {quiz.title}
          </Typography>
          {quiz.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {quiz.description}
            </Typography>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quiz Information
            </Typography>
            <Box display="flex" justifyContent="center" gap={4} flexWrap="wrap">
              <Chip 
              icon={<QuizIcon />} 
              label={`${quiz.questions?.length || 0} Questions`} 
              variant="outlined"
            />
            {quiz.time_limit && (
              <Chip 
                icon={<TimerIcon />} 
                label={`${quiz.time_limit} Minutes`} 
                variant="outlined" 
                color="warning"
              />
            )}
            {quiz.attemptInfo && quiz.attemptInfo.max_attempts && (
              <Chip 
                icon={<WarningIcon />} 
                label={`${quiz.attemptInfo.remainingAttempts} attempts left`} 
                variant="outlined" 
                color={quiz.attemptInfo.remainingAttempts === 0 ? "error" : "warning"}
              />
            )}
            </Box>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Instructions:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Read each question carefully before answering</li>
              <li>You can navigate between questions using the Next/Previous buttons</li>
              {quiz.time_limit && <li>You have {quiz.time_limit} minutes to complete this quiz</li>}
              <li>Make sure to submit your quiz before the time runs out</li>
              <li>Once submitted, you cannot change your answers</li>
            </ul>
          </Alert>
          
          {quiz.attemptInfo?.canAttempt === true ? (
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleStartQuiz}
              sx={{ px: 4, py: 1.5 }}
            >
              Start Quiz
            </Button>
          ) : (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {quiz.attemptInfo?.remainingAttempts === 0 
                  ? `You have reached the maximum number of attempts (${quiz.attemptInfo.max_attempts}) for this quiz.`
                  : 'Unable to verify attempt status. Please try again later.'}
              </Alert>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/dashboard')}
                sx={{ px: 4, py: 1.5 }}
              >
                Back to Dashboard
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    );
  }

  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const progress = quiz.questions?.length ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;

  // Safety check - if no questions or current question doesn't exist, show error
  if (!quiz.questions?.length || !currentQuestion) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error">
            No questions available for this quiz.
          </Alert>
          <Button 
            onClick={() => navigate(-1)}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }
  


  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        {/* Header (Back Button, Quiz Title & Timer) */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ 
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'grey.200' }
              }}
            >
              <BackIcon />
            </IconButton>
            <Typography variant="h5">{quiz.title}</Typography>
          </Box>
          {quiz.time_limit && quizStarted && (
            <Timer 
              initialTime={quiz.time_limit * 60} 
              onTimeUp={handleTimeUp} 
            />
          )}
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={quiz.questions?.length ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0}
          sx={{ my: 2 }}
        />

        {/* Question & Options */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h6">
            Question {currentQuestionIndex + 1}: {currentQuestion.question_text}
          </Typography>

          {/* Answer Options */}
          {currentQuestion.question_type === 'multiple_choice' && (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              {currentQuestion.options?.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id.toString()}
                  control={<Radio />}
                  label={option.option_text}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
          )}

          {currentQuestion.question_type === 'true_false' && (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              {currentQuestion.options?.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id.toString()}
                  control={<Radio />}
                  label={option.option_text}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
          )}

          {/* currentQuestion.question_type === 'short_answer' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Enter your answer here..."
              variant="outlined"
              sx={{ mt: 2 }}
            />
          )} */}
        </Box>

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            disabled={currentQuestionIndex === 0}
            onClick={handlePreviousQuestion}
          >
            Previous
          </Button>

          <Box>
            <IconButton 
              onClick={handleFlagQuestion} 
              color={flagged.includes(currentQuestionIndex) ? "warning" : "default"}
            >
              <FlagIcon />
            </IconButton>

            {quiz.questions?.length && currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNextQuestion}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="success" 
                onClick={() => {
                  setSubmitError(null); // Clear any previous error
                  setShowSubmitDialog(true);
                }}
              >
                Submit Quiz
              </Button>
            )}
          </Box>
        </Box>

        {/* Question Navigation Sidebar */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2">Jump to Question:</Typography>
          <Grid container spacing={1}>
            {quiz.questions?.map((q, index) => (
              <Grid item key={index}>
                <Button
                  variant={
                    currentQuestionIndex === index
                      ? "contained"
                      : flagged.includes(index)
                      ? "outlined"
                      : answers[q.id]
                      ? "contained"
                      : "outlined"
                  }
                  color={
                    currentQuestionIndex === index
                      ? "primary"
                      : flagged.includes(index)
                      ? "warning"
                      : answers[q.id]
                      ? "success"
                      : "default"
                  }
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </Button>
              </Grid>
            )) || []}
          </Grid>
        </Box>
      </Paper>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>Submit Quiz?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to submit? You cannot change answers afterward.</Typography>
          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleSubmitQuiz} 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizTakingPage;