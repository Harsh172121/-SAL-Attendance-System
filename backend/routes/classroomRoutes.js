/**
 * SAL Education - Classroom Routes
 *
 * Shared classroom listing and admin classroom creation routes.
 */

const express = require('express');
const router = express.Router();
const {
  getAllClassrooms,
  createClassroom
} = require('../controllers/classroomController');
const { protect, adminOrElevated } = require('../middleware');

router.use(protect);

router.route('/')
  .get(getAllClassrooms)
  .post(adminOrElevated, createClassroom);

module.exports = router;
