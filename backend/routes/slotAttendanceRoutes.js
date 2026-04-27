/* global require, module */
const express = require('express');
const router = express.Router();

const { protect, teacherOnly } = require('../middleware');
const {
  getSlotAttendanceContext,
  saveSlotAttendance
} = require('../controllers/slotAttendanceController');

router.get('/:slotId/context', protect, teacherOnly, getSlotAttendanceContext);
router.post('/:slotId/save', protect, teacherOnly, saveSlotAttendance);

module.exports = router;

