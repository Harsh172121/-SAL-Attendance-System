/**
 * SAL Education - College Attendance Management System
 * Login Page
 * Features SAL logo at top center with blue-green theme
 * Handles authentication for Admin, Teacher, and Student roles
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import SAL Education logo
import salLogo from '../assets/SAL.png';

/**
 * Get the correct dashboard path based on user role and priority
 */
const getDashboardRedirect = (user, isElevated) => {
  if (user.role === 'admin') return '/admin/dashboard';
  if (user.role === 'teacher' && isElevated) return '/admin/dashboard';
  if (user.role === 'teacher') return '/teacher/dashboard';
  if (user.role === 'student') return '/student/dashboard';
  return '/login';
};

const Login = () => {
  // Form state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [isLoading, setIsLoading] = useState(false);

  // Hooks for navigation and auth
  const navigate = useNavigate();
  const { login, isAuthenticated, user, isElevated } = useAuth();

  // Redirect if already logged in - must be in useEffect to avoid render loop
  useEffect(() => {
    // QA-FIXED: Check if user exists before redirecting to prevent infinite loops
    if (isAuthenticated && user && user.id) {
      const timer = setTimeout(() => {
        navigate(getDashboardRedirect(user, isElevated), { replace: true });
      }, 100); // Small delay to ensure state is settled
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, isElevated, navigate]);

  /**
   * Handle form submission
   * Validates credentials and redirects to appropriate dashboard
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Attempt login with provided credentials
      // On success, the useEffect above handles the redirect
      await login(email, password, role);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-700 flex items-center justify-center p-4">
      {/* Login card container */}
      <div className="w-full max-w-md">
        {/* Logo section - centered at top */}
        <div className="text-center mb-8">
          {/* SAL Education Logo */}
          <img
            src={salLogo}
            alt="SAL Education Logo"
            className="w-32 h-32 mx-auto mb-4 rounded-full shadow-lg bg-white p-2 object-contain"
          />
          {/* College name */}
          <h1 className="text-3xl font-bold text-white mb-2">
            SAL Education
          </h1>
          <p className="text-blue-200">
            College Attendance Management System
          </p>
        </div>

        {/* Login form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Login As
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
              >
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* Login Button - Green themed */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">
              Demo Credentials:
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>
                <strong>Admin:</strong> admin@sal.edu / admin123
              </p>
              <p>
                <strong>Teacher:</strong> teacher@sal.edu / teacher123
              </p>
              <p>
                <strong>Student:</strong> student@sal.edu / student123
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200 text-sm mt-6">
          © 2026 SAL Education. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
