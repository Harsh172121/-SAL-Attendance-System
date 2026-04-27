/**
 * SAL Education - Student Routes
 * 
 * Admin-only routes for student management.
 */

const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  assignBatch,
  resetPassword
} = require('../controllers/studentController');
const { protect, adminOrElevated } = require('../middleware');

// All routes require authentication and admin (or elevated teacher) role
router.use(protect);
router.use(adminOrElevated);

router.route('/')
  .get(getAllStudents)
  .post(createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

router.put('/:id/assign-batch', assignBatch);
router.put('/:id/reset-password', resetPassword);

module.exports = router;
