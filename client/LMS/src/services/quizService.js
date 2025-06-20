import apiClient from "./apiClient.js";

// Get quiz details
export const getQuiz = async (id) => {
  try {
    const response = await apiClient.get(`/quizzes/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching quiz ${id}:`, error);
    throw error;
  }
};

// Submit quiz (Student only)
export const submitQuiz = async (id, answers, startTime = null) => {
  try {
    const payload = { answers };
    if (startTime) {
      payload.startTime = startTime.toISOString();
    }
    const response = await apiClient.post(`/quizzes/${id}/submit`, payload);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error submitting quiz ${id}:`, error);
    throw error;
  }
};

// Get quiz results (Student only)
export const getQuizResults = async (id) => {
  try {
    const response = await apiClient.get(`/quizzes/${id}/results`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching quiz results for ${id}:`, error);
    throw error;
  }
};

// Get all quiz attempts (Student only)
export const getQuizAttempts = async (id) => {
  try {
    const response = await apiClient.get(`/quizzes/${id}/attempts`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching quiz attempts for ${id}:`, error);
    throw error;
  }
};

// Create quiz (Instructor/Admin only)
export const createQuiz = async (courseId, lessonId, quizData) => {
  try {
    const response = await apiClient.post(
      `/quizzes/courses/${courseId}/lessons/${lessonId}/quizzes`,
      quizData
    );

    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error creating quiz:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw error;
  }
};

// Get quizzes for a lesson (get from lesson details)
export const getQuizzesByLesson = async (lessonId) => {
  try {
    const response = await apiClient.get(`/quizzes/lessons/${lessonId}`);
    return response.data?.data || [];
  } catch (error) {
    console.error(`Error fetching quizzes for lesson ${lessonId}:`, error);
    throw error;
  }
};

// Update quiz (Instructor/Admin only)
export const updateQuiz = async (id, quizData) => {
  try {
    const response = await apiClient.put(`/quizzes/${id}`, quizData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error updating quiz ${id}:`, error);
    throw error;
  }
};

// Delete quiz (Instructor/Admin only)
export const deleteQuiz = async (id) => {
  try {
    const response = await apiClient.delete(`/quizzes/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error deleting quiz ${id}:`, error);
    throw error;
  }
};

// Get all quiz submissions (use results endpoint)
export const getQuizSubmissions = async (id) => {
  try {
    const response = await apiClient.get(`/quizzes/${id}/results`);
    return response.data?.data || [];
  } catch (error) {
    console.error(`Error fetching quiz submissions for ${id}:`, error);
    throw error;
  }
};

const quizService = {
  // Get all quizzes for the authenticated user
  async getUserQuizzes() {
    try {
      const response = await apiClient.get('/quizzes/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user quizzes:', error);
      throw error;
    }
  },
  getQuiz,
  submitQuiz,
  getQuizResults,
  getQuizAttempts,
  createQuiz,
  getQuizzesByLesson,
  updateQuiz,
  deleteQuiz,
  getQuizSubmissions,
};

export default quizService;
