import { useState, useEffect, useCallback } from 'react';
import {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentById,
  getEnrollmentsByCourse,
  unenrollStudent
} from '../services/enrollmentService';

// Hook for enrolling in a course
export const useEnrollInCourse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enroll = useCallback(async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await enrollInCourse(courseId);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to enroll in course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { enroll, loading, error };
};

// Hook for getting user's enrollments
export const useMyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return { enrollments, loading, error, refetch: fetchEnrollments };
};

// Hook for getting a specific enrollment
export const useEnrollment = (enrollmentId) => {
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollment = useCallback(async () => {
    if (!enrollmentId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getEnrollmentById(enrollmentId);
      setEnrollment(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch enrollment');
    } finally {
      setLoading(false);
    }
  }, [enrollmentId]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  return { enrollment, loading, error, refetch: fetchEnrollment };
};

// Hook for getting enrollments by course (instructor/admin)
export const useCourseEnrollments = (courseId) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollments = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getEnrollmentsByCourse(courseId);
      setEnrollments(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch course enrollments');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return { enrollments, loading, error, refetch: fetchEnrollments };
};

// Hook for enrollment management (instructor/admin)
export const useEnrollmentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unenroll = useCallback(async (userId, courseId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await unenrollStudent(userId, courseId);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to unenroll student');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { unenroll, loading, error };
};

export default {
  useEnrollInCourse,
  useMyEnrollments,
  useEnrollment,
  useCourseEnrollments,
  useEnrollmentManagement
};