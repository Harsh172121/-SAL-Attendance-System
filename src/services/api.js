/**
 * SAL Education - College Attendance Management System
 * Axios API Configuration
 * This file sets up axios with base URL and interceptors for API calls
 * Backend will be integrated later - this provides the structure
 */

import axios from 'axios';
import { toast } from 'react-toastify';

// Keep frontend and backend on the same hostname (localhost/127.0.0.1)
// so auth cookies are treated as same-site in development.
const API_HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

// Create axios instance with default config
// TODO: Update baseURL when backend is ready
const api = axios.create({
  baseURL: `http://${API_HOST}:5000/api`, // Backend API URL
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Required for httpOnly auth cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * QA-FIXED: Token now in httpOnly cookie, no need to add Authorization header
 */
api.interceptors.request.use(
  (config) => {
    // Token is automatically sent with cookies (httpOnly)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common response scenarios like auth errors
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const requestUrl = error.config?.url || '';
      const isAuthCheckRequest = requestUrl.includes('/auth/me');
      const isLoginRequest = requestUrl.includes('/auth/login');
      const isOnLoginPage = window.location.pathname === '/login';

      switch (error.response.status) {
        case 401:
          // Avoid reload loops and duplicate errors on login/auth-check endpoints.
          if (isLoginRequest || isAuthCheckRequest) {
            break;
          }

          // Unauthorized - cookie expired, redirect to login once.
          toast.error('Session expired. Please login again.');
          if (!isOnLoginPage) {
            window.location.replace('/login');
          }
          break;
        case 403:
          // Forbidden - user doesn't have permission
          toast.error(error.response.data?.message || 'You do not have permission to perform this action.');
          break;
        case 404:
          // Not found
          toast.error('Resource not found.');
          break;
        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(error.response.data?.message || 'An error occurred.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;

/**
 * API Endpoints Structure (for future backend integration)
 * 
 * AUTH:
 * - POST /api/auth/login - User login
 * - POST /api/auth/logout - User logout
 * - GET /api/auth/profile - Get user profile
 * 
 * ADMIN:
 * - GET /api/admin/students - Get all students
 * - POST /api/admin/students - Add new student
 * - PUT /api/admin/students/:id - Update student
 * - DELETE /api/admin/students/:id - Delete student
 * - GET /api/admin/teachers - Get all teachers
 * - POST /api/admin/teachers - Add new teacher
 * - PUT /api/admin/teachers/:id - Update teacher
 * - DELETE /api/admin/teachers/:id - Delete teacher
 * - GET /api/admin/subjects - Get all subjects
 * - POST /api/admin/subjects - Add new subject
 * - PUT /api/admin/subjects/:id - Update subject
 * - DELETE /api/admin/subjects/:id - Delete subject
 * - GET /api/admin/reports - Get attendance reports
 * 
 * TEACHER:
 * - GET /api/teacher/subjects - Get assigned subjects
 * - POST /api/teacher/attendance - Mark attendance
 * - GET /api/teacher/attendance - View attendance records
 * 
 * STUDENT:
 * - GET /api/student/attendance - View own attendance
 */
