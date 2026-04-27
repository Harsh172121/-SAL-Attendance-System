/**
 * SAL Education - Authentication Controller
 * 
 * Handles user authentication for all roles.
 * VIVA NOTE: This controller provides a unified login endpoint
 * that works for Admin, Teacher, and Student users.
 */

const { Admin, Teacher, Student } = require('../models');
const { generateToken } = require('../middleware/authMiddleware');

/**
 * @desc    Login user (Admin/Teacher/Student)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : undefined;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    let user;
    let userRole = normalizedRole;
    
    // If role is provided, search in specific table
    // Otherwise, search in all tables
    if (normalizedRole) {
      switch (normalizedRole) {
        case 'admin':
          user = await Admin.scope('withPassword').findOne({ where: { email } });
          break;
        case 'teacher':
          user = await Teacher.scope('withPassword').findOne({ where: { email } });
          break;
        case 'student':
          user = await Student.scope('withPassword').findOne({ where: { email } });
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid role specified'
          });
      }
    } else {
      // Search in all tables
      user = await Admin.scope('withPassword').findOne({ where: { email } });
      if (user) {
        userRole = 'admin';
      } else {
        user = await Teacher.scope('withPassword').findOne({ where: { email } });
        if (user) {
          userRole = 'teacher';
        } else {
          user = await Student.scope('withPassword').findOne({ where: { email } });
          if (user) {
            userRole = 'student';
          }
        }
      }
    }
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Contact administrator.'
      });
    }
    
    // Verify password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = generateToken(user.id, userRole);

    // QA-FIXED: JWT moved to httpOnly cookie instead of JSON response
    // Set secure httpOnly cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Prepare user data (exclude password)
    const userData = user.toJSON();
    delete userData.password;

    // QA-FIXED: Include user data in response for faster UI update (auth state)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        role: userRole
      }
    });

  } catch (error) {
    // QA-FIXED: Generic error response - don't expose error details to client
    console.error('[ERROR] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // QA-FIXED: Clear httpOnly cookie on logout
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    // QA-FIXED: Generic error response
    console.error('[ERROR] Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      success: true,
      data: {
        user,
        role: user.role
      }
    });
  } catch (error) {
    // QA-FIXED: Generic error response
    console.error('[ERROR] Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { role } = req.user;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }
    
    // Get user with password
    let user;
    switch (role) {
      case 'admin':
        user = await Admin.scope('withPassword').findByPk(req.user.id);
        break;
      case 'teacher':
        user = await Teacher.scope('withPassword').findByPk(req.user.id);
        break;
      case 'student':
        user = await Student.scope('withPassword').findByPk(req.user.id);
        break;
    }
    
    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    // QA-FIXED: Generic error response
    console.error('[ERROR] Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

module.exports = {
  login,
  logout,
  getMe,
  changePassword
};
