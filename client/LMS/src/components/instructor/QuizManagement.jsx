
import React, { useState } from 'react';
import { ClockLoader } from 'react-spinners';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Grid,
  Divider,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  QuestionAnswer as QuestionIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useQuizzesByLesson, useQuizManagement } from '../../hooks/useQuizzes';
import { format } from 'date-fns';
import { useFormHandler } from '../../hooks/useFormHandler';
import { validateRequired, validateQuizQuestion } from '../../utils/validation';

const QuizManagement = ({ lessonId, lessonTitle }) => {
  const { quizzes, loading, error, refetch } = useQuizzesByLesson(lessonId);
  const { createNewQuiz, updateExistingQuiz, deleteExistingQuiz, getQuizDetails, loading: actionLoading } = useQuizManagement();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [actionError, setActionError] = useState(null);
  
  // Question form validation rules
  const questionValidationRules = {
    question_text: [(value) => validateRequired(value, 'Question text')],
    question_type: [(value) => validateRequired(value, 'Question type')],
    points: [(value) => {
      if (!value || value < 1) {
        return { success: false, message: 'Points must be at least 1' };
      }
      return { success: true, message: 'Valid' };
    }],
    options: [(value, formData) => {
      // Skip validation for short_answer questions as they don't need options
      if (formData.question_type === 'short_answer') {
        return { success: true, message: 'Valid' };
      }
      
      // For other question types, validate that options exist and have correct answers
      if (!formData.options || formData.options.length === 0) {
        return { success: false, message: 'At least one option is required' };
      }
      
      // Check if at least one option is marked as correct
      const hasCorrectAnswer = formData.options.some(option => option.is_correct);
      if (!hasCorrectAnswer) {
        return { success: false, message: 'At least one option must be marked as correct' };
      }
      
      return { success: true, message: 'Valid' };
    }]
  };
  
  // Use form handler for question form
  const {
    formData: questionForm,
    errors: questionErrors,
    isSubmitting: isQuestionSubmitting,
    submitError: questionSubmitError,
    handleChange: handleQuestionChange,
    handleSubmit: handleQuestionSubmit,
    setFormData: setQuestionForm,
    clearErrors
  } = useFormHandler(
    {
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      options: [{ option_text: '', is_correct: false }]
    },
    questionValidationRules
  );

  const handleManageQuestions = async (quiz) => {
    try {

      
      setActionError(null);
      // Fetch full quiz details with questions
      const fullQuizData = await getQuizDetails(quiz.id);
      

      
      setSelectedQuiz(fullQuizData);
      setOpenDialog(true);
    } catch (error) {
      console.error(`Failed to load quiz details for quiz ID: ${quiz.id}`, {
        error: error.message,
        stack: error.stack,
        quizId: quiz.id,
        quizTitle: quiz.title,
        lessonId,
        timestamp: new Date().toISOString()
      });
      
      setActionError(error.message || 'Failed to load quiz details');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedQuiz(null);
    setShowQuestionDialog(false);
    setEditingQuestionIndex(null);
    setActionError(null);
  };



  const handleAddQuestion = () => {
    setQuestionForm({
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      options: [{ option_text: '', is_correct: false }]
    });
    clearErrors();
    setEditingQuestionIndex(null);
    setShowQuestionDialog(true);
  };

  const handleEditQuestion = (index) => {
    const question = selectedQuiz.questions[index];
    setQuestionForm({
      question_text: question.question_text || '',
      question_type: question.question_type || 'multiple_choice',
      points: question.points || 1,
      options: question.options || [{ option_text: '', is_correct: false }]
    });
    clearErrors();
    setEditingQuestionIndex(index);
    setShowQuestionDialog(true);
  };

  const handleDeleteQuestion = async (index) => {
    try {

      
      const updatedQuestions = selectedQuiz.questions.filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, orderNum: i + 1 })); // Reorder remaining questions
      
      const updatedQuiz = {
        ...selectedQuiz,
        questions: updatedQuestions
      };
      

      
      // Update the quiz with the new questions list (this will delete the question from backend)
      await updateExistingQuiz(selectedQuiz.id, updatedQuiz);
      

      
      // Update local state
      setSelectedQuiz(updatedQuiz);
      await refetch(); // Refresh the quiz list
    } catch (error) {
      console.error(`Failed to delete question from quiz ID: ${selectedQuiz.id}`, {
        error: error.message,
        stack: error.stack,
        quizId: selectedQuiz.id,
        questionIndex: index,
        questionId: selectedQuiz.questions[index]?.id,
        timestamp: new Date().toISOString()
      });
      
      setActionError(error.message || 'Failed to delete question');
    }
  };

  const handleMoveQuestion = async (index, direction) => {
    try {
      const questions = [...selectedQuiz.questions];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (newIndex < 0 || newIndex >= questions.length) return;
      
      // Swap questions
      [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
      
      // Update order numbers
      const updatedQuestions = questions.map((q, i) => ({ ...q, orderNum: i + 1 }));
      
      const updatedQuiz = {
        ...selectedQuiz,
        questions: updatedQuestions
      };
      
      // Update backend
      await updateExistingQuiz(selectedQuiz.id, updatedQuiz);
      
      // Update local state
      setSelectedQuiz(updatedQuiz);
      await refetch();
    } catch (error) {
      setActionError('Failed to reorder question');
    }
  };

  const handleQuestionFormChange = (field, value) => {
    if (field === 'question_type') {
      let updatedOptions;
      // if (value === 'short_answer') {
      //   updatedOptions = [];
      // } else 
      if (value === 'true_false') {
        updatedOptions = [
          { option_text: 'True', is_correct: false },
          { option_text: 'False', is_correct: false }
        ];
      } else if (value === 'multiple_choice' && questionForm.question_type !== 'multiple_choice') {
        updatedOptions = [{ option_text: '', is_correct: false }];
      } else {
        updatedOptions = questionForm.options;
      }
      
      setQuestionForm({
        ...questionForm,
        [field]: value,
        options: updatedOptions
      });
    } else {
      handleQuestionChange({ target: { name: field, value } });
    }
  };

  const handleOptionChange = (index, field, value) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const handleAddOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, { option_text: '', is_correct: false }]
    }));
  };

  const handleRemoveOption = (index) => {
    if (questionForm.options.length > 1) {
      setQuestionForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSaveQuestion = async () => {
    return handleQuestionSubmit(async (data) => {
      const questionData = {
        question_text: data.question_text,
        question_type: data.question_type,
        points: data.points,
        orderNum: editingQuestionIndex !== null ? 
          selectedQuiz.questions[editingQuestionIndex].orderNum : 
          (selectedQuiz.questions?.length || 0) + 1,
        options: data.question_type === 'true_false' 
          ? data.options.map(opt => ({
              option_text: opt.option_text,
              is_correct: opt.is_correct
            }))
          : data.options
            .filter(opt => opt.option_text.trim())
            .map(opt => ({
              option_text: opt.option_text,
              is_correct: opt.is_correct
            }))
      };

      let updatedQuiz;
      if (editingQuestionIndex !== null) {
        // Update existing question
        updatedQuiz = {
          ...selectedQuiz,
          questions: selectedQuiz.questions.map((q, i) => 
            i === editingQuestionIndex ? questionData : q
          )
        };
      } else {
        // Add new question
        updatedQuiz = {
          ...selectedQuiz,
          questions: [...(selectedQuiz.questions || []), questionData]
        };
      }
      
      await updateExistingQuiz(selectedQuiz.id, updatedQuiz);
      
      // Update local state immediately
      setSelectedQuiz(updatedQuiz);
      
      // Refresh the quiz list to get the latest data from backend
      await refetch();
      
      setShowQuestionDialog(false);
      setEditingQuestionIndex(null);
      setActionError(null);
      
      return updatedQuiz;
    });
  };



  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteExistingQuiz(quizId);
        await refetch();
      } catch (err) {
        setActionError(err.message || 'Failed to delete quiz');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <ClockLoader size={50} color="#1976d2" />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box mb={3}>
          <Typography variant="h6" fontWeight="bold">
            Quiz Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lessonTitle}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {actionError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        {quizzes.length === 0 ? (
          <Box textAlign="center" py={4}>
            <QuizIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No quizzes created yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first quiz to assess student learning
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quiz Title</TableCell>
                  <TableCell>Questions</TableCell>
                  <TableCell>Time Limit</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {quiz.title}
                      </Typography>
                      {quiz.description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {quiz.description.substring(0, 100)}...
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <QuestionIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {quiz.question_count || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {quiz.time_limit ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <TimerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
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

                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleManageQuestions(quiz)}
                      >
                        Manage Questions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Question Management Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Manage Questions - {selectedQuiz?.title}
          </DialogTitle>
          <DialogContent>
            {/* Questions Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Questions ({selectedQuiz?.questions?.length || 0})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
              >
                Add Question
              </Button>
            </Box>

            {selectedQuiz?.questions?.map((question, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <Box display="flex" alignItems="center" width="100%">
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">
                      Question {index + 1}: {question.question_text?.substring(0, 50)}...
                    </Typography>
                  </AccordionSummary>
                  <Box display="flex" gap={1} sx={{ pr: 2 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleMoveQuestion(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUpIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleMoveQuestion(index, 'down')}
                      disabled={index === selectedQuiz.questions.length - 1}
                    >
                      <ArrowDownIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEditQuestion(index)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteQuestion(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <AccordionDetails>
                  <Typography variant="body2" gutterBottom>
                    <strong>Type:</strong> {question.question_type?.replace('_', ' ')}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Points:</strong> {question.points}
                  </Typography>
                  {/* question.question_type !== 'short_answer' && */ (
                    <>
                      <Typography variant="body2" gutterBottom>
                        <strong>Options:</strong>
                      </Typography>
                      <ul>
                        {question.options?.map((option, optIndex) => (
                          <li key={optIndex}>
                            {option.option_text} {option.is_correct && <strong>(Correct)</strong>}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            )) || (
              <Box textAlign="center" py={4}>
                <QuestionIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No questions added yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click "Add Question" to create your first question
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Question Dialog */}
        <Dialog open={showQuestionDialog} onClose={() => setShowQuestionDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
          </DialogTitle>
          <DialogContent>
            {questionSubmitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {questionSubmitError}
              </Alert>
            )}
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Question Text"
                  value={questionForm.question_text}
                  onChange={(e) => handleQuestionFormChange('question_text', e.target.value)}
                  multiline
                  rows={3}
                  required
                  error={!!questionErrors.question_text}
                  helperText={questionErrors.question_text}
                  disabled={isQuestionSubmitting}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!questionErrors.question_type}>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    value={questionForm.question_type}
                    onChange={(e) => handleQuestionFormChange('question_type', e.target.value)}
                    label="Question Type"
                    disabled={isQuestionSubmitting}
                  >
                    <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                    <MenuItem value="true_false">True/False</MenuItem>
                    {/* <MenuItem value="short_answer">Short Answer</MenuItem> */} {/* Future work */}
                  </Select>
                  {questionErrors.question_type && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {questionErrors.question_type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Points"
                  type="number"
                  value={questionForm.points}
                  onChange={(e) => handleQuestionFormChange('points', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                  error={!!questionErrors.points}
                  helperText={questionErrors.points}
                  disabled={isQuestionSubmitting}
                />
              </Grid>
              {questionForm.question_type !== 'short_answer' && (
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle2">Answer Options</Typography>
                    {questionForm.question_type === 'multiple_choice' && (
                      <Button size="small" onClick={handleAddOption} disabled={isQuestionSubmitting}>
                        Add Option
                      </Button>
                    )}
                  </Box>
                  {questionErrors.options && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {questionErrors.options}
                    </Alert>
                  )}
                  {questionForm.options.map((option, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label={`Option ${index + 1}`}
                        value={option.option_text}
                        onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                        disabled={questionForm.question_type === 'true_false' || isQuestionSubmitting}
                      />
                      <FormControlLabel
                        control={
                          questionForm.question_type === 'true_false' ? (
                            <Switch
                              checked={option.is_correct}
                              onChange={(e) => {
                                // For true/false, only allow one correct answer
                                const newOptions = questionForm.options.map((opt, i) => ({
                                  ...opt,
                                  is_correct: i === index ? e.target.checked : false
                                }));
                                setQuestionForm(prev => ({ ...prev, options: newOptions }));
                              }}
                              size="small"
                            />
                          ) : (
                            <Switch
                              checked={option.is_correct}
                              onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                              size="small"
                            />
                          )
                        }
                        label="Correct"
                      />
                      {questionForm.question_type === 'multiple_choice' && questionForm.options.length > 1 && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveOption(index)} 
                          color="error"
                          disabled={isQuestionSubmitting}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowQuestionDialog(false)} disabled={isQuestionSubmitting}>Cancel</Button>
            <Button onClick={handleSaveQuestion} variant="contained" disabled={isQuestionSubmitting}>
              {isQuestionSubmitting ? (
                <ClockLoader size={20} color="#1976d2" />
              ) : (
                editingQuestionIndex !== null ? 'Update Question' : 'Add Question'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default QuizManagement;