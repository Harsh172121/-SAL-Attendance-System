/**
 * SAL Education - Teacher Routes
 * 
 * Admin-only routes for teacher/faculty management.
 */

const express = require('express');
const router = express.Router();
const {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherSubjects,
  resetPassword
} = require('../controllers/teacherController');
const { protect, adminOrElevated } = require('../middleware');

// All routes require authentication and admin (or elevated teacher) role
router.use(protect);
router.use(adminOrElevated);

router.route('/')
  .get(getAllTeachers)
  .post(createTeacher);

router.route('/:id')
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher);

router.get('/:id/subjects', getTeacherSubjects);
router.put('/:id/reset-password', resetPassword);

module.exports = router;
