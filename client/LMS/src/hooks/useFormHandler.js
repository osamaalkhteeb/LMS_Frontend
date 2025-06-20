// Custom hook for form handling with validation and error management
// Provides consistent form state management, validation, and error handling

import { useState, useCallback } from 'react';
import { createResponse, handleApiError, getErrorMessage, isSuccessResponse } from '../utils/responseHelper';

export const useFormHandler = (initialData = {}, validationRules = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear submit messages
    if (submitError) setSubmitError(null);
    if (submitSuccess) setSubmitSuccess(null);
  }, [errors, submitError, submitSuccess]);

  // Handle nested object changes (e.g., for complex forms)
  const handleNestedChange = useCallback((path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    
    // Clear field error
    if (errors[path]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  }, [errors]);

  // Validate a single field
  const validateField = useCallback((fieldName, value = formData[fieldName]) => {
    if (!validationRules[fieldName]) return createResponse(true, 'Valid');
    
    const rules = validationRules[fieldName];
    
    for (const rule of rules) {
      const result = rule(value, formData);
      // Handle null/undefined results from validation rules
      if (!result) {
        continue;
      }
      // Handle string results (legacy format)
      if (typeof result === 'string') {
        return createResponse(false, result);
      }
      // Handle response object format
      if (!result.success) {
        return result;
      }
    }
    
    return createResponse(true, 'Valid');
  }, [formData, validationRules]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(validationRules).forEach(fieldName => {
      const result = validateField(fieldName);
      if (!result.success) {
        newErrors[fieldName] = result.message;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [validateField, validationRules]);

  // Handle form submission
  const handleSubmit = useCallback(async (submitFunction, options = {}) => {
    const { skipValidation = false, onSuccess, onError } = options;
    
    // Clear previous messages
    setSubmitError(null);
    setSubmitSuccess(null);
    
    // Validate form if validation rules are provided
    if (!skipValidation && Object.keys(validationRules).length > 0) {
      const isValid = validateForm();
      if (!isValid) {
        return createResponse(false, 'Validation failed');
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitFunction(formData);
      
      if (isSuccessResponse(result)) {
        setSubmitSuccess(result.message || 'Operation completed successfully!');
        if (onSuccess) onSuccess(result);
        return result;
      } else {
        const errorMessage = getErrorMessage(result);
        setSubmitError(errorMessage);
        if (onError) onError(result);
        return result;
      }
    } catch (error) {
      const errorResponse = handleApiError(error);
      const errorMessage = getErrorMessage(errorResponse);
      setSubmitError(errorMessage);
      if (onError) onError(errorResponse);
      return errorResponse;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validationRules, validateForm]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(false);
  }, [initialData]);

  // Update form data programmatically
  const updateFormData = useCallback((newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((fieldName, errorMessage) => {
    setErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
  }, []);

  // Clear field error programmatically
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Check if form has any errors
  const hasErrors = Object.keys(errors).length > 0;

  // Check if form is dirty (has changes from initial data)
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  return {
    // Form state
    formData,
    setFormData,
    errors,
    isSubmitting,
    submitError,
    submitSuccess,
    hasErrors,
    isDirty,
    
    // Form handlers
    handleChange,
    handleNestedChange,
    handleSubmit,
    
    // Validation
    validateField,
    validateForm,
    
    // Utility functions
    resetForm,
    updateFormData,
    setFieldError,
    clearFieldError,
    clearErrors
  };
};

// Hook for handling array fields (like quiz questions)
export const useArrayField = (initialArray = []) => {
  const [items, setItems] = useState(initialArray);

  const addItem = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index, updates) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  }, []);

  const moveItem = useCallback((fromIndex, toIndex) => {
    setItems(prev => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  }, []);

  const resetItems = useCallback(() => {
    setItems(initialArray);
  }, [initialArray]);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    resetItems,
    setItems
  };
};