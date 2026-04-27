/**
 * SAL Education - Admin Attendance Report Routes
 * 
 * Admin-only routes for viewing attendance reports.
 */

const express = require('express');
const router = express.Router();
const {
  getClassReport,
  getSubjectReport,
  getStudentReport
} = require('../controllers/adminAttendanceController');
const { protect, adminOrElevated } = require('../middleware');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOrElevated);

// Class-wise report
router.get('/class/:classId', getClassReport);

// Subject-wise report
router.get('/subject/:subjectId', getSubjectReport);

// Student-wise report
router.get('/student/:studentId', getStudentReport);

module.exports = router;
