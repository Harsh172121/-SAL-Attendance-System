/**
 * SAL Education - Authentication Routes
 *
 * Routes for user authentication.
 */

const express = require('express');
const router = express.Router();
const { login, logout, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware');

// Public routes
router.post('/login', login);
// QA-FIXED: logout endpoint clears httpOnly cookie
router.post('/logout', protect, logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
