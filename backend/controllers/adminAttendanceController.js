/**
 * SAL Education - Admin Attendance Report Controller
 * 
 * Handles attendance reports for admin panel.
 * Provides class-wise, subject-wise, and student-wise reports.
 */

const { fn, col } = require('sequelize');
const { Attendance, Subject, Student, Class } = require('../models');

const groupedSummary = (rows, type) => {
  const records = rows.filter((row) => !type || row.type === type);
  const summary = { present: 0, leave: 0, absent: 0, total: 0, percentage: 0 };
  for (const row of records) {
    const count = Number(row.count);
    summary[row.status] += count;
    summary.total += count;
  }
  const considered = summary.present + summary.absent;
  summary.percentage = considered ? Math.round((summary.present / considered) * 100) : 0;
  return summary;
};

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
    const attendanceRows = students.length ? await Attendance.findAll({
      attributes: ['studentId', 'status', [fn('COUNT', col('id')), 'count']],
      where: { studentId: students.map((student) => student.id), classId },
      group: ['studentId', 'status'],
      raw: true
    }) : [];
    const byStudent = new Map();
    attendanceRows.forEach((row) => {
      const id = Number(row.studentId);
      if (!byStudent.has(id)) byStudent.set(id, []);
      byStudent.get(id).push(row);
    });

    const report = students.map((student) => {
      const summary = groupedSummary(byStudent.get(Number(student.id)) || []);

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
    });

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
      include: [{ model: Class, as: 'classes', attributes: ['id'] }]
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Get students in this class
    const students = await Student.findAll({
      where: { classId: (subject.classes || []).map((item) => item.id), isActive: true },
      order: [['enrollmentNo', 'ASC']]
    });

    const attendanceRows = await Attendance.findAll({
      attributes: ['studentId', 'type', 'status', [fn('COUNT', col('id')), 'count']],
      where: { studentId: students.map((student) => student.id), subjectId },
      group: ['studentId', 'type', 'status'],
      raw: true
    });
    const byStudent = new Map();
    attendanceRows.forEach((row) => {
      const id = Number(row.studentId);
      if (!byStudent.has(id)) byStudent.set(id, []);
      byStudent.get(id).push(row);
    });

    const report = students.map((student) => {
      const rows = byStudent.get(Number(student.id)) || [];
      const theorySummary = groupedSummary(rows, 'theory');
      const labSummary = groupedSummary(rows, 'lab');

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
    });

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

    // Subjects are linked to classes through the subject_classes junction table;
    // `classId` is not a column on subjects.
    const subjects = await Subject.findAll({
      where: { isActive: true },
      include: [{
        model: Class,
        as: 'classes',
        where: { id: student.classId },
        required: true,
        attributes: []
      }]
    });

    const attendanceRows = await Attendance.findAll({
      attributes: ['subjectId', 'type', 'status', [fn('COUNT', col('id')), 'count']],
      where: { studentId, subjectId: subjects.map((subject) => subject.id) },
      group: ['subjectId', 'type', 'status'],
      raw: true
    });
    const bySubject = new Map();
    attendanceRows.forEach((row) => {
      const id = Number(row.subjectId);
      if (!bySubject.has(id)) bySubject.set(id, []);
      bySubject.get(id).push(row);
    });

    const report = subjects.map((subject) => {
      const rows = bySubject.get(Number(subject.id)) || [];
      const theorySummary = groupedSummary(rows, 'theory');
      const labSummary = groupedSummary(rows, 'lab');
      const overallSummary = groupedSummary(rows);

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
    });

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
