/**
 * SAL Education - College Attendance Management System
 * Unauthorized Page (403)
 * Displayed when user tries to access a page without proper permissions
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components';

const Unauthorized = () => {
  const { user } = useAuth();

  /**
   * Get dashboard path based on user role
   */
  const getDashboardPath = () => {
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 403 Icon */}
        <div className="w-32 h-32 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-16 h-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error code */}
        <h1 className="text-6xl font-bold text-gray-800 mb-2">403</h1>
        
        {/* Error title */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Access Denied
        </h2>

        {/* Error description */}
        <p className="text-gray-600 mb-8">
          Sorry, you don't have permission to access this page. 
          This area is restricted to authorized personnel only.
        </p>

        {/* Info box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Why am I seeing this?
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                You're logged in as <strong className="capitalize">{user?.role}</strong>, 
                but this page requires different permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={getDashboardPath()}>
            <Button variant="primary">
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>

        {/* Contact support */}
        <p className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please contact the{' '}
          <a href="mailto:admin@sal.edu" className="text-blue-600 hover:underline">
            administrator
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
