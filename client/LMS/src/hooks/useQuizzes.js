
import { useState, useEffect, useCallback } from 'react';
import {
  getQuiz,
  submitQuiz,
  getQuizResults,
  createQuiz,
  getQuizzesByLesson,
  updateQuiz,
  deleteQuiz,
  getQuizSubmissions
} from '../services/quizService';

// Hook for fetching a specific quiz
export const useQuiz = (quizId) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuiz = useCallback(async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getQuiz(quizId);
      setQuiz(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch quiz';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  return {
    quiz,
    loading,
    error,
    refetch: fetchQuiz
  };
};

// Hook for fetching quizzes by lesson
export const useQuizzesByLesson = (lessonId) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    if (!lessonId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getQuizzesByLesson(lessonId);
      setQuizzes(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch quizzes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return {
    quizzes,
    loading,
    error,
    refetch: fetchQuizzes
  };
};

// Hook for quiz results
export const useQuizResults = (quizId) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = useCallback(async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getQuizResults(quizId);
      // getQuizResults returns an array, but we want the first (most recent) result
      setResults(data && data.length > 0 ? data[0] : null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch quiz results';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return {
    results,
    loading,
    error,
    refetch: fetchResults
  };
};

// Hook for quiz submissions (instructor view)
export const useQuizSubmissions = (quizId) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getQuizSubmissions(quizId);
      setSubmissions(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch quiz submissions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

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

// Hook for quiz management operations
export const useQuizManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNewQuiz = useCallback(async (lessonId, quizData) => {
    try {
      setLoading(true);
      setError(null);
      const newQuiz = await createQuiz(lessonId, quizData);
      return newQuiz;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to create quiz';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingQuiz = useCallback(async (quizId, quizData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedQuiz = await updateQuiz(quizId, quizData);
      return updatedQuiz;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to update quiz';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExistingQuiz = useCallback(async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteQuiz(quizId);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to delete quiz';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitQuizAnswers = useCallback(async (quizId, answers) => {
    try {
      setLoading(true);
      setError(null);
      const result = await submitQuiz(quizId, answers);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to submit quiz';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getQuizDetails = useCallback(async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      const quizData = await getQuiz(quizId);
      return quizData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch quiz details';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createNewQuiz,
    updateExistingQuiz,
    deleteExistingQuiz,
    submitQuizAnswers,
    getQuizDetails
  };
};

export default useQuiz;