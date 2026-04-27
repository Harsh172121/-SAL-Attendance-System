/**
 * SAL Education - Models Index
 * 
 * Centralized export of all models for easy importing.
 * VIVA NOTE: This pattern improves code organization and maintainability.
 * Also sets up Sequelize associations between models.
 */

const { sequelize } = require('../config/db');
const Admin = require('./Admin');
const Teacher = require('./Teacher');
const Student = require('./Student');
const Class = require('./Class');
const Batch = require('./Batch');
const Subject = require('./Subject');
const Classroom = require('./Classroom');
const Attendance = require('./Attendance');
const LectureSlot = require('./LectureSlot');
const LeaveApplication = require('./LeaveApplication');
const ProxyRequest = require('./ProxyRequest');
const ProxyAssignment = require('./ProxyAssignment');
const LectureLog = require('./LectureLog');

// ============================================
// ASSOCIATIONS
// ============================================

// Class has many Batches
Class.hasMany(Batch, { foreignKey: 'classId', as: 'batches' });
Batch.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

// Class has many Students
Class.hasMany(Student, { foreignKey: 'classId', as: 'students' });
Student.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

// Class coordinator association
Class.belongsTo(Teacher, { foreignKey: 'classCoordinatorId', as: 'classCoordinator' });
Teacher.hasMany(Class, { foreignKey: 'classCoordinatorId', as: 'coordinatedClasses' });

// Batch has many Students
Batch.hasMany(Student, { foreignKey: 'batchId', as: 'students' });
Student.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

// Subject <-> Class many-to-many via subject_classes
Subject.belongsToMany(Class, {
  through: 'SubjectClasses',
  foreignKey: 'subjectId',
  otherKey: 'classId',
  as: 'classes'
});
Class.belongsToMany(Subject, {
  through: 'SubjectClasses',
  foreignKey: 'classId',
  otherKey: 'subjectId',
  as: 'subjects'
});

// Teacher has many Subjects (theory)
Teacher.hasMany(Subject, { foreignKey: 'theoryFacultyId', as: 'theorySubjects' });
Subject.belongsTo(Teacher, { foreignKey: 'theoryFacultyId', as: 'theoryFaculty' });

// Teacher has many Subjects (lab)
Teacher.hasMany(Subject, { foreignKey: 'labFacultyId', as: 'labSubjects' });
Subject.belongsTo(Teacher, { foreignKey: 'labFacultyId', as: 'labFaculty' });

// Attendance associations
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Attendance.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Attendance.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });
Attendance.belongsTo(Teacher, { foreignKey: 'markedBy', as: 'teacher' });

Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendances' });
Subject.hasMany(Attendance, { foreignKey: 'subjectId', as: 'attendances' });
Class.hasMany(Attendance, { foreignKey: 'classId', as: 'attendances' });
Batch.hasMany(Attendance, { foreignKey: 'batchId', as: 'attendances' });
Teacher.hasMany(Attendance, { foreignKey: 'markedBy', as: 'markedAttendances' });

// LectureSlot associations
LectureSlot.belongsTo(Teacher, { foreignKey: 'facultyId', as: 'faculty' });
LectureSlot.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
LectureSlot.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
LectureSlot.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });
LectureSlot.belongsTo(Classroom, { foreignKey: 'classroomId', as: 'classroom' });
Teacher.hasMany(LectureSlot, { foreignKey: 'facultyId', as: 'lectureSlots' });
Classroom.hasMany(LectureSlot, { foreignKey: 'classroomId', as: 'lectureSlots' });

// Attendance -> LectureSlot association
Attendance.belongsTo(LectureSlot, { foreignKey: 'slotId', as: 'lectureSlot' });
LectureSlot.hasMany(Attendance, { foreignKey: 'slotId', as: 'attendances' });

// Proxy request and assignment associations
ProxyRequest.belongsTo(LectureSlot, { foreignKey: 'slotId', as: 'slot' });
ProxyRequest.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
ProxyRequest.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
ProxyRequest.belongsTo(Teacher, { foreignKey: 'originalFacultyId', as: 'originalFaculty' });
ProxyRequest.belongsTo(Teacher, { foreignKey: 'proxyFacultyId', as: 'proxyFaculty' });
ProxyRequest.belongsTo(Teacher, { foreignKey: 'hodId', as: 'hod' });

LectureSlot.hasMany(ProxyRequest, { foreignKey: 'slotId', as: 'proxyRequests' });
Teacher.hasMany(ProxyRequest, { foreignKey: 'originalFacultyId', as: 'sentProxyRequests' });
Teacher.hasMany(ProxyRequest, { foreignKey: 'proxyFacultyId', as: 'receivedProxyRequests' });
Teacher.hasMany(ProxyRequest, { foreignKey: 'hodId', as: 'hodProxyRequests' });

ProxyAssignment.belongsTo(LectureSlot, { foreignKey: 'slotId', as: 'slot' });
ProxyAssignment.belongsTo(Teacher, { foreignKey: 'originalFacultyId', as: 'originalFaculty' });
ProxyAssignment.belongsTo(Teacher, { foreignKey: 'proxyFacultyId', as: 'proxyFaculty' });

LectureSlot.hasMany(ProxyAssignment, { foreignKey: 'slotId', as: 'proxyAssignments' });
Teacher.hasMany(ProxyAssignment, { foreignKey: 'proxyFacultyId', as: 'assignedProxyLectures' });
Teacher.hasMany(ProxyAssignment, { foreignKey: 'originalFacultyId', as: 'delegatedProxyLectures' });

// LectureLog associations
LectureLog.belongsTo(LectureSlot, { foreignKey: 'slotId', as: 'slot' });
LectureLog.belongsTo(Teacher, { foreignKey: 'markedBy', as: 'teacher' });
LectureSlot.hasMany(LectureLog, { foreignKey: 'slotId', as: 'logs' });

// LeaveApplication associations
LeaveApplication.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
LeaveApplication.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
LeaveApplication.belongsTo(Teacher, { foreignKey: 'approvedBy', as: 'approver' });
LeaveApplication.belongsTo(Teacher, { foreignKey: 'coordinatorId', as: 'coordinator' });
LeaveApplication.belongsTo(Teacher, { foreignKey: 'hodId', as: 'hod' });
Student.hasMany(LeaveApplication, { foreignKey: 'studentId', as: 'leaveApplications' });
Class.hasMany(LeaveApplication, { foreignKey: 'classId', as: 'leaveApplications' });
Teacher.hasMany(LeaveApplication, { foreignKey: 'approvedBy', as: 'approvedLeaves' });
Teacher.hasMany(LeaveApplication, { foreignKey: 'coordinatorId', as: 'coordinatorLeaveRequests' });
Teacher.hasMany(LeaveApplication, { foreignKey: 'hodId', as: 'hodLeaveRequests' });

module.exports = {
  sequelize,
  Admin,
  Teacher,
  Student,
  Class,
  Batch,
  Subject,
  Classroom,
  Attendance,
  LectureSlot,
  LeaveApplication,
  ProxyRequest,
  ProxyAssignment,
  LectureLog
};
