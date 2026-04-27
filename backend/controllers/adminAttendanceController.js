/**
 * SAL Education - Admin Attendance Report Controller
 * 
 * Handles attendance reports for admin panel.
 * Provides class-wise, subject-wise, and student-wise reports.
 */

const { Op } = require('sequelize');
const { Attendance, Subject, Student, Class, Batch, Teacher } = require('../models');
const { summarizeAttendanceRecords } = require('../utils/attendanceStats');

/**
 * @desc    Get class-wise attendance report (all students in a class)
 * @route   GET /api/admin/reports/class/:classId
 * @access  Private/Admin
 */
const getClassReport = async (req, res) => {
  try {
    const { classId } = req.params;

    const classInfo = await Class.findByPk(classId);
    if (!classInfo) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Get all students in this class
    const students = await Student.findAll({
      where: { classId, isActive: true },
      order: [['enrollmentNo', 'ASC']]
    });

    // Calculate overall attendance for each student across subjects in THIS class only
    const report = await Promise.all(students.map(async (student) => {
      const records = await Attendance.findAll({
        where: { studentId: student.id, classId }
      });

      const summary = summarizeAttendanceRecords(records);

      return {
        studentId: student.id,
        enrollmentNo: student.enrollmentNo,
        studentName: student.name,
        present: summary.present,
        leave: summary.leave,
        absent: summary.absent,
        total: summary.total,
        percentage: summary.percentage
      };
    }));

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('[ERROR] Class report error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

/**
 * @desc    Get subject-wise attendance report (all students for a subject)
 * @route   GET /api/admin/reports/subject/:subjectId
 * @access  Private/Admin
 */
const getSubjectReport = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findByPk(subjectId, {
      include: [{ model: Class, as: 'class' }]
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Get students in this class
    const students = await Student.findAll({
      where: { classId: subject.class.id, isActive: true },
      order: [['enrollmentNo', 'ASC']]
    });

    const report = await Promise.all(students.map(async (student) => {
      // Theory attendance
      const theoryRecords = await Attendance.findAll({
        where: { studentId: student.id, subjectId, type: 'theory' }
      });
      const theorySummary = summarizeAttendanceRecords(theoryRecords);

      // Lab attendance
      const labRecords = await Attendance.findAll({
        where: { studentId: student.id, subjectId, type: 'lab' }
      });
      const labSummary = summarizeAttendanceRecords(labRecords);

      return {
        studentId: student.id,
        enrollmentNo: student.enrollmentNo,
        studentName: student.name,
        theory: {
          present: theorySummary.present,
          leave: theorySummary.leave,
          absent: theorySummary.absent,
          total: theorySummary.total,
          percentage: theorySummary.percentage
        },
        lab: {
          present: labSummary.present,
          leave: labSummary.leave,
          absent: labSummary.absent,
          total: labSummary.total,
          percentage: labSummary.percentage
        }
      };
    }));

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('[ERROR] Subject report error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

/**
 * @desc    Get student-wise attendance report (all subjects for a student)
 * @route   GET /api/admin/reports/student/:studentId
 * @access  Private/Admin
 */
const getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId, {
      include: [{ model: Class, as: 'class' }]
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get all subjects for the student's class
    const subjects = await Subject.findAll({
      where: { classId: student.class.id, isActive: true }
    });

    const report = await Promise.all(subjects.map(async (subject) => {
      const theoryRecords = await Attendance.findAll({
        where: { studentId, subjectId: subject.id, type: 'theory' }
      });
      const theorySummary = summarizeAttendanceRecords(theoryRecords);

      const labRecords = await Attendance.findAll({
        where: { studentId, subjectId: subject.id, type: 'lab' }
      });
      const labSummary = summarizeAttendanceRecords(labRecords);
      const overallSummary = summarizeAttendanceRecords([...theoryRecords, ...labRecords]);

      return {
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        subjectType: subject.type,
        theory: {
          present: theorySummary.present,
          leave: theorySummary.leave,
          absent: theorySummary.absent,
          total: theorySummary.total,
          percentage: theorySummary.percentage
        },
        lab: {
          present: labSummary.present,
          leave: labSummary.leave,
          absent: labSummary.absent,
          total: labSummary.total,
          percentage: labSummary.percentage
        },
        overall: {
          present: overallSummary.present,
          leave: overallSummary.leave,
          absent: overallSummary.absent,
          total: overallSummary.total,
          percentage: overallSummary.percentage
        }
      };
    }));

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('[ERROR] Student report error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

module.exports = {
  getClassReport,
  getSubjectReport,
  getStudentReport
};
