// Client-side validation utilities
// Provides comprehensive validation for form inputs before sending to backend

import { createResponse } from './responseHelper';

// Email validation - matches backend Joi.string().email().required()
export const validateEmail = (email) => {
  if (!email) {
    return createResponse(false, 'Email is required');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return createResponse(false, 'Please enter a valid email address');
  }
  
  return createResponse(true, 'Valid email');
};

// Password validation - matches backend Joi.string().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6, // Backend requires minimum 6 characters
    requireUppercase = true, // Backend requires uppercase letter
    requireLowercase = true, // Backend requires lowercase letter
    requireNumbers = true, // Backend requires number
    requireSpecialChars = true // Backend requires special character
  } = options;

  if (!password) {
    return createResponse(false, 'Password is required');
  }

  if (password.length < minLength) {
    return createResponse(false, `Password must be at least ${minLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return createResponse(false, 'Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return createResponse(false, 'Password must contain at least one lowercase letter');
  }

  if (requireNumbers && !/\d/.test(password)) {
    return createResponse(false, 'Password must contain at least one number');
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return createResponse(false, 'Password must contain at least one special character');
  }

  return createResponse(true, 'Valid password');
};

// Confirm password validation
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return createResponse(false, 'Please confirm your password');
  }
  
  if (password !== confirmPassword) {
    return createResponse(false, 'Passwords do not match');
  }
  
  return createResponse(true, 'Passwords match');
};

// Alias for backward compatibility
export const validatePasswordMatch = validatePasswordConfirmation;

// Required field validation
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return createResponse(false, `${fieldName} is required`);
  }
  
  return createResponse(true, `${fieldName} is valid`);
};

// Text length validation
export const validateTextLength = (text, fieldName, minLength = 0, maxLength = Infinity) => {
  if (!text) {
    return createResponse(false, `${fieldName} is required`);
  }
  
  if (text.length < minLength) {
    return createResponse(false, `${fieldName} must be at least ${minLength} characters long`);
  }
  
  if (text.length > maxLength) {
    return createResponse(false, `${fieldName} must be no more than ${maxLength} characters long`);
  }
  
  return createResponse(true, `${fieldName} is valid`);
};

// Number validation
export const validateNumber = (value, fieldName, min = -Infinity, max = Infinity) => {
  if (value === null || value === undefined || value === '') {
    return createResponse(false, `${fieldName} is required`);
  }
  
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return createResponse(false, `${fieldName} must be a valid number`);
  }
  
  if (numValue < min) {
    return createResponse(false, `${fieldName} must be at least ${min}`);
  }
  
  if (numValue > max) {
    return createResponse(false, `${fieldName} must be no more than ${max}`);
  }
  
  return createResponse(true, `${fieldName} is valid`);
};

// URL validation
export const validateUrl = (url, fieldName = 'URL') => {
  if (!url) {
    return createResponse(false, `${fieldName} is required`);
  }
  
  try {
    new URL(url);
    return createResponse(true, `${fieldName} is valid`);
  } catch {
    return createResponse(false, `Please enter a valid ${fieldName.toLowerCase()}`);
  }
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [],
    required = true
  } = options;
  
  if (!file) {
    if (required) {
      return createResponse(false, 'File is required');
    }
    return createResponse(true, 'File is valid');
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return createResponse(false, `File size must be less than ${maxSizeMB}MB`);
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return createResponse(false, `File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  return createResponse(true, 'File is valid');
};

// Quiz validation - matches backend createQuiz and updateQuiz schemas
export const validateQuiz = (quiz) => {
  const errors = [];
  
  // Validate title - backend: Joi.string().min(3).max(150).required()
  const titleValidation = validateTextLength(quiz.title, 'Quiz title', 3, 150);
  if (!titleValidation.success) errors.push(titleValidation.message);
  
  // Validate passing score - backend: Joi.number().integer().min(0).max(100).default(50)
  if (quiz.passing_score !== undefined && quiz.passing_score !== null) {
    const scoreValidation = validateNumber(quiz.passing_score, 'Passing score', 0, 100);
    if (!scoreValidation.success) errors.push(scoreValidation.message);
    if (!Number.isInteger(quiz.passing_score)) {
      errors.push('Passing score must be a whole number');
    }
  }
  
  // Validate time limit - backend: Joi.number().integer().min(1).optional()
  if (quiz.time_limit !== undefined && quiz.time_limit !== null) {
    const timeValidation = validateNumber(quiz.time_limit, 'Time limit', 1);
    if (!timeValidation.success) errors.push(timeValidation.message);
    if (!Number.isInteger(quiz.time_limit)) {
      errors.push('Time limit must be a whole number');
    }
  }
  
  // Validate max attempts - backend: Joi.number().integer().min(1).optional()
  if (quiz.max_attempts !== undefined && quiz.max_attempts !== null) {
    const attemptsValidation = validateNumber(quiz.max_attempts, 'Max attempts', 1);
    if (!attemptsValidation.success) errors.push(attemptsValidation.message);
    if (!Number.isInteger(quiz.max_attempts)) {
      errors.push('Max attempts must be a whole number');
    }
  }
  
  return errors.length > 0
    ? createResponse(false, 'Quiz validation failed', null, errors)
    : createResponse(true, 'Quiz is valid');
};

// Quiz question validation - matches backend question schema
export const validateQuizQuestion = (questionData) => {
  const errors = [];
  
  // Validate question text - backend: Joi.string().min(10).required()
  if (!questionData.question_text || questionData.question_text.trim().length === 0) {
    errors.push('Question text is required');
  } else if (questionData.question_text.trim().length < 10) {
    errors.push('Question text must be at least 10 characters long');
  }
  
  // Validate question type - backend: Joi.string().valid("multiple_choice", "true_false", "short_answer").required()
  if (!questionData.question_type) {
    errors.push('Question type is required');
  } else if (!['multiple_choice', 'true_false'/*, 'short_answer'*/].includes(questionData.question_type)) {
    errors.push('Question type must be multiple_choice or true_false'); // , or short_answer');
  }
  
  // Validate points - backend: Joi.number().integer().min(1).default(1)
  if (questionData.points !== undefined && questionData.points !== null) {
    if (questionData.points < 1) {
      errors.push('Points must be at least 1');
    }
    if (!Number.isInteger(questionData.points)) {
      errors.push('Points must be a whole number');
    }
  }
  
  // Validate options based on question type
  if (questionData.question_type === 'multiple_choice') {
    // Backend: Joi.array().min(2).required() for multiple_choice
    if (!questionData.options || questionData.options.length < 2) {
      errors.push('Multiple choice questions must have at least 2 options');
    } else {
      const hasValidOptions = questionData.options.every(option => 
        option.option_text && option.option_text.trim().length > 0
      );
      if (!hasValidOptions) {
        errors.push('All options must have text');
      }
      
      const hasCorrectAnswer = questionData.options.some(option => option.is_correct);
      if (!hasCorrectAnswer) {
        errors.push('At least one option must be marked as correct');
      }
    }
  } else if (questionData.question_type === 'true_false') {
    // Backend: Joi.array().length(2).required() for true_false
    if (!questionData.options || questionData.options.length !== 2) {
      errors.push('True/false questions must have exactly 2 options');
    } else {
      const hasCorrectAnswer = questionData.options.some(option => option.is_correct);
      if (!hasCorrectAnswer) {
        errors.push('One option must be marked as correct');
      }
    }
  }
  // For short_answer, options are optional (backend: Joi.optional()) - Future work
  
  return errors.length > 0 ? errors.join('; ') : null;
};

// Course validation - matches backend createCourse and updateCourse schemas
export const validateCourse = (courseData, isUpdate = false) => {
  const errors = [];
  
  // Validate title - backend: createCourse: min(3).max(150), updateCourse: min(5).max(150)
  if (courseData.title !== undefined) {
    const minLength = isUpdate ? 5 : 3;
    const titleValidation = validateTextLength(courseData.title, 'Course title', minLength, 150);
    if (!titleValidation.success) errors.push(titleValidation.message);
  } else if (!isUpdate) {
    errors.push('Course title is required');
  }
  
  // Validate description - backend: createCourse: min(3).max(1000), updateCourse: max(1000)
  if (courseData.description !== undefined) {
    const minLength = isUpdate ? 0 : 3;
    const descValidation = validateTextLength(courseData.description, 'Course description', minLength, 1000);
    if (!descValidation.success) errors.push(descValidation.message);
  } else if (!isUpdate) {
    errors.push('Course description is required');
  }
  
  // Validate category_id - backend: Joi.number().integer().positive().required() for create
  if (courseData.category_id !== undefined) {
    if (!Number.isInteger(courseData.category_id) || courseData.category_id <= 0) {
      errors.push('Category must be a valid positive number');
    }
  } else if (!isUpdate) {
    errors.push('Category is required');
  }
  
  // Validate thumbnail_url if provided - backend: Joi.string().uri().optional().allow("")
  if (courseData.thumbnail_url && courseData.thumbnail_url.trim() !== '') {
    const urlValidation = validateUrl(courseData.thumbnail_url, 'Thumbnail URL');
    if (!urlValidation.success) errors.push(urlValidation.message);
  }
  
  return errors.length > 0
    ? createResponse(false, 'Course validation failed', null, errors)
    : createResponse(true, 'Course is valid');
};

// User profile validation - matches backend updateProfile and register schemas
export const validateUserProfile = (userData, isRegistration = false) => {
  const errors = [];
  
  // Validate name - backend: register: min(3).max(100), updateProfile: min(2).max(100)
  if (userData.name !== undefined) {
    const minLength = isRegistration ? 3 : 2;
    const nameValidation = validateTextLength(userData.name, 'Name', minLength, 100);
    if (!nameValidation.success) errors.push(nameValidation.message);
  } else {
    errors.push('Name is required');
  }
  
  // Validate email - backend: Joi.string().email().required()
  if (userData.email !== undefined) {
    const emailValidation = validateEmail(userData.email);
    if (!emailValidation.success) errors.push(emailValidation.message);
  } else if (isRegistration) {
    errors.push('Email is required');
  }
  
  // Validate bio if provided - backend: Joi.string().max(500).optional().allow("")
  if (userData.bio !== undefined && userData.bio.length > 500) {
    errors.push('Bio must not exceed 500 characters');
  }
  
  // Validate avatar_url if provided - backend: Joi.string().uri().optional().allow("")
  if (userData.avatar_url && userData.avatar_url.trim() !== '') {
    const urlValidation = validateUrl(userData.avatar_url, 'Avatar URL');
    if (!urlValidation.success) errors.push(urlValidation.message);
  }
  
  // Validate role for registration - backend: valid("student", "instructor", "admin")
  if (isRegistration && userData.role !== undefined) {
    const validRoles = ['student', 'instructor', 'admin'];
    if (!validRoles.includes(userData.role.toLowerCase())) {
      errors.push('Role must be student, instructor, or admin');
    }
  }
  
  return errors.length > 0
    ? createResponse(false, 'Profile validation failed', null, errors)
    : createResponse(true, 'Profile is valid');
};

// Assignment validation - matches backend createAssignment and updateAssignment schemas
export const validateAssignment = (assignmentData, isUpdate = false) => {
  const errors = [];
  
  // Validate title - backend: createAssignment: min(5).max(150), updateAssignment: min(5).max(150)
  if (assignmentData.title !== undefined) {
    const titleValidation = validateTextLength(assignmentData.title, 'Assignment title', 5, 150);
    if (!titleValidation.success) errors.push(titleValidation.message);
  } else if (!isUpdate) {
    errors.push('Assignment title is required');
  }
  
  // Validate description - backend: createAssignment: min(10), updateAssignment: min(10)
  if (assignmentData.description !== undefined) {
    const descValidation = validateTextLength(assignmentData.description, 'Assignment description', 10);
    if (!descValidation.success) errors.push(descValidation.message);
  } else if (!isUpdate) {
    errors.push('Assignment description is required');
  }
  
  // Validate deadline - backend: Joi.date().greater("now").required()
  if (assignmentData.deadline !== undefined) {
    const deadline = new Date(assignmentData.deadline);
    const now = new Date();
    if (deadline <= now) {
      errors.push('Deadline must be in the future');
    }
  } else if (!isUpdate) {
    errors.push('Assignment deadline is required');
  }
  
  return errors.length > 0
    ? createResponse(false, 'Assignment validation failed', null, errors)
    : createResponse(true, 'Assignment is valid');
};

// Module validation - matches backend createModule and updateModule schemas
export const validateModule = (moduleData, isUpdate = false) => {
  const errors = [];
  
  // Validate title - backend: Joi.string().min(3).max(150).required()
  if (moduleData.title !== undefined) {
    const titleValidation = validateTextLength(moduleData.title, 'Module title', 3, 150);
    if (!titleValidation.success) errors.push(titleValidation.message);
  } else if (!isUpdate) {
    errors.push('Module title is required');
  }
  
  // Validate description - backend: Joi.string().max(500).optional().allow("")
  if (moduleData.description !== undefined && moduleData.description.length > 500) {
    errors.push('Module description must not exceed 500 characters');
  }
  
  // Validate orderNum - backend: Joi.number().integer().min(1).required()
  if (moduleData.orderNum !== undefined) {
    if (!Number.isInteger(moduleData.orderNum) || moduleData.orderNum < 1) {
      errors.push('Order number must be a positive integer');
    }
  } else if (!isUpdate) {
    errors.push('Module order number is required');
  }
  
  return errors.length > 0
    ? createResponse(false, 'Module validation failed', null, errors)
    : createResponse(true, 'Module is valid');
};

// Lesson validation - matches backend createLesson and updateLesson schemas
export const validateLesson = (lessonData, isUpdate = false) => {
  const errors = [];
  
  // Validate title - backend: Joi.string().min(3).max(150).required()
  if (lessonData.title !== undefined) {
    const titleValidation = validateTextLength(lessonData.title, 'Lesson title', 3, 150);
    if (!titleValidation.success) errors.push(titleValidation.message);
  } else if (!isUpdate) {
    errors.push('Lesson title is required');
  }
  
  // Validate contentType - backend: Joi.string().valid("video", "quiz", "text", "assignment").required()
  if (lessonData.contentType !== undefined) {
    const validTypes = ['video', 'quiz', 'text', 'assignment'];
    if (!validTypes.includes(lessonData.contentType)) {
      errors.push('Content type must be video, quiz, text, or assignment');
    }
  } else if (!isUpdate) {
    errors.push('Lesson content type is required');
  }
  
  // Validate contentUrl - backend: conditional validation based on contentType
  if (lessonData.contentType === 'video' && lessonData.contentUrl) {
    const urlValidation = validateUrl(lessonData.contentUrl, 'Content URL');
    if (!urlValidation.success) errors.push(urlValidation.message);
  }
  
  // Validate orderNum - backend: Joi.number().integer().min(1).required()
  if (lessonData.orderNum !== undefined) {
    if (!Number.isInteger(lessonData.orderNum) || lessonData.orderNum < 1) {
      errors.push('Order number must be a positive integer');
    }
  } else if (!isUpdate) {
    errors.push('Lesson order number is required');
  }
  
  return errors.length > 0
    ? createResponse(false, 'Lesson validation failed', null, errors)
    : createResponse(true, 'Lesson is valid');
};

// Assignment submission validation - matches backend submitAssignment schema
export const validateAssignmentSubmission = (submissionData) => {
  const errors = [];
  
  const hasUrl = submissionData.submissionUrl && submissionData.submissionUrl.trim() !== '';
  const hasContent = submissionData.content && submissionData.content.trim() !== '';
  const hasFile = submissionData.file; // File will be validated separately
  
  // At least one submission method should be provided
  if (!hasUrl && !hasContent && !hasFile) {
    errors.push('Please provide either a submission URL, content, or upload a file');
  }
  
  // Validate URL if provided
  if (hasUrl) {
    const urlValidation = validateUrl(submissionData.submissionUrl, 'Submission URL');
    if (!urlValidation.success) errors.push(urlValidation.message);
  }
  
  return errors.length > 0
    ? createResponse(false, 'Submission validation failed', null, errors)
    : createResponse(true, 'Submission is valid');
};

// Grade submission validation - matches backend gradeSubmission schema
export const validateGradeSubmission = (gradeData) => {
  const errors = [];
  
  // Validate grade - backend: Joi.number().integer().min(0).max(100).required()
  if (gradeData.grade === undefined || gradeData.grade === null) {
    errors.push('Grade is required');
  } else {
    const gradeValidation = validateNumber(gradeData.grade, 'Grade', 0, 100);
    if (!gradeValidation.success) errors.push(gradeValidation.message);
    if (!Number.isInteger(gradeData.grade)) {
      errors.push('Grade must be a whole number');
    }
  }
  
  // Validate feedback - backend: Joi.string().optional().allow("")
  // No specific validation needed as it's optional and allows empty strings
  
  return errors.length > 0
    ? createResponse(false, 'Grade validation failed', null, errors)
    : createResponse(true, 'Grade is valid');
};

// Change password validation - matches backend changePassword schema
export const validateChangePassword = (passwordData) => {
  const errors = [];
  
  // Validate current password
  if (!passwordData.currentPassword) {
    errors.push('Current password is required');
  }
  
  // Validate new password - backend: Joi.string().min(6).required()
  const newPasswordValidation = validatePassword(passwordData.newPassword);
  if (!newPasswordValidation.success) {
    errors.push(newPasswordValidation.message);
  }
  
  // Ensure new password is different from current
  if (passwordData.currentPassword && passwordData.newPassword && 
      passwordData.currentPassword === passwordData.newPassword) {
    errors.push('New password must be different from current password');
  }
  
  return errors.length > 0
    ? createResponse(false, 'Password change validation failed', null, errors)
    : createResponse(true, 'Password change is valid');
};

// Generic form validation
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        const result = rule(formData[fieldName], formData);
        if (result) {
          errors[fieldName] = result;
          break; // Stop at first error
        }
      }
    }
  });
  
  return Object.keys(errors).length > 0
    ? createResponse(false, 'Form validation failed', null, errors)
    : createResponse(true, 'Form is valid');
};