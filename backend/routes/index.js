/**
 * SAL Education - Routes Index
 * 
 * Centralized export of all routes.
 */

const authRoutes = require('./authRoutes');
const classRoutes = require('./classRoutes');
const batchRoutes = require('./batchRoutes');
const studentRoutes = require('./studentRoutes');
const teacherRoutes = require('./teacherRoutes');
const subjectRoutes = require('./subjectRoutes');
const classroomRoutes = require('./classroomRoutes');
const teacherAttendanceRoutes = require('./teacherAttendanceRoutes');
const studentAttendanceRoutes = require('./studentAttendanceRoutes');
const lectureSlotRoutes = require('./lectureSlotRoutes');
const leaveApplicationRoutes = require('./leaveApplicationRoutes');
const proxyRoutes = require('./proxyRoutes');

module.exports = {
  authRoutes,
  classRoutes,
  batchRoutes,
  studentRoutes,
  teacherRoutes,
  subjectRoutes,
  classroomRoutes,
  teacherAttendanceRoutes,
  studentAttendanceRoutes,
  lectureSlotRoutes,
  leaveApplicationRoutes,
  proxyRoutes
};
