import apiClient from './apiClient';

// Public category functions
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const response = await apiClient.get(`/categories/${categoryId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

// Admin-only category functions
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/categories', categoryData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await apiClient.put(`/categories/${categoryId}`, categoryData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await apiClient.delete(`/categories/${categoryId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};