import axios from "axios";

// Create an instance of axios with a custom config
const apiClient = axios.create({
  // Use environment variable for base URL or fallback to /api
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  // Set request timeout to 10 seconds
  timeout: 10000,
  // Set default headers for all requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get authentication token from local storage
    const token = localStorage.getItem("token");
    // Add token to request headers if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle FormData - remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      // Increase timeout for file uploads if not already set
      if (!config.timeout) {
        config.timeout = 60000; // 60 seconds for file uploads
      }
    }
    
    // Add metadata for tracking request duration
    config.metadata = {
      startTime: new Date(),
    };
    return config;
  },
  (error) => {
    // Log any request configuration errors
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  // Success handler
  (response) => {
    // Calculate and log request duration
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`Request took ${duration}ms`);
    return response;
  },
  // Error handler
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token using the auth service endpoint
        const result = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh-token`,
          {},
          {
            headers: {
              'Content-Type': 'application/json'
            },
            withCredentials: true // Include cookies for refresh token
          }
        );

        // Store new access token and retry the original request
        const newToken = result.data?.data?.token || result.data?.token;
        if (newToken) {
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear tokens and redirect to login on refresh failure
        localStorage.removeItem("token");
        console.error('Token refresh failed:', refreshError);
        // Don't redirect automatically, let the app handle it
        return Promise.reject(error);
      }
    }
    
    // Log errors for debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    return Promise.reject(error);
  }
);

export default apiClient;