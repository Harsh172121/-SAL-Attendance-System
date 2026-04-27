/**
 * SAL Education - Authentication Middleware
 * 
 * This middleware verifies JWT tokens and protects routes.
 * VIVA NOTE: JWT (JSON Web Token) is used for stateless authentication.
 * The token contains encoded user information and is verified on each request.
 */

const jwt = require('jsonwebtoken');
const { Admin, Teacher, Student } = require('../models');

/**
 * Protect routes - Verify JWT token
 * This middleware must be applied to all protected routes
 */
const protect = async (req, res, next) => {
  let token;

  // QA-FIXED: JWT moved to httpOnly cookie - read from req.cookies instead of Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user based on role
    let user;
    
    switch (decoded.role) {
      case 'admin':
        user = await Admin.findByPk(decoded.id);
        break;
      case 'teacher':
        user = await Teacher.findByPk(decoded.id);
        break;
      case 'student':
        user = await Student.findByPk(decoded.id);
        break;
      default:
        return res.status(401).json({
          success: false,
          message: 'Invalid token - unknown role'
        });
    }
    
    // Check if user exists and is active
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Contact administrator.'
      });
    }
    
    // Attach user to request object
    req.user = user;
    req.user.role = decoded.role;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @param {string} role - User role (admin/teacher/student)
 * @returns {string} - JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = { protect, generateToken };
