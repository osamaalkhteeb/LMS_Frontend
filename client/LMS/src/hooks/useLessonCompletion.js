
import { useState, useEffect, useCallback } from 'react';
import {
  markLessonComplete,
  unmarkLessonComplete,
  getCompletedLessons,
  getCompletedLessonsByCourse,
  checkLessonCompletion
} from '../services/lessonCompletionService';

// Hook for marking a lesson as complete
export const useMarkLessonComplete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const markComplete = useCallback(async (lessonId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await markLessonComplete(lessonId);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to mark lesson as complete');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { markComplete, loading, error };
};

// Hook for unmarking a lesson as complete
export const useUnmarkLessonComplete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unmarkComplete = useCallback(async (lessonId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await unmarkLessonComplete(lessonId);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to unmark lesson as complete');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { unmarkComplete, loading, error };
};

// Hook for getting all completed lessons for current user
export const useCompletedLessons = () => {
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompletedLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompletedLessons();
      setCompletedLessons(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch completed lessons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedLessons();
  }, [fetchCompletedLessons]);

  return { completedLessons, loading, error, refetch: fetchCompletedLessons };
};

// Hook for getting completed lessons by course
export const useCompletedLessonsByCourse = (courseId) => {
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompletedLessons = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getCompletedLessonsByCourse(courseId);
      setCompletedLessons(data.completedLessons || data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch completed lessons');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCompletedLessons();
  }, [fetchCompletedLessons]);

  return { completedLessons, loading, error, refetch: fetchCompletedLessons };
};

// Hook for checking if a specific lesson is completed
export const useLessonCompletion = (lessonId) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkCompletion = useCallback(async () => {
    if (!lessonId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await checkLessonCompletion(lessonId);
      setIsCompleted(!!data.isCompleted);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to check lesson completion');
      setIsCompleted(false);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    checkCompletion();
  }, [checkCompletion]);

  return { isCompleted, loading, error, refetch: checkCompletion };
};

// Hook for lesson completion management with progress tracking
export const useLessonProgress = (courseId) => {
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    try {
      const completedData = await getCompletedLessonsByCourse(courseId);
      // Note: You might need to fetch total lessons from course/module service
      // This is a simplified version
      const completed = completedData.length;
      const percentage = completed > 0 ? Math.round((completed / (completed + 1)) * 100) : 0;
      
      setProgress({
        completed,
        total: completed + 1, // Simplified - should get actual total
        percentage
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, error, refetch: fetchProgress };
};

export default {
  useMarkLessonComplete,
  useCompletedLessons,
  useCompletedLessonsByCourse,
  useLessonCompletion,
  useLessonProgress
};