import apiClient from './apiClient';

// Student enrollment functions
export const enrollInCourse = async (courseId) => {
  try {
    const response = await apiClient.post('/enrollments', { courseId });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

export const getMyEnrollments = async () => {
  try {
    const response = await apiClient.get('/enrollments');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
};

export const getEnrollmentById = async (enrollmentId) => {
  try {
    const response = await apiClient.get(`/enrollments/${enrollmentId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    throw error;
  }
};

// Instructor/Admin functions
export const getEnrollmentsByCourse = async (courseId) => {
  try {
    const response = await apiClient.get(`/enrollments/course/${courseId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    throw error;
  }
};

export const unenrollStudent = async (userId, courseId) => {
  try {
    const response = await apiClient.delete(`/enrollments/${userId}/${courseId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error unenrolling student:', error);
    throw error;
  }
};

export default {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentById,
  getEnrollmentsByCourse,
  unenrollStudent
};