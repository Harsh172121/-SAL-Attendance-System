/**
 * SAL Education - Student Attendance Routes
 * 
 * Student-only routes for viewing attendance.
 * VIVA NOTE: Students can only view their own attendance.
 */

const express = require('express');
const router = express.Router();
const {
  getMyAttendance,
  getSubjectAttendance,
  getAttendanceCalendar,
  getDashboard
} = require('../controllers/studentAttendanceController');
const { protect, studentOnly } = require('../middleware');

// All routes require authentication and student role
router.use(protect);
router.use(studentOnly);

// Student dashboard
router.get('/dashboard', getDashboard);

// Get overall attendance summary
router.get('/attendance', getMyAttendance);

// Get attendance calendar
router.get('/attendance/calendar/:year/:month', getAttendanceCalendar);

// Get detailed attendance for a subject
router.get('/attendance/:subjectId', getSubjectAttendance);

module.exports = router;
