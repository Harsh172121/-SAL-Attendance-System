/**
 * SAL Education - Controllers Index
 * 
 * Centralized export of all controllers.
 */

const authController = require('./authController');
const classController = require('./classController');
const batchController = require('./batchController');
const studentController = require('./studentController');
const teacherController = require('./teacherController');
const subjectController = require('./subjectController');
const teacherAttendanceController = require('./teacherAttendanceController');
const studentAttendanceController = require('./studentAttendanceController');
const lectureSlotController = require('./lectureSlotController');
const leaveApplicationController = require('./leaveApplicationController');

module.exports = {
  authController,
  classController,
  batchController,
  studentController,
  teacherController,
  subjectController,
  teacherAttendanceController,
  studentAttendanceController,
  lectureSlotController,
  leaveApplicationController
};
