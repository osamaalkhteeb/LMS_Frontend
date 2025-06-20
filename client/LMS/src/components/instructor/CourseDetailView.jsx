import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar
} from "@mui/material";
import {
   ArrowBack as ArrowBackIcon,
   Add as AddIcon
 } from "@mui/icons-material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getModulesByCourse, updateModule, createModule, deleteModule } from '../../services/moduleService';
import { updateLesson, createLesson, deleteLesson } from '../../services/lessonService';
import { createQuiz, deleteQuiz } from '../../services/quizService';
import { createAssignment, deleteAssignment } from '../../services/assignmentService';
import SortableModule from './SortableModule';
import QuizManagement from './QuizManagement';

const CourseDetailView = ({ course, onBack }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModuleDialog, setOpenModuleDialog] = useState(false);
  const [openEditModuleDialog, setOpenEditModuleDialog] = useState(false);
  const [openLessonDialog, setOpenLessonDialog] = useState(false);

  const [openQuizDialog, setOpenQuizDialog] = useState(false);
  const [openQuizManagementDialog, setOpenQuizManagementDialog] = useState(false);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState(null);
  const [editingModule, setEditingModule] = useState(null);

  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '', 
    contentType: 'video', 
    contentUrl: '', 
    duration: 0,
    orderNum: 1,
    uploadType: 'url', // 'url' or 'file'
    file: null
  });
  const [quizForm, setQuizForm] = useState({ title: '', passing_score: 50, time_limit: 10, max_attempts: 1 });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', deadline: '', points: 100 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (course) {
      fetchCourseModules();
    }
  }, [course]);

  const fetchCourseModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch modules from backend API
      const moduleData = await getModulesByCourse(course.id);
      
      // Sort modules by orderNum
      const sortedModules = moduleData.sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0));
      setModules(sortedModules);
    } catch (error) {
      console.error('Error fetching course modules:', error);
      setError(error.response?.data?.message || 'Failed to load course modules');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = modules.findIndex((module) => module.id.toString() === active.id);
    const newIndex = modules.findIndex((module) => module.id.toString() === over.id);

    const updatedModules = arrayMove(modules, oldIndex, newIndex).map((module, index) => ({
      ...module,
      orderNum: index + 1
    }));

    setModules(updatedModules);
    
    // Update module order in backend
    try {
      // Update each module's orderNum in the backend
      await Promise.all(
        updatedModules.map(module => 
          updateModule(course.id, module.id, { orderNum: module.orderNum })
        )
      );
    } catch (error) {
      console.error('Error updating module order:', error);
      // Revert to original order on error
      setModules(modules);
      setError('Failed to update module order');
    }
  };

  const handleLessonDragEnd = async (event, moduleId) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Find the module containing the lessons
    const moduleIndex = modules.findIndex(module => module.id === moduleId);
    if (moduleIndex === -1) return;

    const module = modules[moduleIndex];
    const lessons = module.lessons || [];

    const oldIndex = lessons.findIndex((lesson) => lesson.id.toString() === active.id);
    const newIndex = lessons.findIndex((lesson) => lesson.id.toString() === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const updatedLessons = arrayMove(lessons, oldIndex, newIndex).map((lesson, index) => ({
      ...lesson,
      orderNum: index + 1
    }));

    // Update the modules state
    const updatedModules = [...modules];
    updatedModules[moduleIndex] = {
      ...module,
      lessons: updatedLessons
    };
    setModules(updatedModules);

    // Update lesson order in backend
      try {
        await Promise.all(
          updatedLessons.map(lesson => 
            updateLesson(course.id, lesson.id, { orderNum: lesson.orderNum })
          )
        );
    } catch (error) {
      console.error('Error updating lesson order:', error);
      // Revert to original order on error
      setModules(modules);
      setError('Failed to update lesson order');
    }
  };

  // Module CRUD handlers
  const handleCreateModule = async () => {
    try {
      const orderNum = modules.length + 1;
      const newModule = await createModule(course.id, {
        ...moduleForm,
        orderNum
      });
      
      setModules([...modules, { ...newModule, lessons: [] }]);
      setOpenModuleDialog(false);
      setModuleForm({ title: '', description: '' });
      setSnackbar({ open: true, message: 'Module created successfully', severity: 'success' });
    } catch (error) {
      console.error('Error creating module:', error);
      setSnackbar({ open: true, message: 'Failed to create module', severity: 'error' });
    }
  };

  const handleEditModule = async (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setEditingModule(module);
      setModuleForm({ title: module.title, description: module.description || '' });
      setOpenEditModuleDialog(true);
    }
  };

  const handleUpdateModule = async () => {
    try {
      const updatedModule = await updateModule(course.id, editingModule.id, moduleForm);
      setModules(modules.map(module => 
        module.id === editingModule.id 
          ? { ...module, ...updatedModule }
          : module
      ));
      setOpenEditModuleDialog(false);
      setEditingModule(null);
      setModuleForm({ title: '', description: '' });
      setSnackbar({ open: true, message: 'Module updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating module:', error);
      setSnackbar({ open: true, message: 'Failed to update module', severity: 'error' });
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await deleteModule(course.id, moduleId);
      setModules(modules.filter(module => module.id !== moduleId));
      setSnackbar({ open: true, message: 'Module deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting module:', error);
      setSnackbar({ open: true, message: 'Failed to delete module', severity: 'error' });
    }
  };

  // Lesson CRUD handlers
  const handleCreateLesson = async () => {
    try {
      // Validate input based on upload type
      if (lessonForm.uploadType === 'url') {
        if (!lessonForm.contentUrl) {
          setSnackbar({ open: true, message: 'Please enter a content URL', severity: 'error' });
          return;
        }
        try {
          new URL(lessonForm.contentUrl);
        } catch {
          setSnackbar({ open: true, message: 'Please enter a valid URL', severity: 'error' });
          return;
        }
      } else if (lessonForm.uploadType === 'file') {
        if (!lessonForm.file) {
          setSnackbar({ open: true, message: 'Please select a file to upload', severity: 'error' });
          return;
        }
      }
      
      const moduleIndex = modules.findIndex(module => module.id === selectedModuleId);
      const orderNum = modules[moduleIndex].lessons.length + 1;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', lessonForm.title);
      formData.append('contentType', lessonForm.contentType);
      formData.append('duration', parseInt(lessonForm.duration) || 0);
      formData.append('orderNum', orderNum);
      
      if (lessonForm.uploadType === 'file' && lessonForm.file) {
        formData.append('file', lessonForm.file);
      } else {
        formData.append('contentUrl', lessonForm.contentUrl);
      }
      
      const newLesson = await createLesson(course.id, selectedModuleId, formData, true); // true indicates FormData
      
      const updatedModules = [...modules];
      updatedModules[moduleIndex].lessons.push(newLesson);
      setModules(updatedModules);
      
      setOpenLessonDialog(false);
      setLessonForm({ 
         title: '', 
         contentType: 'video', 
         contentUrl: '', 
         duration: 0,
         orderNum: 1,
         uploadType: 'url',
         file: null
       });
      setSnackbar({ open: true, message: 'Lesson created successfully', severity: 'success' });
    } catch (error) {
      console.error('Error creating lesson:', error);
      setSnackbar({ open: true, message: 'Failed to create lesson', severity: 'error' });
    }
  };





  const handleDeleteLesson = async (lessonId) => {
    try {
      await deleteLesson(course.id, lessonId);
      
      const updatedModules = modules.map(module => ({
        ...module,
        lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
      }));
      
      setModules(updatedModules);
      setSnackbar({ open: true, message: 'Lesson deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setSnackbar({ open: true, message: 'Failed to delete lesson', severity: 'error' });
    }
  };

  // Quiz CRUD handlers
  const handleCreateQuiz = async () => {
    try {
      // First create a lesson for the quiz
      const moduleIndex = modules.findIndex(module => module.id === selectedModuleId);
      const orderNum = modules[moduleIndex].lessons.length + 1;
      
      const newLesson = await createLesson(course.id, selectedModuleId, {
        title: quizForm.title,
        contentType: 'quiz',
        duration: quizForm.time_limit,
        orderNum
      });
      
      // Then create the quiz linked to this lesson
      await createQuiz(course.id, newLesson.id, quizForm);
      
      setOpenQuizDialog(false);
      setQuizForm({ title: '', passing_score: 50, time_limit: 10, max_attempts: 1 });
      setSnackbar({ open: true, message: 'Quiz created successfully', severity: 'success' });
      fetchCourseModules(); // Refresh to get updated data
    } catch (error) {
      console.error('Error creating quiz:', error);
      setSnackbar({ open: true, message: 'Failed to create quiz', severity: 'error' });
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      await deleteQuiz(quizId);
      setSnackbar({ open: true, message: 'Quiz deleted successfully', severity: 'success' });
      fetchCourseModules(); // Refresh to get updated data
    } catch (error) {
      console.error('Error deleting quiz:', error);
      setSnackbar({ open: true, message: 'Failed to delete quiz', severity: 'error' });
    }
  };

  const handleManageQuiz = (lesson) => {
    setSelectedLessonForQuiz(lesson);
    setOpenQuizManagementDialog(true);
  };

  // Assignment CRUD handlers
  const handleCreateAssignment = async () => {
    try {
      // First create a lesson for the assignment
      const moduleIndex = modules.findIndex(module => module.id === selectedModuleId);
      const orderNum = modules[moduleIndex].lessons.length + 1;
      
      const newLesson = await createLesson(course.id, selectedModuleId, {
        title: assignmentForm.title,
        contentType: 'assignment',
        duration: 0,
        orderNum
      });
      
      // Then create the assignment linked to this lesson
      await createAssignment(course.id, newLesson.id, assignmentForm);
      
      setOpenAssignmentDialog(false);
      setAssignmentForm({ title: '', description: '', deadline: '', points: 100 });
      setSnackbar({ open: true, message: 'Assignment created successfully', severity: 'success' });
      fetchCourseModules(); // Refresh to get updated data
    } catch (error) {
      console.error('Error creating assignment:', error);
      setSnackbar({ open: true, message: 'Failed to create assignment', severity: 'error' });
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await deleteAssignment(assignmentId);
      setSnackbar({ open: true, message: 'Assignment deleted successfully', severity: 'success' });
      fetchCourseModules(); // Refresh to get updated data
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setSnackbar({ open: true, message: 'Failed to delete assignment', severity: 'error' });
    }
  };



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchCourseModules} sx={{ ml: 2 }}>Retry</Button>
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mb: 2 }}
        >
          Back to Courses
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {course.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={course.is_published ? 'Published' : 'Draft'}
                color={course.is_published ? "success" : "warning"}
              />
              {!course.is_approved && (
                <Chip label="Pending Approval" color="warning" />
              )}
            </Box>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModuleDialog(true)}
          >
            Add Module
          </Button>
        </Box>
        
        {course.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {course.description}
          </Typography>
        )}
      </Box>

      {/* Modules List with Drag and Drop */}
      <Typography variant="h5" gutterBottom>
        Course Modules ({modules.length})
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Drag modules to reorder them
      </Typography>

      {!loading && modules && modules.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map((module) => module.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {modules.map((module) => (
              <SortableModule 
                key={module.id} 
                module={module} 
                onLessonDragEnd={(event) => handleLessonDragEnd(event, module.id)}
                onDeleteModule={handleDeleteModule}
                onEditModule={handleEditModule}
                onAddLesson={(moduleId) => {
                  setSelectedModuleId(moduleId);
                  setOpenLessonDialog(true);
                }}
    
                onDeleteLesson={handleDeleteLesson}
                onAddQuiz={(moduleId) => {
                  setSelectedModuleId(moduleId);
                  setOpenQuizDialog(true);
                }}
                onDeleteQuiz={handleDeleteQuiz}
                onManageQuiz={handleManageQuiz}
                onAddAssignment={(moduleId) => {
                  setSelectedModuleId(moduleId);
                  setOpenAssignmentDialog(true);
                }}
                onDeleteAssignment={handleDeleteAssignment}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Module Creation Dialog */}
      <Dialog open={openModuleDialog} onClose={() => setOpenModuleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Module</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Module Title"
            fullWidth
            variant="outlined"
            value={moduleForm.title}
            onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={moduleForm.description}
            onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModuleDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateModule} variant="contained" disabled={!moduleForm.title}>
            Create Module
          </Button>
        </DialogActions>
      </Dialog>

      {/* Module Edit Dialog */}
      <Dialog open={openEditModuleDialog} onClose={() => {
        setOpenEditModuleDialog(false);
        setEditingModule(null);
        setModuleForm({ title: '', description: '' });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Module</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Module Title"
            fullWidth
            variant="outlined"
            value={moduleForm.title}
            onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={moduleForm.description}
            onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEditModuleDialog(false);
            setEditingModule(null);
            setModuleForm({ title: '', description: '' });
          }}>Cancel</Button>
          <Button onClick={handleUpdateModule} variant="contained" disabled={!moduleForm.title}>
            Update Module
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lesson Creation Dialog */}
      <Dialog open={openLessonDialog} onClose={() => setOpenLessonDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Lesson</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Lesson Title"
            fullWidth
            variant="outlined"
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
              select
              margin="dense"
              label="Content Type"
              fullWidth
              variant="outlined"
              value={lessonForm.contentType}
              onChange={(e) => setLessonForm({ ...lessonForm, contentType: e.target.value })}
              SelectProps={{ native: true }}
              sx={{ mb: 2 }}
            >
              <option value="video">Video</option>
              <option value="text">Text</option>
            </TextField>
          <TextField
            select
            margin="dense"
            label="Upload Type"
            fullWidth
            variant="outlined"
            value={lessonForm.uploadType}
            onChange={(e) => setLessonForm({ ...lessonForm, uploadType: e.target.value, contentUrl: '', file: null })}
            SelectProps={{ native: true }}
            sx={{ mb: 2 }}
          >
            <option value="url">{lessonForm.contentType === 'video' ? 'YouTube/Video URL' : 'Document URL'}</option>
            <option value="file">{lessonForm.contentType === 'video' ? 'Upload Video File' : 'Upload PDF File'}</option>
          </TextField>
          
          {lessonForm.uploadType === 'url' ? (
            <TextField
              margin="dense"
              label={lessonForm.contentType === 'video' ? 'YouTube/Video URL' : 'Document URL'}
              fullWidth
              variant="outlined"
              value={lessonForm.contentUrl}
              onChange={(e) => setLessonForm({ ...lessonForm, contentUrl: e.target.value })}
              required
              helperText={lessonForm.contentType === 'video' ? 'Enter YouTube URL or direct video link' : 'Enter a valid document URL'}
              sx={{ mb: 2 }}
            />
          ) : (
            <Box sx={{ mb: 2 }}>
              <input
                accept={lessonForm.contentType === 'video' ? 'video/*' : 'application/pdf'}
                style={{ display: 'none' }}
                id="lesson-file-upload"
                type="file"
                onChange={(e) => setLessonForm({ ...lessonForm, file: e.target.files[0] })}
              />
              <label htmlFor="lesson-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ mb: 1, textTransform: 'none' }}
                >
                  {lessonForm.file ? lessonForm.file.name : `Choose ${lessonForm.contentType === 'video' ? 'Video' : 'PDF'} File`}
                </Button>
              </label>
              {lessonForm.file && (
                <Typography variant="caption" color="text.secondary">
                  File size: {(lessonForm.file.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              )}
            </Box>
          )}
          <TextField
            margin="dense"
            label="Duration (minutes)"
            fullWidth
            variant="outlined"
            type="number"
            value={lessonForm.duration}
            onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLessonDialog(false)}>Cancel</Button>
          <Button 
             onClick={handleCreateLesson} 
             variant="contained" 
             disabled={!lessonForm.title || (lessonForm.uploadType === 'url' && !lessonForm.contentUrl) || (lessonForm.uploadType === 'file' && !lessonForm.file)}
           >
            Create Lesson
          </Button>
        </DialogActions>
      </Dialog>



      {/* Quiz Creation Dialog */}
      <Dialog open={openQuizDialog} onClose={() => setOpenQuizDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Quiz</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Quiz Title"
            fullWidth
            variant="outlined"
            value={quizForm.title}
            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Passing Score (%)"
            fullWidth
            variant="outlined"
            type="number"
            value={quizForm.passing_score}
                        onChange={(e) => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Time Limit (minutes)"
            fullWidth
            variant="outlined"
            type="number"
            value={quizForm.time_limit}
                        onChange={(e) => setQuizForm({ ...quizForm, time_limit: parseInt(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Max Attempts"
            fullWidth
            variant="outlined"
            type="number"
            value={quizForm.max_attempts}
                        onChange={(e) => setQuizForm({ ...quizForm, max_attempts: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuizDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateQuiz} variant="contained" disabled={!quizForm.title}>
            Create Quiz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Creation Dialog */}
      <Dialog open={openAssignmentDialog} onClose={() => setOpenAssignmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Assignment Title"
            fullWidth
            variant="outlined"
            value={assignmentForm.title}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={assignmentForm.description}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Due Date"
            fullWidth
            variant="outlined"
            type="datetime-local"
            value={assignmentForm.deadline}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Points"
            fullWidth
            variant="outlined"
            type="number"
            value={assignmentForm.points}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, points: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignmentDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAssignment} variant="contained" disabled={!assignmentForm.title}>
            Create Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quiz Management Dialog */}
      <Dialog 
        open={openQuizManagementDialog} 
        onClose={() => {
          setOpenQuizManagementDialog(false);
          setSelectedLessonForQuiz(null);
        }} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Manage Quiz Questions - {selectedLessonForQuiz?.title}
        </DialogTitle>
        <DialogContent>
          {selectedLessonForQuiz && (
            <QuizManagement 
              lessonId={selectedLessonForQuiz.id} 
              lessonTitle={selectedLessonForQuiz.title}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenQuizManagementDialog(false);
            setSelectedLessonForQuiz(null);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default CourseDetailView;