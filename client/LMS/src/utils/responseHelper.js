// Client-side response helper utility
// Mirrors the server-side createResponse function for consistent error handling

export const createResponse = (success, message, data = null, error = null) => {
  return {
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString()
  };
};

// Helper function to handle API responses consistently
export const handleApiResponse = (response) => {
  if (response.data && typeof response.data === 'object') {
    return response.data;
  }
  
  // If response doesn't follow our standard format, create one
  return createResponse(
    response.status >= 200 && response.status < 300,
    response.statusText || 'Request completed',
    response.data,
    response.status >= 400 ? response.statusText : null
  );
};

// Helper function to handle API errors consistently
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response && error.response.data) {
    // Server responded with error
    return error.response.data;
  }
  
  if (error.request) {
    // Request was made but no response received
    return createResponse(
      false,
      'Network error - please check your connection',
      null,
      'No response from server'
    );
  }
  
  // Something else happened
  return createResponse(
    false,
    error.message || 'An unexpected error occurred',
    null,
    error.message
  );
};

// Helper function to display error messages in a user-friendly way
export const getErrorMessage = (response) => {
  if (!response) return 'An unexpected error occurred';
  
  if (typeof response === 'string') return response;
  
  if (response.message) return response.message;
  
  if (response.error) {
    if (typeof response.error === 'string') return response.error;
    if (response.error.message) return response.error.message;
  }
  
  return 'An unexpected error occurred';
};

// Helper function to check if response indicates success
export const isSuccessResponse = (response) => {
  return response && response.success === true;
};