
import { useState, useEffect, useCallback } from 'react';
import {
  createAssignment,
  getAssignmentsByLesson,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission
} from '../services/assignmentService';

// Hook for fetching a specific assignment
export const useAssignment = (assignmentId) => {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignment = useCallback(async () => {
    if (!assignmentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getAssignment(assignmentId);
      setAssignment(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch assignment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  return {
    assignment,
    loading,
    error,
    refetch: fetchAssignment
  };
};

// Hook for fetching assignments by lesson
export const useAssignmentsByLesson = (lessonId) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    if (!lessonId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getAssignmentsByLesson(lessonId);
      setAssignments(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch assignments';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    refetch: fetchAssignments
  };
};

// Hook for assignment submissions (instructor view)
export const useAssignmentSubmissions = (assignmentId) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    if (!assignmentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getAssignmentSubmissions(assignmentId);
      setSubmissions(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch assignment submissions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    submissions,
    loading,
    error,
    refetch: fetchSubmissions
  };
};

// Hook for assignment management operations
export const useAssignmentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNewAssignment = useCallback(async (lessonId, assignmentData) => {
    try {
      setLoading(true);
      setError(null);
      const newAssignment = await createAssignment(lessonId, assignmentData);
      return newAssignment;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to create assignment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingAssignment = useCallback(async (assignmentId, assignmentData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedAssignment = await updateAssignment(assignmentId, assignmentData);
      return updatedAssignment;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to update assignment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeAssignment = useCallback(async (assignmentId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteAssignment(assignmentId);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to delete assignment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAssignmentWork = useCallback(async (assignmentId, submissionData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await submitAssignment(assignmentId, submissionData);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to submit assignment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const gradeAssignmentSubmission = useCallback(async (submissionId, gradeData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await gradeSubmission(submissionId, gradeData);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to grade submission';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createAssignment: createNewAssignment,
    updateAssignment: updateExistingAssignment,
    removeAssignment,
    submitAssignment: submitAssignmentWork,
    gradeSubmission: gradeAssignmentSubmission
  };
};

export default useAssignment;