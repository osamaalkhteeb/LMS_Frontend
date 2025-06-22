import apiClient from './apiClient.js';

// Create lesson (Instructor/Admin only)
export const createLesson = async (courseId, moduleId, lessonData, isFormData = false) => {
  try {
    const config = isFormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    } : {};

    const response = await apiClient.post(`/lessons/courses/${courseId}/modules/${moduleId}/lessons`, lessonData, config);

    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Enhance error with more specific information
    if (error.response?.data) {
      const enhancedError = new Error(error.response.data.message || 'Failed to create lesson');
      enhancedError.response = error.response;
      enhancedError.status = error.response.status;
      enhancedError.data = error.response.data;
      throw enhancedError;
    }
    
    throw error;
  }
};

// Get lessons for a course (via modules)
export const getLessonsByCourse = async (courseId) => {
  try {
    const response = await apiClient.get(`/modules/courses/${courseId}/modules`);
    const modules = response.data?.data || [];
    // Extract lessons from all modules
    const allLessons = modules.flatMap(module => module.lessons || []);
    
    // Deduplicate lessons by ID to prevent duplicate quiz fetching
    const uniqueLessons = allLessons.filter((lesson, index, array) => 
      array.findIndex(l => l.id === lesson.id) === index
    );
    
  
    
    return uniqueLessons;
  } catch (error) {
    console.error(`Error fetching lessons for course ${courseId}:`, error);
    throw error;
  }
};

// Get lessons by module
export const getLessonsByModule = async (moduleId) => {
  try {
    const response = await apiClient.get(`/modules/modules/${moduleId}`);
    return response.data?.data?.lessons || [];
  } catch (error) {
    console.error(`Error fetching lessons for module ${moduleId}:`, error);
    throw error;
  }
};

// Get lesson by ID
export const getLesson = async (id) => {
  try {
    const response = await apiClient.get(`/lessons/lessons/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching lesson ${id}:`, error);
    throw error;
  }
};

// Update lesson (Instructor/Admin only)
export const updateLesson = async (courseId, lessonId, lessonData) => {
  try {
    const response = await apiClient.put(`/lessons/courses/${courseId}/lessons/${lessonId}`, lessonData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error updating lesson ${lessonId}:`, error);
    throw error;
  }
};

// Delete lesson (Instructor/Admin only)
export const deleteLesson = async (courseId, lessonId) => {
  try {
    const response = await apiClient.delete(`/lessons/courses/${courseId}/lessons/${lessonId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error deleting lesson ${lessonId}:`, error);
    throw error;
  }
};

export default {
  createLesson,
  getLessonsByCourse,
  getLessonsByModule,
  getLesson,
  updateLesson,
  deleteLesson
};