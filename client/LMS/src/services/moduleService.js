import apiClient from './apiClient';

// Create a new module
export const createModule = async (courseId, moduleData) => {
  try {
    const response = await apiClient.post(`/modules/courses/${courseId}/modules`, moduleData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error creating module:", error);
    throw error;
  }
};

// Get all modules for a specific course
export const getModulesByCourse = async (courseId) => {
  try {
    const response = await apiClient.get(`/modules/courses/${courseId}/modules`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching modules for course ${courseId}:`, error);
    throw error;
  }
};

// Get a specific module by ID
export const getModuleById = async (moduleId) => {
  try {
    const response = await apiClient.get(`/modules/modules/${moduleId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching module ${moduleId}:`, error);
    throw error;
  }
};

// Update a module
export const updateModule = async (courseId, moduleId, moduleData) => {
  try {
    const response = await apiClient.put(`/modules/courses/${courseId}/modules/${moduleId}`, moduleData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error updating module ${moduleId}:`, error);
    throw error;
  }
};

// Update module with course (alternative function name used in some components)
export const updateModuleWithCourse = async (courseId, moduleId, moduleData) => {
  return updateModule(courseId, moduleId, moduleData);
};

// Update module without course context (for simple updates)
export const updateModuleSimple = async (moduleId, moduleData) => {
  try {
    const response = await apiClient.put(`/modules/modules/${moduleId}`, moduleData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error updating module ${moduleId}:`, error);
    throw error;
  }
};

// Delete a module
export const deleteModule = async (courseId, moduleId) => {
  try {
    const response = await apiClient.delete(`/modules/courses/${courseId}/modules/${moduleId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error deleting module ${moduleId}:`, error);
    throw error;
  }
};

export default {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  updateModuleWithCourse,
  updateModuleSimple,
  deleteModule
};
