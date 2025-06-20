import { useState, useEffect, useCallback } from 'react';
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUser
} from '../services/userService';
import { useAuthContext } from './useAuth';

// Hook for user profile management
export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, setUser } = useAuthContext();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserProfile();
      setProfile(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch user profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (profileData, onSuccess) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await updateUserProfile(profileData);
      setProfile(updatedProfile);
      
      // Update auth context with new profile data
      if (setUser && user) {
        setUser({ ...user, ...updatedProfile });
      }
      
      // Call the success callback if provided (for immediate UI updates)
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(updatedProfile);
      }
      
      return updatedProfile;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to update profile';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, user]);

  const uploadImage = useCallback(async (imageFile) => {
    try {
      setLoading(true);
      setError(null);
      const result = await uploadProfileImage(imageFile);
      
      // Refresh profile after image upload
      const updatedProfile = await getUserProfile();
      setProfile(updatedProfile);
      
      // Update auth context with new avatar URL
      if (setUser && user && updatedProfile.avatar_url) {
        setUser({ ...user, avatar_url: updatedProfile.avatar_url });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to upload image';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, user]);

  const updatePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await changePassword(passwordData);
      return result;
    } catch (err) {
      // Extract the specific error message from the server response
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.data?.message || 
                           err.response?.data?.error || 
                           err.message || 
                           'Failed to change password';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadImage,
    updatePassword,
    refetch: fetchProfile
  };
};

// Hook for managing all users (admin functionality)
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  };
};

// Hook for managing a specific user
export const useUser = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getUserById(userId);
      setUser(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch user';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser
  };
};

// Hook for user management operations
export const useUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await updateUserById(userId, userData);
      return updatedUser;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to update user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteUser(userId);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to delete user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    updateUser,
    removeUser
  };
};

export default useUserProfile;