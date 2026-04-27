const express = require('express');
const router = express.Router();
const { getStudentTimetable, getTeacherTimetable } = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware');

router.get('/student', protect, authorize('student'), getStudentTimetable);
router.get('/teacher', protect, authorize('teacher'), getTeacherTimetable);

module.exports = router;
