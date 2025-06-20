
import { useState, useEffect, useCallback } from 'react';
import {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  deleteModule
} from '../services/moduleService';

// Hook for getting modules by course
export const useModulesByCourse = (courseId) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModules = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getModulesByCourse(courseId);
      setModules(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return { modules, loading, error, refetch: fetchModules };
};

// Hook for getting a specific module
export const useModule = (moduleId) => {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModule = useCallback(async () => {
    if (!moduleId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getModuleById(moduleId);
      setModule(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch module');
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  return { module, loading, error, refetch: fetchModule };
};

// Hook for module management (instructor/admin)
export const useModuleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (courseId, moduleData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createModule(courseId, moduleData);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create module');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (moduleId, moduleData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateModule(moduleId, moduleData);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update module');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (moduleId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteModule(moduleId);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete module');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, remove, loading, error };
};

export default {
  useModulesByCourse,
  useModule,
  useModuleManagement
};