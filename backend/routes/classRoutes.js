/**
 * SAL Education - Class Routes
 * 
 * Admin-only routes for class management.
 */

const express = require('express');
const router = express.Router();
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getStudentsByClass
} = require('../controllers/classController');
const { protect, adminOrElevated } = require('../middleware');

// All routes require authentication and admin (or elevated teacher) role
router.use(protect);
router.use(adminOrElevated);

router.route('/')
  .get(getAllClasses)
  .post(createClass);

router.route('/:id')
  .get(getClassById)
  .put(updateClass)
  .delete(deleteClass);

router.get('/:id/students', getStudentsByClass);

module.exports = router;
