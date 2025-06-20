# Client-Side Error Handling and Validation System

This document describes the comprehensive error handling and validation system implemented for the LMS client application.

## Overview

The system provides:
- **Standardized error handling** across all forms
- **Client-side validation** before sending data to the backend
- **Consistent user experience** with proper error messages
- **Reusable utilities** for form management

## Architecture

### 1. Response Helper (`utils/responseHelper.js`)

Provides utilities for handling API responses and errors:

```javascript
// Create standardized responses
const response = createResponse(true, 'Success message', data);

// Handle API responses
const result = await handleApiResponse(apiCall());

// Handle API errors
const errorMessage = handleApiError(error);

// Get user-friendly error messages
const message = getErrorMessage(error);

// Check if response is successful
if (isSuccessResponse(response)) {
  // Handle success
}
```

### 2. Validation Utilities (`utils/validation.js`)

Provides comprehensive validation functions:

#### Basic Validations
- `validateRequired(value, fieldName)` - Required field validation
- `validateEmail(email)` - Email format validation
- `validatePassword(password)` - Password strength validation
- `validatePasswordMatch(confirmPassword, password)` - Password confirmation
- `validateTextLength(text, fieldName, min, max)` - Text length validation
- `validateNumber(value, fieldName, min, max)` - Number range validation
- `validateUrl(url)` - URL format validation
- `validateFile(file, allowedTypes, maxSize)` - File validation

#### Domain-Specific Validations
- `validateQuiz(quiz)` - Quiz data validation
- `validateQuizQuestion(questionData)` - Quiz question validation
- `validateCourse(course)` - Course data validation
- `validateUserProfile(profile)` - User profile validation

#### Generic Form Validation
```javascript
const errors = validateForm(formData, validationRules);
```

### 3. Form Handler Hook (`hooks/useFormHandler.js`)

A custom hook that provides complete form management:

```javascript
const {
  formData,           // Current form data
  errors,             // Field-specific errors
  isSubmitting,       // Submit state
  submitError,        // Submit error message
  submitSuccess,      // Submit success message
  handleChange,       // Input change handler
  handleSubmit,       // Form submit handler
  setFormData,        // Manual form data setter
  clearErrors,        // Clear all errors
  setFieldError,      // Set specific field error
  clearFieldError     // Clear specific field error
} = useFormHandler(initialData, validationRules);
```

## Implementation Examples

### 1. Login Form (Updated)

```javascript
import { useFormHandler } from '../hooks/useFormHandler';
import { validateEmail, validateRequired } from '../utils/validation';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Define validation rules
  const validationRules = {
    email: [validateEmail],
    password: [(value) => validateRequired(value, 'Password')]
  };
  
  // Use form handler
  const {
    formData,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit
  } = useFormHandler(
    { email: '', password: '' },
    validationRules
  );
  
  // Submit handler
  const onSubmit = async (e) => {
    e.preventDefault();
    
    return handleSubmit(async (data) => {
      const result = await login(data);
      // Handle successful login
      navigate('/dashboard');
      return result;
    });
  };
  
  return (
    <form onSubmit={onSubmit}>
      {submitError && (
        <Alert severity="error">{submitError}</Alert>
      )}
      
      <TextField
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
        disabled={isSubmitting}
      />
      
      <TextField
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
        disabled={isSubmitting}
      />
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <CircularProgress size={20} /> : 'Login'}
      </Button>
    </form>
  );
};
```

### 2. Complex Form with Dynamic Fields (Quiz Question)

```javascript
const QuizManagement = () => {
  // Question form validation rules
  const questionValidationRules = {
    question_text: [(value) => validateRequired(value, 'Question text')],
    question_type: [(value) => validateRequired(value, 'Question type')],
    points: [(value) => {
      if (!value || value < 1) return 'Points must be at least 1';
      return null;
    }],
    options: [(value, formData) => validateQuizQuestion(formData)]
  };
  
  // Use form handler for question form
  const {
    formData: questionForm,
    errors: questionErrors,
    isSubmitting: isQuestionSubmitting,
    submitError: questionSubmitError,
    handleChange: handleQuestionChange,
    handleSubmit: handleQuestionSubmit,
    setFormData: setQuestionForm,
    clearErrors
  } = useFormHandler(
    {
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      options: [{ option_text: '', is_correct: false }]
    },
    questionValidationRules
  );
  
  // Handle dynamic field changes
  const handleQuestionFormChange = (field, value) => {
    if (field === 'question_type') {
      // Handle question type specific logic
      let updatedOptions;
      if (value === 'short_answer') {
        updatedOptions = [];
      } else if (value === 'true_false') {
        updatedOptions = [
          { option_text: 'True', is_correct: false },
          { option_text: 'False', is_correct: false }
        ];
      }
      
      setQuestionForm({
        ...questionForm,
        [field]: value,
        options: updatedOptions
      });
    } else {
      handleQuestionChange({ target: { name: field, value } });
    }
  };
  
  // Submit handler
  const handleSaveQuestion = async () => {
    return handleQuestionSubmit(async (data) => {
      const result = await saveQuestion(data);
      // Handle success
      return result;
    });
  };
};
```

## Benefits

### 1. Consistency
- All forms use the same error handling patterns
- Consistent error message formatting
- Standardized loading states

### 2. User Experience
- Real-time validation feedback
- Clear, actionable error messages
- Proper form state management (loading, disabled states)

### 3. Developer Experience
- Reusable validation functions
- Simplified form state management
- Type-safe error handling

### 4. Maintainability
- Centralized validation logic
- Easy to add new validation rules
- Consistent error handling across the application

## Best Practices

### 1. Validation Rules
- Define validation rules as close to the form as possible
- Use descriptive error messages
- Validate both individual fields and form-wide constraints

### 2. Error Display
- Show field-specific errors inline with form fields
- Display form-wide errors at the top of the form
- Use appropriate severity levels (error, warning, info)

### 3. Loading States
- Disable form fields during submission
- Show loading indicators on submit buttons
- Prevent multiple submissions

### 4. Error Recovery
- Allow users to easily correct errors
- Clear errors when users start typing
- Provide helpful suggestions when possible

## Migration Guide

To migrate existing forms to use the new system:

1. **Import the required utilities:**
   ```javascript
   import { useFormHandler } from '../hooks/useFormHandler';
   import { validateEmail, validateRequired } from '../utils/validation';
   ```

2. **Define validation rules:**
   ```javascript
   const validationRules = {
     fieldName: [validationFunction1, validationFunction2]
   };
   ```

3. **Replace useState with useFormHandler:**
   ```javascript
   // Before
   const [formData, setFormData] = useState(initialData);
   
   // After
   const { formData, errors, handleChange, handleSubmit } = useFormHandler(
     initialData,
     validationRules
   );
   ```

4. **Update form fields:**
   ```javascript
   <TextField
     name="fieldName"
     value={formData.fieldName}
     onChange={handleChange}
     error={!!errors.fieldName}
     helperText={errors.fieldName}
     disabled={isSubmitting}
   />
   ```

5. **Update submit handler:**
   ```javascript
   const onSubmit = async (e) => {
     e.preventDefault();
     return handleSubmit(async (data) => {
       const result = await apiCall(data);
       return result;
     });
   };
   ```

This system provides a robust foundation for form handling and validation across the entire LMS application, ensuring a consistent and user-friendly experience.