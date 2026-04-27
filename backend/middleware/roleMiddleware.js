/**
 * SAL Education - Role Authorization Middleware
 * 
 * This middleware restricts access based on user roles.
 * VIVA NOTE: Role-based access control (RBAC) ensures users
 * can only access resources permitted for their role.
 */

const {
  ELEVATED_PRIORITIES,
  LEAVE_REVIEW_PRIORITIES
} = require('../constants/roles');

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

/**
 * Authorize specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} - Middleware function
 * 
 * Usage: authorize('admin', 'teacher')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
        requiredRoles: roles
      });
    }
    
    next();
  };
};

/**
 * Admin only middleware
 * Shorthand for authorize('admin')
 */
const adminOnly = (req, res, next) => {
  if (!req.user || normalizeRole(req.user.role) !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

/**
 * Teacher only middleware
 * Shorthand for authorize('teacher')
 */
const teacherOnly = (req, res, next) => {
  if (!req.user || normalizeRole(req.user.role) !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Teacher privileges required.'
    });
  }
  next();
};

/**
 * Student only middleware
 * Shorthand for authorize('student')
 */
const studentOnly = (req, res, next) => {
  if (!req.user || normalizeRole(req.user.role) !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student privileges required.'
    });
  }
  next();
};

/**
 * Admin or Elevated Teacher middleware
 * Grants access to: admins AND teachers with ADMIN/PRINCIPAL/HOD priority.
 * FACULTY and CLASS_COORDINATOR teachers are NOT granted access.
 */
const adminOrElevated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userRole = normalizeRole(req.user.role);
  const isAdmin = userRole === 'admin';
  const isElevatedTeacher =
    userRole === 'teacher' &&
    ELEVATED_PRIORITIES.includes(req.user.priority);

  if (isAdmin || isElevatedTeacher) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin or elevated faculty privileges required.'
  });
};

/**
 * HOD-only middleware.
 * Restricts access to teacher accounts with HOD priority.
 */
const hodOnly = (req, res, next) => {
  if (!req.user || normalizeRole(req.user.role) !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Teacher privileges required.'
    });
  }

  if (req.user.priority !== 'HOD') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. HOD privileges required.'
    });
  }

  next();
};

/**
 * Teacher leave reviewer middleware
 * Grants access only to teacher priorities that can review leave requests.
 */
const teacherLeaveReviewerOnly = (req, res, next) => {
  if (!req.user || normalizeRole(req.user.role) !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Teacher privileges required.'
    });
  }

  if (!LEAVE_REVIEW_PRIORITIES.includes(req.user.priority)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only HOD, class coordinators, principals, and teacher-admins can review leave requests.'
    });
  }

  next();
};

module.exports = {
  authorize,
  adminOnly,
  teacherOnly,
  hodOnly,
  studentOnly,
  adminOrElevated,
  teacherLeaveReviewerOnly
};
