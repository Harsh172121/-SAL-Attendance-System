/* global require, module */
/**
 * SAL Education - Teacher Attendance Controller
 *
 * Handles attendance marking and viewing for teachers.
 * VIVA NOTE: Critical attendance logic:
 * - Theory: Class-based attendance
 * - Lab: Batch-based attendance (batchId mandatory)
 * - Prevents duplicate entries
 * - Can update same-day attendance
 */

const { Op, fn, col, literal } = require('sequelize');
const { Attendance, Subject, Student, Class, Batch } = require('../models');
const {
  buildTeacherSubjectWhere,
  getTeachingTypeForTeacher,
  isTeacherAssigned
} = require('../utils/subjectFaculty');

const supportsAttendanceType = (subject, type) => {
  if (type === 'theory') {
    return subject.type === 'theory' || subject.type === 'theory+lab';
  }

  return subject.type === 'lab' || subject.type === 'theory+lab';
};

// Backward-compat helper
const enrichSubjectJson = (subjectJson) => {
  const classes = subjectJson.classes || [];
  subjectJson.classIds = classes.map(c => c.id);
  subjectJson.class = classes[0] || null;
  subjectJson.classId = subjectJson.class?.id || null;
  return subjectJson;
};

/**
 * @desc    Get teacher's assigned subjects
 * @route   GET /api/teacher/my-subjects
 * @access  Private/Teacher
 */
