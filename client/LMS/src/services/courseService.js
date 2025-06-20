import apiClient from "./apiClient.js";

// Public course endpoints
export const getPublicCourses = async (params = {}) => {
  try {
    const response = await apiClient.get("/courses/public", { params });
    return response.data?.data?.courses || [];
  } catch (error) {
    console.error("Error fetching public courses:", error);
    throw error;
  }
};

export const getCourse = async (id) => {
  try {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    throw error;
  }
};

// General course listing
export const getCourses = async (params = {}) => {
  try {
    const response = await apiClient.get("/courses", { params });
    return response.data?.data?.courses || [];
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

// Instructor/Admin endpoints
export const createCourse = async (courseData) => {
  try {
    const response = await apiClient.post("/courses", courseData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

export const updateCourse = async (id, courseData) => {
  try {
    const response = await apiClient.put(`/courses/${id}`, courseData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error updating course ${id}:`, error);
    throw error;
  }
};

export const deleteCourse = async (id) => {
  try {
    const response = await apiClient.delete(`/courses/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error deleting course ${id}:`, error);
    throw error;
  }
};

export const publishCourse = async (id, publishData) => {
  try {
    const response = await apiClient.put(`/courses/${id}/publish`, publishData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error publishing course ${id}:`, error);
    throw error;
  }
};

// Instructor specific
export const getInstructorCourses = async (params = {}) => {
  try {
    const response = await apiClient.get("/courses/instructor/my-courses", {
      params,
    });
    return response.data?.data?.courses || [];
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    throw error;
  }
};

// Admin only endpoints
export const getPendingCourses = async (params = {}) => {
  try {
    const response = await apiClient.get("/courses/admin/pending", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching pending courses:", error);
    throw error;
  }
};

export const approveCourse = async (id, approvalData) => {
  try {
    const response = await apiClient.put(
      `/courses/${id}/approve`,
      approvalData
    );
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error approving course ${id}:`, error);
    throw error;
  }
};

export const getCourseStats = async () => {
  try {
    const response = await apiClient.get("/courses/admin/stats");
    const data = response.data?.data || response.data;

    // Transform snake_case to camelCase for frontend consistency
    // Convert string values to integers
    return {
      totalCourses: parseInt(data.total_courses) || 0,
      publishedCourses: parseInt(data.published_courses) || 0,
      pendingCourses: parseInt(data.pending_courses) || 0,
      draftCourses: parseInt(data.draft_courses) || 0,
    };
  } catch (error) {
    console.error("Error fetching course stats:", error);
    throw error;
  }
};

// Get course trend data (Admin only)
export const getCourseTrend = async () => {
  try {
    const response = await apiClient.get("/courses/admin/trend");
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching course trend:", error);
    throw error;
  }
};
export const getCoursesByCategory = async () => {
  try {
    const response = await apiClient.get("/courses/admin/categories");

    const result = response.data?.data || response.data;

    return result;
  } catch (error) {
    console.error("Error fetching courses by category:", error);
    throw error;
  }
};

export const getTopPerformingCourses = async (limit = 10) => {
  try {
    const response = await apiClient.get("/courses/admin/top-performing", {
      params: { limit },
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching top performing courses:", error);
    throw error;
  }
};

export default {
  getPublicCourses,
  getCourse,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  getInstructorCourses,
  getPendingCourses,
  approveCourse,
  getCourseStats,
  getCoursesByCategory,
  getTopPerformingCourses,
};
