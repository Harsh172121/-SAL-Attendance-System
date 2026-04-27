/**
 * SAL Education - College Attendance Management System
 * Navbar Component
 * Blue-themed navigation bar with user info and logout button
 * Responsive design for mobile and desktop
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  // Get user data and logout function from auth context
  const { user, logout, isElevated } = useAuth();
  const navigate = useNavigate();
  
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Handle logout action
   * Clears session and redirects to login page
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Get dashboard path based on user role
   * @returns {string} - Path to user's dashboard
   */
  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'teacher' && isElevated) return '/admin/dashboard';
    if (user?.role === 'teacher') return '/teacher/dashboard';
    if (user?.role === 'student') return '/student/dashboard';
    return '/login';
  };

  /**
   * Get display label for user role (shows priority for teachers)
   */
  const getRoleLabel = () => {
    if (user?.role === 'teacher' && user?.priority) {
      return user.priority.replace('_', ' ');
    }
    return user?.role;
  };

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      {/* Main navbar container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and brand name */}
          <div className="flex items-center">
            <Link to={getDashboardPath()} className="flex items-center space-x-2">
              {/* SAL Logo placeholder - small version for navbar */}
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-800 font-bold text-sm">SAL</span>
              </div>
              <span className="font-bold text-xl hidden sm:block">
                SAL Education
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Dashboard link */}
            <Link
              to={getDashboardPath()}
              className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </Link>

            {/* Profile link */}
            <Link
              to="/profile"
              className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Profile
            </Link>

            {/* User info display */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-blue-900 rounded-lg">
              {/* User avatar */}
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-blue-300 text-xs capitalize">{getRoleLabel()}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors font-medium"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {/* Hamburger icon */}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-900">
          <div className="px-4 py-3 space-y-2">
            {/* User info for mobile */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-blue-800 rounded-lg mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-blue-300 text-sm capitalize">{user?.role}</p>
              </div>
            </div>

            {/* Mobile nav links */}
            <Link
              to={getDashboardPath()}
              className="block px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
