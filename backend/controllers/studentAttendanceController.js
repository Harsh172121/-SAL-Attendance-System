/**
 * SAL Education - Student Attendance Controller
 *
 * Handles attendance viewing for students.
 * VIVA NOTE: Students can only view their own attendance.
 * Shows subject-wise breakdown with theory/lab separation.
 */

const { Op } = require('sequelize');
const { Attendance, Subject, Student, Class, Batch, Teacher } = require('../models');
const { summarizeAttendanceRecords } = require('../utils/attendanceStats');

/**
 * @desc    Get student's own attendance summary
 * @route   GET /api/student/attendance
 * @access  Private/Student
 */
const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student with class info
    const student = await Student.findByPk(studentId, {
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'department', 'semester'] },
        { model: Batch, as: 'batch', attributes: ['id', 'name'] }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get subjects for student's class via junction table
    const subjects = await Subject.findAll({
      where: { isActive: true },
      include: [
        { model: Teacher, as: 'theoryFaculty', attributes: ['name'] },
        { model: Teacher, as: 'labFaculty', attributes: ['name'] },
        {
          model: Class,
          as: 'classes',
          where: { id: student.class.id },
          required: true,
          attributes: ['id', 'name']
        }
      ]
    });

    // Calculate attendance for each subject
    const attendanceData = await Promise.all(subjects.map(async (subject) => {
      // Get theory attendance
      const theoryRecords = await Attendance.findAll({
        where: {
          studentId,
          subjectId: subject.id,
          type: 'theory'
        }
      });
      const theorySummary = summarizeAttendanceRecords(theoryRecords);

      // Get lab attendance (only for student's batch)
      const labRecords = await Attendance.findAll({
        where: {
          studentId,
          subjectId: subject.id,
          type: 'lab'
        }
      });
      const labSummary = summarizeAttendanceRecords(labRecords);
      const overallSummary = summarizeAttendanceRecords([...theoryRecords, ...labRecords]);

      return {
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        subjectType: subject.type,
        theoryFaculty: subject.theoryFaculty?.name || null,
        labFaculty: subject.labFaculty?.name || null,
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

    const allAttendance = await Attendance.findAll({ where: { studentId } });
    const totalStats = summarizeAttendanceRecords(allAttendance);

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student.id,
          enrollmentNo: student.enrollmentNo,
          name: student.name,
          class: student.class,
          batch: student.batch
        },
        subjects: attendanceData,
        overallAttendance: totalStats
      }
    });
  } catch (error) {
    // QA-FIXED: Generic error response
    console.error('[ERROR] Get my attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Get detailed attendance for a specific subject
 * @route   GET /api/student/attendance/:subjectId
 * @access  Private/Student
 */
const getSubjectAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { subjectId } = req.params;
    const { type, month, year } = req.query;

    // Verify subject exists
    const subject = await Subject.findByPk(subjectId, {
      include: [
        { model: Class, as: 'classes', attributes: ['id', 'name'] },
        { model: Teacher, as: 'theoryFaculty', attributes: ['name'] },
        { model: Teacher, as: 'labFaculty', attributes: ['name'] }
      ]
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Verify student belongs to one of the subject's classes
    const student = await Student.findByPk(studentId);
    const subjectClassIds = (subject.classes || []).map(c => c.id);
    if (!subjectClassIds.includes(Number(student.classId))) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this subject'
      });
    }

    // Backward-compat: pick primary class
    const primaryClass = subject.classes?.[0];

    // Build query
    const query = { studentId, subjectId };

    if (type) {
      query.type = type;
    }

    // Date filtering for DATEONLY fields
    if (month && year) {
      // QA-FIXED: Validate month and year query parameters
      const parsedMonth = parseInt(month, 10);
      const parsedYear = parseInt(year, 10);
      if (isNaN(parsedMonth) || isNaN(parsedYear) || parsedMonth < 1 || parsedMonth > 12 || parsedYear < 1900 || parsedYear > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid year or month. Year must be 1900-2100, month 1-12'
        });
      }
      const startDate = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}-01`;
      const endDate = new Date(parsedYear, parsedMonth, 0).toISOString().split('T')[0];
      query.date = { [Op.gte]: startDate, [Op.lte]: endDate };
    } else if (year) {
      // QA-FIXED: Validate year query parameter
      const parsedYear = parseInt(year, 10);
      if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid year. Must be 1900-2100'
        });
      }
      const startDate = `${parsedYear}-01-01`;
      const endDate = `${parsedYear}-12-31`;
      query.date = { [Op.gte]: startDate, [Op.lte]: endDate };
    }

    const attendance = await Attendance.findAll({
      where: query,
      include: [
        { model: Teacher, as: 'teacher', attributes: ['name'] }
      ],
      order: [['date', 'DESC']]
    });

    // Separate theory and lab records
    const theoryRecords = attendance.filter(a => a.type === 'theory');
    const labRecords = attendance.filter(a => a.type === 'lab');
    const theorySummary = summarizeAttendanceRecords(theoryRecords);
    const labSummary = summarizeAttendanceRecords(labRecords);

    res.status(200).json({
      success: true,
      data: {
        subject: {
          id: subject.id,
          code: subject.code,
          name: subject.name,
          type: subject.type,
          class: primaryClass?.name || 'N/A',
          theoryFaculty: subject.theoryFaculty?.name,
          labFaculty: subject.labFaculty?.name
        },
        attendance: {
          theory: {
            records: theoryRecords.map(r => ({
              id: r.id,
              date: r.date,
              status: r.status,
              markedBy: r.teacher?.name
            })),
            present: theorySummary.present,
            leave: theorySummary.leave,
            absent: theorySummary.absent,
            total: theorySummary.total,
            percentage: theorySummary.percentage
          },
          lab: {
            records: labRecords.map(r => ({
              id: r.id,
              date: r.date,
              status: r.status,
              markedBy: r.teacher?.name
            })),
            present: labSummary.present,
            leave: labSummary.leave,
            absent: labSummary.absent,
            total: labSummary.total,
            percentage: labSummary.percentage
          }
        }
      }
    });
  } catch (error) {
    // QA-FIXED: Generic error response
    console.error('[ERROR] Get subject attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Get monthly attendance calendar
 * @route   GET /api/student/attendance/calendar/:year/:month
 * @access  Private/Student
 */
const getAttendanceCalendar = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { year, month } = req.params;

    // QA-FIXED: Validate year and month parameters to prevent invalid date construction
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);

    if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || parsedYear < 1900 || parsedYear > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year or month. Year must be 1900-2100, month 1-12'
      });
    }

    const startDate = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}-01`;
    const endDate = new Date(parsedYear, parsedMonth, 0).toISOString().split('T')[0];

    const attendance = await Attendance.findAll({
      where: {
        studentId,
        date: { [Op.gte]: startDate, [Op.lte]: endDate }
      },
      include: [
        { model: Subject, as: 'subject', attributes: ['code', 'name'] }
      ],
      order: [['date', 'ASC']]
    });

    // Group by date
    const calendar = {};
    attendance.forEach(record => {
      const dateKey = record.date;
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push({
        subject: record.subject?.code,
        type: record.type,
        status: record.status
      });
    });

    res.status(200).json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        calendar
      }
    });
  } catch (error) {
    // QA-FIXED: Generic error response
    console.error('[ERROR] Get attendance calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Get student dashboard stats
 * @route   GET /api/student/dashboard
 * @access  Private/Student
 */
const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findByPk(studentId, {
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'department', 'semester'] },
        { model: Batch, as: 'batch', attributes: ['id', 'name'] }
      ]
    });

    // Get total subjects via junction table
    const subjects = await Subject.findAll({
      where: { isActive: true },
      include: [
        {
          model: Class,
          as: 'classes',
          where: { id: student.class.id },
          required: true
        }
      ]
    });

    // Get all attendance
    const allAttendance = await Attendance.findAll({ where: { studentId } });
    const attendanceSummary = summarizeAttendanceRecords(allAttendance);

    // Get today's attendance (DATEONLY format)
    const today = new Date().toISOString().split('T')[0];

    const todayAttendance = await Attendance.findAll({
      where: {
        studentId,
        date: today
      },
      include: [
        { model: Subject, as: 'subject', attributes: ['code', 'name'] }
      ]
    });

    // Find low attendance subjects (below 75%)
    const lowAttendanceSubjects = [];
    for (const subject of subjects) {
      const subjectAttendance = allAttendance.filter(
        a => a.subjectId === subject.id
      );
      const summary = summarizeAttendanceRecords(subjectAttendance);
      const percentage = summary.consideredTotal > 0 ? summary.percentage : 100;

      if (percentage < 75 && summary.consideredTotal > 0) {
        lowAttendanceSubjects.push({
          code: subject.code,
          name: subject.name,
          percentage
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          enrollmentNo: student.enrollmentNo,
          class: student.class,
          batch: student.batch
        },
        stats: {
          totalSubjects: subjects.length,
          presentClasses: attendanceSummary.present,
          absentClasses: attendanceSummary.absent,
          leaveClasses: attendanceSummary.leave,
          totalClasses: attendanceSummary.total,
          overallPercentage: attendanceSummary.percentage
        },
        todayAttendance: todayAttendance.map(a => ({
          subject: a.subject?.code,
          subjectName: a.subject?.name,
          type: a.type,
          status: a.status
        })),
        lowAttendanceSubjects
      }
    });
  } catch (error) {
    // QA-FIXED: Generic error response
    console.error('[ERROR] Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

module.exports = {
  getMyAttendance,
  getSubjectAttendance,
  getAttendanceCalendar,
  getDashboard
};