const getMySubjects = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get subjects where teacher is assigned
    const subjects = await Subject.findAll({
      where: {
        [Op.and]: [
          buildTeacherSubjectWhere(teacherId),
          { isActive: true }
        ]
      },
      include: [{ model: Class, as: 'classes', attributes: ['id', 'name', 'department', 'semester'] }],
      order: [['code', 'ASC']]
    });

    // Add teaching type info for each subject
    const subjectsWithType = subjects.map(subject => {
      const teachingType = getTeachingTypeForTeacher(subject, teacherId);
      const json = enrichSubjectJson(subject.toJSON());
      json.teachingType = teachingType;
      return json;
    });

    res.status(200).json({
      success: true,
      count: subjectsWithType.length,
      data: subjectsWithType
    });
  } catch (error) {
    console.error('Get my subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
};

/**
 * @desc    Get students for attendance marking
 * @route   GET /api/teacher/students/:subjectId
 * @access  Private/Teacher
 * @query   type (theory/lab), batchId (for lab)
 */
const getStudentsForAttendance = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { type, batchId } = req.query;
    const teacherId = req.user.id;

    // Validate type
    if (!type || !['theory', 'lab'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Please specify attendance type: theory or lab'
      });
    }

    // Verify subject exists and teacher is assigned
    const subject = await Subject.findByPk(subjectId, {
      include: [{ model: Class, as: 'classes', attributes: ['id', 'name'] }]
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Verify teacher authorization
    const isAuthorized = isTeacherAssigned(subject, type, teacherId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized to mark ${type} attendance for this subject`
      });
    }

    // Use first associated class for student query
    const primaryClass = subject.classes?.[0];
    if (!primaryClass) {
      return res.status(400).json({
        success: false,
        message: 'Subject has no associated classes'
      });
    }

    // Build student query
    const studentQuery = { classId: primaryClass.id, isActive: true };

    // For lab, batch is required
    if (type === 'lab') {
      if (!batchId) {
        return res.status(400).json({
          success: false,
          message: 'Batch ID is required for lab attendance'
        });
      }
      studentQuery.batchId = batchId;
    }

    const students = await Student.findAll({
      where: studentQuery,
      include: [{ model: Batch, as: 'batch', attributes: ['id', 'name'] }],
      order: [['enrollmentNo', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: students.length,
      data: {
        subject: {
          id: subject.id,
          code: subject.code,
          name: subject.name,
          type: subject.type,
          class: primaryClass
        },
        students
      }
    });
  } catch (error) {
    console.error('Get students for attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

/**
 * @desc    Mark attendance for students
 * @route   POST /api/teacher/attendance
 * @access  Private/Teacher
 *
 * VIVA NOTE: This is the core attendance marking function.
 * Handles both new entries and updates for same day.
 */
const markAttendance = async (req, res) => {
  try {
    const { subjectId, date, type, batchId, slotId, attendanceData } = req.body;
    const teacherId = req.user.id;

    // Validate required fields
    if (!subjectId || !date || !type || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subjectId, date, type, and attendanceData array'
      });
    }

    // Validate type
    if (!['theory', 'lab'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance type. Must be theory or lab'
      });
    }

    // Verify subject and authorization
    const subject = await Subject.findByPk(subjectId, {
      include: [{ model: Class, as: 'classes', attributes: ['id'] }]
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if subject supports this type
    if (!supportsAttendanceType(subject, type)) {
      return res.status(400).json({
        success: false,
        message: type === 'theory' ? 'This subject is lab-only' : 'This subject is theory-only'
      });
    }

    // Verify teacher authorization
    const isAuthorized = isTeacherAssigned(subject, type, teacherId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized to mark ${type} attendance for this subject`
      });
    }

    // Use first associated class
    const primaryClass = subject.classes?.[0];
    if (!primaryClass) {
      return res.status(400).json({
        success: false,
        message: 'Subject has no associated classes'
      });
    }

    // For lab, batch is required and must belong to the subject class
    if (type === 'lab' && !batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required for lab attendance'
      });
    }

    let validatedBatchId = null;
    if (type === 'lab') {
      const batch = await Batch.findOne({
        where: {
          id: batchId,
          classId: primaryClass.id,
          isActive: true
        }
      });

      if (!batch) {
        return res.status(400).json({
          success: false,
          message: 'Selected batch does not belong to this subject class'
        });
      }

      validatedBatchId = batch.id;
    }

    // Normalize date to DATEONLY format (YYYY-MM-DD)
    const attendanceDate = new Date(date).toISOString().split('T')[0];

    const results = {
      created: 0,
      updated: 0,
      failed: []
    };

    // Process each attendance record
    for (const record of attendanceData) {
      try {
        const { studentId, status } = record;

        if (!studentId || !status) {
          results.failed.push({ studentId, reason: 'Missing studentId or status' });
          continue;
        }

        if (!['present', 'absent', 'leave'].includes(status)) {
          results.failed.push({ studentId, reason: 'Invalid status' });
          continue;
        }

        // Get student to verify class/batch ownership
        const student = await Student.findByPk(studentId);
        if (!student) {
          results.failed.push({ studentId, reason: 'Student not found' });
          continue;
        }

        if (!student.isActive) {
          results.failed.push({ studentId, reason: 'Student is inactive' });
          continue;
        }

        if (Number(student.classId) !== Number(primaryClass.id)) {
          results.failed.push({
            studentId,
            reason: 'Student does not belong to this subject class'
          });
          continue;
        }

        if (type === 'lab' && Number(student.batchId) !== Number(validatedBatchId)) {
          results.failed.push({
            studentId,
            reason: 'Student does not belong to the selected lab batch'
          });
          continue;
        }

        // Check for existing record
        const whereClause = {
          studentId,
          subjectId,
          date: attendanceDate,
          type
        };
        if (type === 'lab') {
          whereClause.batchId = validatedBatchId;
        }

        const existingRecord = await Attendance.findOne({ where: whereClause });

        if (existingRecord) {
          // Update existing record
          existingRecord.status = status;
          existingRecord.markedBy = teacherId;
          await existingRecord.save();
          results.updated++;
        } else {
          // Create new record
          await Attendance.create({
            studentId,
            subjectId,
            classId: primaryClass.id,
            batchId: type === 'lab' ? validatedBatchId : null,
            date: attendanceDate,
            type,
            status,
            slotId: slotId || null,
            markedBy: teacherId
          });
          results.created++;
        }
      } catch (err) {
        results.failed.push({ studentId: record.studentId, reason: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: results
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
};

/**
 * @desc    Get attendance records for a subject
 * @route   GET /api/teacher/attendance/:subjectId
 * @access  Private/Teacher
 * @query   date, type, batchId
 */
const getAttendance = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { date, type, batchId, startDate, endDate } = req.query;
    const teacherId = req.user.id;

    // Verify subject and authorization
    const subject = await Subject.findByPk(subjectId, {
      include: [{ model: Class, as: 'classes', attributes: ['id', 'name'] }]
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const teachingType = getTeachingTypeForTeacher(subject, teacherId);
    if (!teachingType) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view attendance for this subject'
      });
    }

    if (type && !isTeacherAssigned(subject, type, teacherId)) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized to view ${type} attendance for this subject`
      });
    }

    // Build query
    const query = { subjectId };

    if (type) {
      query.type = type;
    } else if (teachingType !== 'both') {
      query.type = teachingType;
    }

    if (batchId) {
      query.batchId = batchId;
    }

    // Date filtering
    if (date) {
      // For DATEONLY, just use the date string
      query.date = new Date(date).toISOString().split('T')[0];
    } else if (startDate && endDate) {
      const start = new Date(startDate).toISOString().split('T')[0];
      const end = new Date(endDate).toISOString().split('T')[0];
      query.date = { [Op.gte]: start, [Op.lte]: end };
    }

    const attendance = await Attendance.findAll({
      where: query,
      include: [
        { model: Student, as: 'student', attributes: ['id', 'enrollmentNo', 'name'] },
        { model: Batch, as: 'batch', attributes: ['id', 'name'] }
      ],
      order: [['date', 'DESC']]
    });

    // Group by date for summary
    const summary = {};
    attendance.forEach(record => {
      const dateKey = record.date;
      if (!summary[dateKey]) {
        summary[dateKey] = { present: 0, absent: 0, leave: 0, total: 0 };
      }
      summary[dateKey].total++;
      if (record.status === 'present') {
        summary[dateKey].present++;
      } else if (record.status === 'leave') {
        summary[dateKey].leave++;
      } else {
        summary[dateKey].absent++;
      }
    });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: {
        subject: {
          id: subject.id,
          code: subject.code,
          name: subject.name,
          class: subject.classes?.[0] || null
        },
        attendance,
        summary
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};

/**
 * @desc    Get batches for a subject's class
 * @route   GET /api/teacher/batches/:subjectId
 * @access  Private/Teacher
 */
const getBatchesForSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const teacherId = req.user.id;

    const subject = await Subject.findByPk(subjectId, {
      include: [{ model: Class, as: 'classes', attributes: ['id'] }]
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    if (!isTeacherAssigned(subject, 'lab', teacherId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access lab batches for this subject'
      });
    }

    const primaryClass = subject.classes?.[0];
    if (!primaryClass) {
      return res.status(400).json({
        success: false,
        message: 'Subject has no associated classes'
      });
    }

    const batches = await Batch.findAll({
      where: { classId: primaryClass.id, isActive: true },
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    console.error('Get batches for subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: error.message
    });
  }
};

/**
 * @desc    Get attendance report for a subject
 * @route   GET /api/teacher/reports/:subjectId
 * @access  Private/Teacher
 */
const getAttendanceReport = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { type, batchId } = req.query;
    const teacherId = req.user.id;

    const subject = await Subject.findByPk(subjectId, {
      include: [{ model: Class, as: 'classes', attributes: ['id', 'name'] }]
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const teachingType = getTeachingTypeForTeacher(subject, teacherId);
    if (!teachingType) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view reports for this subject'
      });
    }

    if (type && !isTeacherAssigned(subject, type, teacherId)) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized to view ${type} reports for this subject`
      });
    }

    const primaryClass = subject.classes?.[0];
    if (!primaryClass) {
      return res.status(400).json({
        success: false,
        message: 'Subject has no associated classes'
      });
    }

    // Get students
    const studentQuery = { classId: primaryClass.id, isActive: true };
    if (type === 'lab' && batchId) {
      studentQuery.batchId = batchId;
    }

    const students = await Student.findAll({
      where: studentQuery,
      order: [['enrollmentNo', 'ASC']]
    });

    // Build attendance query
    const attendanceQuery = { subjectId };
    if (type) {
      attendanceQuery.type = type;
    } else if (teachingType !== 'both') {
      attendanceQuery.type = teachingType;
    }
    if (batchId) attendanceQuery.batchId = batchId;

    const aggregates = await Attendance.findAll({
      where: {
        ...attendanceQuery,
        studentId: { [Op.in]: students.map((student) => student.id) }
      },
      attributes: [
        'studentId',
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")), 'present'],
        [fn('SUM', literal("CASE WHEN status = 'leave' THEN 1 ELSE 0 END")), 'leave'],
        [fn('SUM', literal("CASE WHEN status = 'absent' THEN 1 ELSE 0 END")), 'absent']
      ],
      group: ['studentId'],
      raw: true
    });

    const aggregateByStudent = new Map(
      aggregates.map((row) => [
        Number(row.studentId),
        {
          total: Number(row.total || 0),
          present: Number(row.present || 0),
          leave: Number(row.leave || 0),
          absent: Number(row.absent || 0)
        }
      ])
    );

    const report = students.map((student) => {
      const summary = aggregateByStudent.get(Number(student.id)) || {
        total: 0,
        present: 0,
        leave: 0,
        absent: 0
      };
      const consideredTotal = summary.total - summary.leave;
      const percentage = consideredTotal > 0
        ? Number(((summary.present / consideredTotal) * 100).toFixed(2))
        : 0;

      return {
        studentId: student.id,
        enrollmentNo: student.enrollmentNo,
        studentName: student.name,
        present: summary.present,
        leave: summary.leave,
        absent: summary.absent,
        total: summary.total,
        consideredTotal,
        percentage
      };
    });

    res.status(200).json({
      success: true,
      data: {
        subject: {
          id: subject.id,
          code: subject.code,
          name: subject.name,
          class: primaryClass.name
        },
        report
      }
    });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};

module.exports = {
  getMySubjects,
  getStudentsForAttendance,
  markAttendance,
  getAttendance,
  getBatchesForSubject,
  getAttendanceReport
};
