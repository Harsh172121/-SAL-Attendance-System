/**
 * SAL Education - College Attendance Management System
 * Authentication Context
 * Manages user authentication state across the application
 * Connected to MongoDB backend via REST API
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { ELEVATED_PRIORITIES, canTeacherReviewLeaves } from '../constants/roles';

// Create the authentication context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps the application and provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  // State to hold current user data
  const [user, setUser] = useState(null);
  // State to track loading status during auth check
  const [loading, setLoading] = useState(true);

  /**
   * Effect: Check for existing session on app load
   * Uses /api/auth/me endpoint to verify authentication via httpOnly cookie
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        // Not authenticated, cookie may have expired
        console.debug('Auth check failed, user not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login Function
   * Calls backend API for authentication
   * Token is automatically stored in httpOnly cookie by backend
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} role - Selected role (admin/teacher/student)
   * @returns {boolean} - Success status
   */
  const login = async (email, password, role) => {
    try {
      // Call backend API for login
      const response = await api.post('/auth/login', {
        email,
        password,
        role
      });

      if (response.data.success) {
        // Prefer server-side session state after cookie is set.
        let userData = response.data.data.user;
        let userRole = response.data.data.role || role;

        try {
          const meResponse = await api.get('/auth/me');
          userData = meResponse.data?.data?.user || userData;
          userRole = meResponse.data?.data?.role || userRole;
        } catch (_syncError) {
          console.debug('Auth sync failed, using login response user data');
        }

        userData.role = userRole;
        setUser(userData);

        toast.success(`Welcome back, ${userData.name}!`);
        return true;
      } else {
        toast.error(response.data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return false;
    }
  };

  /**
   * Logout Function
   * Calls backend to clear httpOnly cookie and clears user session
   */
  const logout = async () => {
    try {
      // QA-FIXED: Call logout endpoint to clear httpOnly cookie
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      toast.info('You have been logged out.');
    }
  };

  /**
   * Update Profile Function
   * Updates user profile data via API
   * @param {object} updatedData - New profile data
   */
  const updateProfile = async (updatedData) => {
    try {
      const response = await api.put('/auth/profile', updatedData);

      if (response.data.success) {
        const newUserData = { ...user, ...response.data.user };
        setUser(newUserData);
        // QA-FIXED: No longer storing user in localStorage
        toast.success('Profile updated successfully!');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed.';
      toast.error(message);
      return false;
    }
  };

  /**
   * Check if user has specific role
   * @param {string|array} allowedRoles - Role(s) to check against
   * @returns {boolean}
   */
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  };

  /**
   * Check if teacher has elevated priority (ADMIN/PRINCIPAL/HOD)
   * These teachers get admin-level access to manage resources.
   */
  const isElevated = user?.role === 'teacher' && ELEVATED_PRIORITIES.includes(user?.priority);
  const canReviewLeaves = canTeacherReviewLeaves(user);

  // Context value to be provided to consumers
  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    hasRole,
    isAuthenticated: !!user,
    isElevated,
    canReviewLeaves,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * Provides easy access to auth state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
