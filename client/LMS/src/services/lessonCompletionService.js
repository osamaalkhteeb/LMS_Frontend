import apiClient from './apiClient';

// Mark a lesson as complete
export const markLessonComplete = async (lessonId) => {
  try {
    const response = await apiClient.post('/lesson-completions', { lessonId });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error marking lesson as complete:', error);
    throw error;
  }
};

// Get all completed lessons for the current user
export const getCompletedLessons = async () => {
  try {
    const response = await apiClient.get('/lesson-completions');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching completed lessons:', error);
    throw error;
  }
};

// Get completed lessons by course
export const getCompletedLessonsByCourse = async (courseId) => {
  try {
    const response = await apiClient.get(`/lesson-completions/course/${courseId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching completed lessons by course:', error);
    throw error;
  }
};

// Get all completed lessons by course (for instructors/analytics)
export const getAllCompletedLessonsByCourse = async (courseId) => {
  try {
    const response = await apiClient.get(`/lesson-completions/course/${courseId}/all`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching all completed lessons by course:', error);
    throw error;
  }
};

// Unmark a lesson as complete
export const unmarkLessonComplete = async (lessonId) => {
  try {
    const response = await apiClient.delete('/lesson-completions', { data: { lessonId } });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error unmarking lesson as complete:', error);
    throw error;
  }
};

// Check if a specific lesson is completed
export const checkLessonCompletion = async (lessonId) => {
  try {
    const response = await apiClient.get(`/lesson-completions/lesson/${lessonId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error checking lesson completion:', error);
    throw error;
  }
};

export default {
  markLessonComplete,
  unmarkLessonComplete,
  getCompletedLessons,
  getCompletedLessonsByCourse,
  checkLessonCompletion
};