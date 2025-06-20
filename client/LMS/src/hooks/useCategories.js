
import { useState, useEffect, useCallback } from 'react';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/categoryService';

// Hook for getting all categories (public)
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};

// Hook for getting a specific category
export const useCategory = (categoryId) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategory = useCallback(async () => {
    if (!categoryId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getCategoryById(categoryId);
      setCategory(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return { category, loading, error, refetch: fetchCategory };
};

// Hook for category management (admin only)
export const useCategoryManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createCategory(categoryData);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (categoryId, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateCategory(categoryId, categoryData);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteCategory(categoryId);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, remove, loading, error };
};

export default {
  useCategories,
  useCategory,
  useCategoryManagement
};