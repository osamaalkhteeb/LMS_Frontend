
import { useState, useEffect, useCallback } from 'react';
import {
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
  getCourseStats
} from '../services/courseService';

// Hook for public courses (no authentication required)
export const usePublicCourses = (params = {}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicCourses(params);
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch public courses:', error);
      setError(error.message || 'Failed to fetch public courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};

// Hook for general courses (authenticated)
export const useCourses = (params = {}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourses(params);
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError(error.message || 'Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};

// Hook for single course
export const useCourse = (id) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getCourse(id);
      setCourse(data);
    } catch (error) {
      console.error(`Failed to fetch course ${id}:`, error);
      setError(error.message || 'Failed to fetch course');
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, error, refetch: fetchCourse };
};

// Hook for instructor courses
export const useInstructorCourses = (params = {}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInstructorCourses(params);
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch instructor courses:', error);
      setError(error.message || 'Failed to fetch instructor courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};

// Hook for pending courses (Admin)
export const usePendingCourses = (params = {}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingCourses(params);
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch pending courses:', error);
      setError(error.message || 'Failed to fetch pending courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};

// Hook for course stats (Admin)
export const useCourseStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourseStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch course stats:', error);
      setError(error.message || 'Failed to fetch course stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// Hook for course management operations
export const useCourseManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async (courseData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createCourse(courseData);
      return result;
    } catch (error) {
      console.error('Failed to create course:', error);
      setError(error.message || 'Failed to create course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, courseData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateCourse(id, courseData);
      return result;
    } catch (error) {
      console.error('Failed to update course:', error);
      setError(error.message || 'Failed to update course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await deleteCourse(id);
      return result;
    } catch (error) {
      console.error('Failed to delete course:', error);
      setError(error.message || 'Failed to delete course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id, publishData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await publishCourse(id, publishData);
      return result;
    } catch (error) {
      console.error('Failed to publish course:', error);
      setError(error.message || 'Failed to publish course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, approvalData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await approveCourse(id, approvalData);
      return result;
    } catch (error) {
      console.error('Failed to approve course:', error);
      setError(error.message || 'Failed to approve course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCourse: handleCreate,
    updateCourse: handleUpdate,
    deleteCourse: handleDelete,
    publishCourse: handlePublish,
    approveCourse: handleApprove
  };
};

// Default export for backward compatibility
export default usePublicCourses;