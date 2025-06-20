import apiClient from './apiClient.js';

// Create assignment (Instructor/Admin only)
export const createAssignment = async (courseId, lessonId, assignmentData) => {
  try {
    const response = await apiClient.post(`/assignments`, { courseId, lessonId, ...assignmentData });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Get assignments for a lesson
export const getAssignmentsByLesson = async (lessonId) => {
  try {
    const response = await apiClient.get(`/assignments/lessons/${lessonId}`);
    return response.data?.data || [];
  } catch (error) {
    console.error(`Error fetching assignments for lesson ${lessonId}:`, error);
    throw error;
  }
};

// Get assignment by ID
export const getAssignment = async (id) => {
  try {
    const response = await apiClient.get(`/assignments/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching assignment ${id}:`, error);
    throw error;
  }
};

// Update assignment (Instructor/Admin only)
export const updateAssignment = async (id, assignmentData) => {
  try {
    const response = await apiClient.put(`/assignments/${id}`, assignmentData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error updating assignment ${id}:`, error);
    throw error;
  }
};

// Delete assignment (Instructor/Admin only)
export const deleteAssignment = async (id) => {
  try {
    const response = await apiClient.delete(`/assignments/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error deleting assignment ${id}:`, error);
    throw error;
  }
};

// Submit assignment (Student only)
export const submitAssignment = async (id, submissionData) => {
  try {
    const response = await apiClient.post(`/assignments/${id}/submit`, submissionData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error submitting assignment ${id}:`, error);
    throw error;
  }
};

// Get submissions for an assignment (Instructor/Admin only)
export const getAssignmentSubmissions = async (courseId, assignmentId) => {
  try {
    const response = await apiClient.get(`/assignments/courses/${courseId}/assignments/${assignmentId}/submissions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching submissions for assignment ${assignmentId}:`, error);
    throw error;
  }
};

// Grade a submission (Instructor/Admin only)
export const gradeSubmission = async (courseId, submissionId, gradeData) => {
  try {
    const response = await apiClient.put(`/assignments/courses/${courseId}/submissions/${submissionId}/grade`, gradeData);
    return response.data;
  } catch (error) {
    console.error(`Error grading submission ${submissionId}:`, error);
    throw error;
  }
};

// Get all assignments for instructor
export const getInstructorAssignments = async () => {
  try {
    const response = await apiClient.get('/assignments/instructor/assignments');
    return response.data;
  } catch (error) {
    console.error('Error fetching instructor assignments:', error);
    throw error;
  }
};

// Delete submission (Student only)
export const deleteSubmission = async (id) => {
  try {
    const response = await apiClient.delete(`/assignments/${id}/submit`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting submission for assignment ${id}:`, error);
    throw error;
  }
};

export default {
  createAssignment,
  getAssignmentsByLesson,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  deleteSubmission,
  getAssignmentSubmissions,
  gradeSubmission
};