
import { useState, useEffect, useCallback } from 'react';
import {
  createLesson,
  getLessonsByCourse,
  getLessonsByModule,
  getLesson,
  updateLesson,
  deleteLesson
} from '../services/lessonService';

// Hook for fetching a specific lesson
export const useLesson = (lessonId) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getLesson(lessonId);
      setLesson(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch lesson';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return {
    lesson,
    loading,
    error,
    refetch: fetchLesson
  };
};

// Hook for fetching lessons by course
export const useLessonsByCourse = (courseId) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLessons = useCallback(async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getLessonsByCourse(courseId);
      setLessons(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch lessons';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons
  };
};

// Hook for lesson management operations
export const useLessonManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNewLesson = useCallback(async (courseId, lessonData) => {
    try {
      setLoading(true);
      setError(null);
      const newLesson = await createLesson(courseId, lessonData);
      return newLesson;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to create lesson';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingLesson = useCallback(async (lessonId, lessonData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedLesson = await updateLesson(lessonId, lessonData);
      return updatedLesson;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to update lesson';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeLesson = useCallback(async (lessonId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteLesson(lessonId);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to delete lesson';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createLesson: createNewLesson,
    updateLesson: updateExistingLesson,
    removeLesson
  };
};

// Hook for getting lessons by module
export const useLessonsByModule = (moduleId) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLessons = useCallback(async () => {
    if (!moduleId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getLessonsByModule(moduleId);
      setLessons(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch lessons';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { lessons, loading, error, refetch: fetchLessons };
};

export default {
  useLesson,
  useLessonsByCourse,
  useLessonsByModule,
  useLessonManagement
};