import apiClient from './apiClient.js';

// Profile routes (authenticated users)
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post('/users/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // 30 seconds for image uploads
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.put('/users/change-password', passwordData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Admin routes
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/users/');
    return response.data?.data?.users || response.data?.data || [];
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/admin/users/${userId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

export const updateUserById = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

// Delete user (Admin only)
export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/users/${userId}`);
  return response.data;
};

// Get user statistics (Admin only)
export const getUserStats = async () => {
  try {
    const response = await apiClient.get('/users/stats');
    const data = response.data?.data || response.data;
    
    // Transform snake_case to camelCase for frontend consistency
    // Convert string values to integers
    return {
      totalUsers: parseInt(data.total_users) || 0,
      students: parseInt(data.students) || 0,
      instructors: parseInt(data.instructors) || 0,
      admins: parseInt(data.admins) || 0,
      activeUsers: parseInt(data.active_users) || 0,
      recentLogins: parseInt(data.recent_logins) || 0
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

// Get user trend data (Admin only)
export const getUserTrend = async () => {
  try {
    const response = await apiClient.get('/users/trend');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching user trend:', error);
    throw error;
  }
};
// Create user by admin
export const createUserByAdmin = async (userData) => {
  try {
    // Convert role to lowercase before sending to backend
    const processedData = {
      ...userData,
      role: userData.role ? userData.role.toLowerCase() : 'student'
    };
    
    const response = await apiClient.post('/users/', processedData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
// Toggle user status
export const toggleUserStatus = async (userId) => {
  try {
    const response = await apiClient.patch(`/users/${userId}/toggle-status`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error toggling user status ${userId}:`, error);
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUser,
  getUserStats,
  createUserByAdmin,
  toggleUserStatus
};