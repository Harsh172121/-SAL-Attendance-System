/**
 * SAL Education - Teacher Attendance Routes
 * 
 * Teacher-only routes for attendance management.
 * VIVA NOTE: Teachers can:
 * - View assigned subjects
 * - Mark attendance (theory/lab)
 * - View/update attendance records
 */

const express = require('express');
const router = express.Router();
const {
  getMySubjects,
  getStudentsForAttendance,
  markAttendance,
  getAttendance,
  getBatchesForSubject,
  getAttendanceReport
} = require('../controllers/teacherAttendanceController');
const { protect, teacherOnly } = require('../middleware');

// All routes require authentication and teacher role
router.use(protect);
router.use(teacherOnly);

// Get teacher's assigned subjects
router.get('/my-subjects', getMySubjects);

// Get students for marking attendance
router.get('/students/:subjectId', getStudentsForAttendance);

// Get batches for a subject
router.get('/batches/:subjectId', getBatchesForSubject);

// Mark attendance
router.post('/attendance', markAttendance);

// Get attendance records
router.get('/attendance/:subjectId', getAttendance);

// Get attendance report
router.get('/reports/:subjectId', getAttendanceReport);

module.exports = router;
