/**
 * SAL Education - Subject Routes
 * 
 * Admin-only routes for subject management.
 * VIVA NOTE: Subjects are fully dynamic with:
 * - CRUD operations
 * - Type management (theory/lab/theory+lab)
 * - Faculty assignment
 */

const express = require('express');
const router = express.Router();
const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignFaculty,
  getSubjectsByClass
} = require('../controllers/subjectController');
const { protect, adminOrElevated } = require('../middleware');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOrElevated);

router.route('/')
  .get(getAllSubjects)
  .post(createSubject);

router.get('/class/:classId', getSubjectsByClass);

router.route('/:id')
  .get(getSubjectById)
  .put(updateSubject)
  .delete(deleteSubject);

router.put('/:id/assign-faculty', assignFaculty);

module.exports = router;
