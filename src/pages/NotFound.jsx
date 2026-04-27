/**
 * SAL Education - College Attendance Management System
 * 404 Not Found Page
 * Displayed when user navigates to a non-existent route
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components';

const NotFound = () => {
  const { user, isAuthenticated } = useAuth();

  /**
   * Get home path based on auth status and role
   */
  const getHomePath = () => {
    if (!isAuthenticated) return '/login';
    
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-700 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          {/* Big 404 text */}
          <h1 className="text-[150px] font-bold text-white opacity-10 leading-none select-none">
            404
          </h1>
          
          {/* Overlay icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
              <svg
                className="w-12 h-12 text-blue-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error title */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Page Not Found
        </h2>

        {/* Error description */}
        <p className="text-blue-200 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={getHomePath()}>
            <Button variant="primary" className="bg-green-600 hover:bg-green-700">
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-800"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>

        {/* Helpful links */}
        <div className="mt-10 pt-8 border-t border-blue-700">
          <p className="text-blue-300 text-sm mb-4">Perhaps you were looking for:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="text-white hover:text-green-400 transition-colors text-sm"
            >
              Login
            </Link>
            <span className="text-blue-500">•</span>
            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  className="text-white hover:text-green-400 transition-colors text-sm"
                >
                  Profile
                </Link>
                <span className="text-blue-500">•</span>
              </>
            )}
            <a
              href="mailto:support@sal.edu"
              className="text-white hover:text-green-400 transition-colors text-sm"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-blue-300 text-xs">
          SAL Education • College Attendance Management System
        </p>
      </div>
    </div>
  );
};

export default NotFound;
