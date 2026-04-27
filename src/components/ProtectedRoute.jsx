/**
 * SAL Education - College Attendance Management System
 * ProtectedRoute Component
 * Handles route protection based on authentication and user roles
 * Redirects unauthorized users to appropriate pages
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * @param {ReactNode} children - Child components to render if authorized
 * @param {string|array} allowedRoles - Role(s) allowed to access this route
 * @param {boolean} allowElevated - If true, elevated teachers (ADMIN/PRINCIPAL/HOD priority) also get access
 */
const ProtectedRoute = ({ children, allowedRoles, allowElevated = false }) => {
  // Get auth state from context
  const { user, loading, isAuthenticated, isElevated } = useAuth();
  // Get current location for redirect after login
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          {/* Loading spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const hasAccess = roles.includes(user.role) || (allowElevated && isElevated);

    // Redirect to unauthorized page if role doesn't match
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and authorized - render children
  return children;
};

export default ProtectedRoute;
