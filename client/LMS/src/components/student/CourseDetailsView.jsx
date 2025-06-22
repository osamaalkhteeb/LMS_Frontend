
import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ClockLoader } from "react-spinners";
import {
  Close,
  ExpandMore,
  PlayCircle,
  Quiz,
  Assignment,
  CheckCircle,
  ArrowBack,
  VideoLibrary,
  Article,
  RadioButtonUnchecked,
  CheckCircleOutline,
  Schedule,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import MediaPlayer from './MediaPlayer';
import { useNavigate } from "react-router-dom";
import { useMarkLessonComplete, useUnmarkLessonComplete, useCompletedLessonsByCourse } from '../../hooks/useLessonCompletion';

const CourseDetailsView = ({ selectedCourse, onBack, onProgressUpdate }) => {
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [assignmentSubmission, setAssignmentSubmission] = useState("");
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
  const [assignmentStatuses, setAssignmentStatuses] = useState({});
  const [quizStatuses, setQuizStatuses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [mediaPlayerOpen, setMediaPlayerOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const navigate = useNavigate();
  
  // Lesson completion hooks
  const { markComplete } = useMarkLessonComplete();
  const { unmarkComplete } = useUnmarkLessonComplete();
  const { completedLessons, refetch: refetchCompletedLessons } = useCompletedLessonsByCourse(selectedCourse?.id);



  // Fetch assignment and quiz statuses when course changes
  useEffect(() => {
    if (selectedCourse?.modules) {
      fetchAssignmentStatuses();
      fetchQuizStatuses();
      refetchCompletedLessons();
    }
  }, [selectedCourse, refetchCompletedLessons]);

  // Refresh quiz statuses and lesson completion when component regains focus (user returns from quiz)
  useEffect(() => {
    const handleFocus = () => {
      if (selectedCourse?.modules) {
        fetchQuizStatuses();
        refetchCompletedLessons();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedCourse, refetchCompletedLessons]);

  const fetchAssignmentStatuses = async () => {
    try {
      const { getAssignment } = await import('../../services/assignmentService');
      const statuses = {};
      
      for (const module of selectedCourse.modules) {
        if (module.assignments) {
          for (const assignment of module.assignments) {
            try {
              const fullAssignment = await getAssignment(assignment.id);
              statuses[assignment.id] = {
                status: fullAssignment.status || 'Pending',
                submittedAt: fullAssignment.submitted_at,
                submitted: fullAssignment.status === 'Submitted',
                content: fullAssignment.submission_url
              };
            } catch (error) {
              console.warn(`Failed to fetch status for assignment ${assignment.id}:`, error);
              statuses[assignment.id] = { status: 'Pending', submitted: false };
            }
          }
        }
      }
      
      setAssignmentStatuses(statuses);
    } catch (error) {
      console.error('Error fetching assignment statuses:', error);
    }
  };

  const fetchQuizStatuses = async () => {
    try {
      const { getQuizResults, getQuizAttempts } = await import('../../services/quizService');
      const statuses = {};
      
      for (const module of selectedCourse.modules) {
        if (module.quizzes) {
          for (const quiz of module.quizzes) {
            try {
              // Get all attempts to count them properly
              const attempts = await getQuizAttempts(quiz.id);
              // Get results to check if passed
              const results = await getQuizResults(quiz.id);
              
              // Check if user has passed the quiz (score >= passing_score)
              const passed = results && results.length > 0 && 
                           results.some(result => result.score >= (quiz.passing_score || 50));
              
              statuses[quiz.id] = {
                passed: passed,
                attempts: attempts?.length || 0,
                bestScore: attempts?.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0
              };
            } catch (error) {
              console.warn(`Failed to fetch results for quiz ${quiz.id}:`, error);
              statuses[quiz.id] = { passed: false, attempts: 0, bestScore: 0 };
            }
          }
        }
      }
      
      setQuizStatuses(statuses);
    } catch (error) {
      console.error('Error fetching quiz statuses:', error);
    }
  };

  const handleQuizSelect = async (lesson) => {
    try {
      // Import the service function
      const { getQuizzesByLesson } = await import('../../services/quizService');
      
      // Fetch quizzes for this lesson
      const quizzes = await getQuizzesByLesson(lesson.id);
      
      if (quizzes && quizzes.length > 0) {
        // Navigate to the first quiz for this lesson
        navigate(`/quiz/${quizzes[0].id}`, { state: { quiz: quizzes[0] } });
      } else {
        console.error('No quizzes found for lesson:', lesson.id);
        // You might want to show a user-friendly error message here
      }
    } catch (error) {
      console.error('Error fetching quizzes for lesson:', error);
      // You might want to show a user-friendly error message here
    }
  };

  const handleAssignmentSelect = (assignment) => {
    setActiveAssignment(assignment);
    const assignmentStatus = assignmentStatuses[assignment.id];
    
    if (assignmentStatus?.submitted) {
      setAssignmentSubmission(assignmentStatus.content || "");
      setAssignmentSubmitted(true);
    } else {
      setAssignmentSubmission("");
      setAssignmentSubmitted(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!assignmentSubmission.trim() && !submissionFile) return;
    
    setSubmitting(true);
    try {
      const { submitAssignment } = await import('../../services/assignmentService');
      
      const formData = new FormData();
      formData.append('content', assignmentSubmission);
      if (submissionFile) {
        formData.append('submissionFile', submissionFile);
      }
      
      const result = await submitAssignment(activeAssignment.id, formData);
      
      // Refresh assignment statuses to get updated data from server
      await fetchAssignmentStatuses();
      
      setAssignmentSubmitted(true);
      setSubmissionFile(null);
      await refetchCompletedLessons();
      
      // Update course progress in parent component
      if (result?.progress !== undefined && onProgressUpdate) {
        onProgressUpdate(result.progress);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmission = async (assignment) => {
    if (!assignment) return;
    
    // Check if deadline has passed
    if (assignment.deadline && new Date(assignment.deadline) < new Date()) {
      console.warn("Cannot delete submission after the deadline has passed.");
      return;
    }
    
    try {
      const { deleteSubmission } = await import('../../services/assignmentService');
      const result = await deleteSubmission(assignment.id);
      
      // Refresh assignment statuses to get updated data from server
      await fetchAssignmentStatuses();
      
      // Refresh completed lessons list since removing submission might affect completion
      await refetchCompletedLessons();
      
      // Update course progress in parent component
      if (result?.progress !== undefined && onProgressUpdate) {
        onProgressUpdate(result.progress);
      }
      
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const handleCloseDialog = () => {
    setActiveAssignment(null);
    setSubmissionFile(null);
  };

  // Handle lesson click - open content without auto-marking as complete
  const handleLessonClick = async (lesson) => {
    try {
      // Handle navigation based on lesson type
      if (lesson.content_type === 'quiz') {
        // For quizzes, navigate and refresh quiz statuses when returning
        await handleQuizSelect(lesson);
        // Note: Quiz completion status will be updated when user returns from quiz
        setTimeout(() => {
          fetchQuizStatuses();
        }, 1000); // Small delay to allow quiz completion to be processed
      } else if (lesson.content_type === 'assignment') {
        // For assignments, find the corresponding assignment and open assignment dialog
        // Don't auto-complete - completion happens when assignment is submitted
        const assignment = await getAssignmentByLessonId(lesson.id);
        if (assignment) {
          handleAssignmentSelect(assignment);
        }
      } else if (lesson.content_url) {
        // For video or text content, open in media player
        // Do NOT auto-mark as complete - let user manually mark when done
        setSelectedLesson(lesson);
        setMediaPlayerOpen(true);
      } else {
        // For other content types (text lessons without URL), mark as complete when clicked
        const isAlreadyCompleted = completedLessons?.some(completed => completed.lesson_id === lesson.id);
        
        if (!isAlreadyCompleted) {
          // Mark lesson as complete
          const result = await markComplete(lesson.id);
          // Refresh completed lessons list
          await refetchCompletedLessons();
          // Update course progress in parent component
          if (result?.progress !== undefined && onProgressUpdate) {
            onProgressUpdate(result.progress);
          }
        }
      }
    } catch (error) {
      console.error('Error handling lesson click:', error);
    }
  };

  // Helper function to get assignment by lesson ID
  const getAssignmentByLessonId = async (lessonId) => {
    // Look through all modules to find the assignment with matching lesson_id
    for (const module of selectedCourse?.modules || []) {
      const assignment = module.assignments?.find(a => a.lesson_id === lessonId);
      if (assignment) {
        return assignment;
      }
    }
    return null;
  };

  // Check if a lesson is completed
  const isLessonCompleted = (lessonId) => {
    return completedLessons?.some(completed => completed.lesson_id === lessonId) || false;
  };

  // Calculate total items count
  const getTotalItemsCount = () => {
    return selectedCourse.modules?.reduce((total, module) => {
      const lessonsCount = module.lessons?.filter(lesson => 
        lesson.content_type === 'video' || lesson.content_type === 'text'
      ).length || 0;
      const quizzesCount = module.quizzes?.length || 0;
      const assignmentsCount = module.assignments?.length || 0;
      return total + lessonsCount + quizzesCount + assignmentsCount;
    }, 0) || 0;
  };

  // Calculate completed items count
  const getCompletedItemsCount = () => {
    let completedCount = 0;
    
    selectedCourse.modules?.forEach(module => {
      // Count completed video/text lessons
      if (module.lessons) {
        const videoTextLessons = module.lessons.filter(lesson => 
          lesson.content_type === 'video' || lesson.content_type === 'text'
        );
        videoTextLessons.forEach(lesson => {
          if (isLessonCompleted(lesson.id)) {
            completedCount++;
          }
        });
      }
      
      // Count completed quizzes (based on lesson completion, not pass status)
      if (module.quizzes) {
        module.quizzes.forEach(quiz => {
          if (isLessonCompleted(quiz.lesson_id)) {
            completedCount++;
          }
        });
      }
      
      // Count submitted assignments
      if (module.assignments) {
        module.assignments.forEach(assignment => {
          if (assignmentStatuses[assignment.id]?.submitted) {
            completedCount++;
          }
        });
      }
    });
    
    return completedCount;
  };

  // Function to get the appropriate icon for lesson content type
  const getLessonIcon = (contentType, isCompleted = false) => {
    const getIconColor = (contentType, isCompleted) => {
      if (isCompleted) return "success";
      
      switch (contentType) {
        case 'video':
          return "primary";
        case 'quiz':
          return "warning";
        case 'assignment':
          return "secondary";
        case 'text':
          return "secondary";
        default:
          return "action";
      }
    };

    const iconProps = {
      fontSize: "medium",
      color: getIconColor(contentType, isCompleted)
    };

    switch (contentType) {
      case 'video':
        return <VideoLibrary {...iconProps} />;
      case 'quiz':
        return <Quiz {...iconProps} />;
      case 'assignment':
        return <Assignment {...iconProps} />;
      case 'text':
        return <Article {...iconProps} />;
      default:
        return <PlayCircle {...iconProps} />;
    }
  };

  // Handle completion icon click for undoing completion
  const handleCompletionIconClick = async (e, lesson, isCompleted) => {
    e.stopPropagation(); // Prevent lesson click event
    
    // Don't allow undoing completion for quizzes and assignments
    if (lesson.content_type === 'quiz' || lesson.content_type === 'assignment') {
      return; // Quiz and assignment completion cannot be undone
    }
    
    // Check if this lesson has assignments - if so, don't allow undo
    const hasAssignments = selectedCourse?.modules?.some(module => 
      module.assignments?.some(assignment => assignment.lesson_id === lesson.id)
    );
    
    if (hasAssignments) {
      return; // Assignment completion cannot be undone
    }
    
    // Allow undoing completion for video and text lessons
    if (isCompleted) {
      try {
        const result = await unmarkComplete(lesson.id);
        await refetchCompletedLessons();
        // Update course progress in parent component
        if (result?.progress !== undefined && onProgressUpdate) {
          onProgressUpdate(result.progress);
        }
      } catch (error) {
        console.error('Error unmarking lesson:', error);
      }
    }
  };

  // Handle marking lesson as complete from MediaPlayer
  const handleMarkLessonComplete = async (lessonId) => {
    try {
      const result = await markComplete(lessonId);
      await refetchCompletedLessons();
      // Update course progress in parent component
      if (result?.progress !== undefined && onProgressUpdate) {
        onProgressUpdate(result.progress);
      }
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  // Function to get completion status icon
  const getCompletionIcon = (isCompleted, lesson) => {
    // Check if this lesson has assignments
    const hasAssignments = selectedCourse?.modules?.some(module => 
      module.assignments?.some(assignment => assignment.lesson_id === lesson.id)
    );
    
    // Check if this lesson can be undone (not quiz, not assignment, and is completed)
    const canUndo = isCompleted && 
      lesson.content_type !== 'quiz' && 
      lesson.content_type !== 'assignment' && 
      !hasAssignments;
    
    return (
      <Box
        onClick={(e) => handleCompletionIconClick(e, lesson, isCompleted)}
        sx={{
          cursor: canUndo ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          '&:hover': canUndo ? {
            opacity: 0.7
          } : {}
        }}
        title={canUndo ? 'Click to undo completion' : 
               isCompleted && lesson.content_type === 'quiz' ? 'Quiz completion cannot be undone' :
               isCompleted && lesson.content_type === 'assignment' ? 'Assignment completion cannot be undone' :
               isCompleted && hasAssignments ? 'Assignment completion cannot be undone' : ''}
      >
        {isCompleted ? (
          <CheckCircleOutline color="success" fontSize="small" />
        ) : (
          <RadioButtonUnchecked color="action" fontSize="small" />
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<Close />}
        onClick={onBack}
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Back to Courses
      </Button>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "90%",
          mx: "auto",
        }}
      >
        {/* Course Header */}
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {selectedCourse.name}
            </Typography>

            <Box display="flex" alignItems="center" mb={2}>
              <Box sx={{ width: "100%", mr: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={selectedCourse.progress}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                  }}
                />
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {selectedCourse.progress}%
              </Typography>
            </Box>

            <Typography variant="body1">
              Completed {getCompletedItemsCount()} of{" "}
              {getTotalItemsCount()} items
            </Typography>
          </CardContent>
        </Card>

        {/* Curriculum */}
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              Course Content
            </Typography>

            {selectedCourse.modules.map((module, moduleIndex) => (
              <Accordion
                key={module.id}
                defaultExpanded={moduleIndex === 0}
                sx={{
                  mb: 2,
                  "&:before": { display: "none" },
                  boxShadow: "none",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "8px !important",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    backgroundColor: "grey.50",
                    borderRadius: moduleIndex === 0 ? "8px 8px 0 0" : "8px",
                    "&.Mui-expanded": {
                      borderRadius: "8px 8px 0 0",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="medium"
                    sx={{ color: "black" }}
                  >
                    {module.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {/* Lessons - filtering out assignment and quiz type lessons to avoid duplication */}
                        {module.lessons && module.lessons
                          .filter(lesson => lesson.content_type !== 'assignment' && lesson.content_type !== 'quiz')
                          .map((lesson) => {
                          const isCompleted = isLessonCompleted(lesson.id);
                          
                          return (
                            <TableRow 
                              key={`lesson-${lesson.id}`} 
                              hover
                              onClick={() => handleLessonClick(lesson)}
                              sx={{ 
                                cursor: "pointer",
                                textDecoration: isCompleted ? "line-through" : "none",
                                opacity: isCompleted ? 0.7 : 1,
                                backgroundColor: isCompleted ? 'action.hover' : 'transparent',
                                '&:hover': {
                                  backgroundColor: isCompleted ? 'action.selected' : 'action.hover'
                                }
                              }}
                            >
                              <TableCell sx={{ width: 50, pl: 3 }}>
                                {getLessonIcon(lesson.content_type, isCompleted)}
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography 
                                    variant="body1"
                                    sx={{
                                      textDecoration: isCompleted ? "line-through" : "none",
                                      color: isCompleted ? "text.secondary" : "text.primary"
                                    }}
                                  >
                                    {lesson.title}
                                  </Typography>
                                  {getCompletionIcon(isCompleted, lesson)}
                                </Box>
                                <Chip 
                                  label={lesson.content_type.charAt(0).toUpperCase() + lesson.content_type.slice(1)}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mt: 0.5, fontSize: '0.7rem', height: '20px' }}
                                />
                              </TableCell>
                              <TableCell sx={{ width: 100 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {lesson.duration ? `${lesson.duration} min` : 
                                   lesson.content_type === 'quiz' ? 'Quiz' :
                                   lesson.content_type === 'assignment' ? 'Assignment' :
                                   lesson.content_type === 'video' ? 'Video' : 'Reading'}
                                </Typography>
                                {isCompleted && (
                                  <Typography
                                    variant="caption"
                                    color="success.main"
                                    display="block"
                                  >
                                    Completed
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        {/* Quizzes */}
                        {module.quizzes && module.quizzes.map((quiz) => {
                          const quizStatus = quizStatuses[quiz.id] || { passed: false, attempts: 0, bestScore: 0 };
                          const isPassed = quizStatus.passed;
                          const isAttempted = quizStatus.attempts > 0;
                          const isCompleted = isPassed || isAttempted;
                          
                          return (
                            <TableRow
                              key={`quiz-${quiz.id}`}
                              hover
                              onClick={() => navigate(`/quiz/${quiz.id}`)}
                              sx={{ 
                                cursor: "pointer",
                                textDecoration: isCompleted ? "line-through" : "none",
                                opacity: isCompleted ? 0.7 : 1,
                                backgroundColor: isCompleted ? 'action.hover' : 'transparent',
                                '&:hover': {
                                  backgroundColor: isCompleted ? 'action.selected' : 'action.hover'
                                }
                              }}
                            >
                              <TableCell sx={{ width: 50, pl: 3 }}>
                                <Quiz 
                                  fontSize="medium" 
                                  color={isCompleted ? "success" : "warning"}
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography 
                                    variant="body1"
                                    sx={{
                                      textDecoration: isCompleted ? "line-through" : "none",
                                      color: isCompleted ? "text.secondary" : "text.primary"
                                    }}
                                  >
                                    {quiz.title}
                                  </Typography>
                                  {isCompleted && <CheckCircleOutline color="success" fontSize="small" />}
                                </Box>
                                
                                {quiz.time_limit && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Time limit: {quiz.time_limit} minutes
                                  </Typography>
                                )}
                                
                                <Chip 
                                  label="Quiz"
                                  size="small"
                                  variant="outlined"
                                  color={isPassed ? "success" : "default"}
                                  sx={{ mt: 0.5, fontSize: '0.7rem', height: '20px' }}
                                />
                              </TableCell>
                              <TableCell sx={{ width: 100 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Quiz
                                </Typography>
                                {isPassed && (
                                  <Typography
                                    variant="caption"
                                    color="success.main"
                                    display="block"
                                  >
                                    Passed ({quizStatus.bestScore}%)
                                  </Typography>
                                )}
                                {!isPassed && quizStatus.attempts > 0 && (
                                  <Typography
                                    variant="caption"
                                    color="error.main"
                                    display="block"
                                  >
                                    Failed ({quizStatus.bestScore}%)
                                  </Typography>
                                )}
                                {!isPassed && quizStatus.attempts === 0 && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Not attempted
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        {/* Assignments - now from module.assignments */}
                        {module.assignments && module.assignments.map((assignment) => {
                          const isOverdue = assignment.deadline && new Date(assignment.deadline) < new Date();
                          const assignmentStatus = assignmentStatuses[assignment.id] || { status: 'Pending', submitted: false };
                          const isSubmitted = assignmentStatus.submitted;
                          
                          return (
                            <TableRow
                              key={`assignment-${assignment.id}`}
                              hover
                              onClick={() => handleAssignmentSelect(assignment)}
                              sx={{ 
                                cursor: "pointer",
                                textDecoration: isSubmitted ? "line-through" : "none",
                                opacity: isSubmitted ? 0.7 : 1,
                                backgroundColor: isSubmitted ? 'action.hover' : 'transparent',
                                '&:hover': {
                                  backgroundColor: isSubmitted ? 'action.selected' : 'action.hover'
                                }
                              }}
                            >
                              <TableCell sx={{ width: 50, pl: 3 }}>
                                <Assignment 
                                  fontSize="medium" 
                                  color={isSubmitted ? "success" : isOverdue ? "error" : "secondary"}
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography 
                                    variant="body1"
                                    sx={{
                                      textDecoration: isSubmitted ? "line-through" : "none",
                                      color: isSubmitted ? "text.secondary" : isOverdue && !isSubmitted ? "error.main" : "text.primary"
                                    }}
                                  >
                                    {assignment.title}
                                  </Typography>
                                  {isSubmitted && <CheckCircleOutline color="success" fontSize="small" />}
                                  {isSubmitted && !isOverdue && (
                                    <Tooltip title="Delete Submission">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSubmission(assignment);
                                        }}
                                        sx={{ ml: 1 }}
                                      >
                                        <DeleteIcon fontSize="small" color="error" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                                
                                {assignment.deadline && (
                                  <Typography
                                    variant="caption"
                                    color={isOverdue && !isSubmitted ? "error.main" : "warning.main"}
                                    display="block"
                                  >
                                    Due: {new Date(assignment.deadline).toLocaleDateString()}
                                    {isOverdue && !isSubmitted && " (Overdue)"}
                                  </Typography>
                                )}
                                
                                <Chip 
                                  label="Assignment"
                                  size="small"
                                  variant="outlined"
                                  color={isSubmitted ? "success" : isOverdue ? "error" : "default"}
                                  sx={{ mt: 0.5, fontSize: '0.7rem', height: '20px' }}
                                />
                              </TableCell>
                              <TableCell sx={{ width: 100 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Assignment
                                </Typography>
                                {isSubmitted && (
                                  <Typography
                                    variant="caption"
                                    color="success.main"
                                    display="block"
                                  >
                                    Submitted
                                  </Typography>
                                )}
                                {isOverdue && !isSubmitted && (
                                  <Typography
                                    variant="caption"
                                    color="error.main"
                                    display="block"
                                  >
                                    Overdue
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      </Box>

      {/* Assignment Dialog */}
      <Dialog
        open={Boolean(activeAssignment)}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            {assignmentSubmitted && (
              <Button
                startIcon={<ArrowBack />}
                onClick={() => setAssignmentSubmitted(false)}
                sx={{ mr: 2 }}
              >
                Back
              </Button>
            )}
            <Typography variant="h6" fontWeight="bold">
              {activeAssignment?.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {assignmentSubmitted ? (
            <Box py={2}>
              <Box textAlign="center" mb={3}>
                <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Assignment Submitted
                </Typography>
                <Typography color="text.secondary">
                  Submitted on: {assignmentStatuses[activeAssignment?.id]?.submittedAt ? 
                    new Date(assignmentStatuses[activeAssignment.id].submittedAt).toLocaleDateString() : 'Unknown'}
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Your Submission:
              </Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 1, 
                  backgroundColor: 'grey.50',
                  maxHeight: 300,
                  overflow: 'auto'
                }}
              >
                {assignmentStatuses[activeAssignment?.id]?.content ? (
                  // Check if content is a URL (file) or text
                  assignmentStatuses[activeAssignment?.id]?.content.startsWith('http') ? (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Submitted file:
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => window.open(assignmentStatuses[activeAssignment?.id]?.content, '_blank')}
                        sx={{ mb: 1 }}
                      >
                        View Submission File
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                      {assignmentStatuses[activeAssignment?.id]?.content}
                    </Typography>
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No submission available
                  </Typography>
                )}
              </Box>
              
              {activeAssignment?.deadline && new Date(activeAssignment.deadline) > new Date() && (
                <Box mt={2} textAlign="center">
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteSubmission(activeAssignment)}
                    startIcon={<DeleteIcon />}
                  >
                    Delete Submission
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" paragraph>
                {activeAssignment?.description}
              </Typography>

              {activeAssignment?.deadline && (
                <Chip
                  label={`Due: ${new Date(activeAssignment.deadline).toLocaleDateString()}`}
                  color="warning"
                  sx={{ mb: 3 }}
                />
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Submission
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                placeholder="Type your assignment submission here..."
                value={assignmentSubmission}
                onChange={(e) => setAssignmentSubmission(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <input
                type="file"
                accept=".doc,.docx,.pdf,.txt"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setSubmissionFile(file);
                }}
                style={{ marginBottom: 16 }}
              />
              
              {submissionFile && (
                <Typography variant="body2" color="text.secondary">
                  Selected file: {submissionFile.name}
                </Typography>
              )}

              {activeAssignment?.attachments && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Attachments
                  </Typography>
                  <Box display="flex" gap={1}>
                    {activeAssignment.attachments.map((file) => (
                      <Chip
                        key={file.name}
                        label={file.name}
                        onClick={() => window.open(file.url, "_blank")}
                        sx={{ cursor: "pointer" }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {assignmentSubmitted ? (
            <Button onClick={handleCloseDialog}>Close</Button>
          ) : (
            <>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSubmitAssignment}
                disabled={(!assignmentSubmission.trim() && !submissionFile) || submitting}
                startIcon={submitting ? <ClockLoader size={16} color="#ffffff" /> : <UploadIcon />}
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Media Player for Video and PDF Content */}
      <MediaPlayer
        open={mediaPlayerOpen}
        onClose={() => {
          setMediaPlayerOpen(false);
          setSelectedLesson(null);
        }}
        lesson={selectedLesson}
        onMarkComplete={handleMarkLessonComplete}
        isCompleted={selectedLesson ? isLessonCompleted(selectedLesson.id) : false}
      />
    </Container>
  );
};

export default CourseDetailsView;
