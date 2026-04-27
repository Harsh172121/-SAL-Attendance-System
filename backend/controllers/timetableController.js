/**
 * Timetable Controller
 * 
 * Handles fetching weekly schedules for students and teachers.
 */

const { Op } = require('sequelize');
const {
  LectureSlot,
  Subject,
  Class,
  Batch,
  Classroom,
  Teacher,
  ProxyAssignment
} = require('../models');

/**
 * @desc    Get weekly timetable for current student
 * @route   GET /api/timetable/student
 * @access  Private/Student
 */
const getStudentTimetable = async (req, res) => {
  try {
    const { classId, batchId } = req.user;

    const slots = await LectureSlot.findAll({
      where: {
        classId,
        [Op.or]: [
          { batchId: null },
          { batchId }
        ],
        isActive: true
      },
      include: [
        { model: Subject, as: 'subject', attributes: ['id', 'code', 'name'] },
        { model: Classroom, as: 'classroom', attributes: ['id', 'classroomNumber'] },
        { model: Teacher, as: 'faculty', attributes: ['id', 'name'] }
      ],
      order: [
        ['dayOfWeek', 'ASC'],
        ['startTime', 'ASC']
      ]
    });

    return res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    console.error('Get student timetable error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching timetable',
      error: error.message
    });
  }
};

/**
 * @desc    Get weekly timetable for current teacher
 * @route   GET /api/timetable/teacher?date=YYYY-MM-DD
 * @access  Private/Teacher
 */
const getTeacherTimetable = async (req, res) => {
  try {
    const teacherId = Number(req.user.id);
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Fetch primary slots
    const primarySlots = await LectureSlot.findAll({
      where: {
        facultyId: teacherId,
        isActive: true
      },
      include: [
        { model: Subject, as: 'subject', attributes: ['id', 'code', 'name'] },
        { model: Class, as: 'class', attributes: ['id', 'name'] },
        { model: Batch, as: 'batch', attributes: ['id', 'name'] },
        { model: Classroom, as: 'classroom', attributes: ['id', 'classroomNumber'] }
      ]
    });

    // Fetch proxy assignments for the given date
    const proxyAssignments = await ProxyAssignment.findAll({
      where: {
        proxyFacultyId: teacherId,
        date
      },
      include: [
        {
          model: LectureSlot,
          as: 'slot',
          include: [
            { model: Subject, as: 'subject', attributes: ['id', 'code', 'name'] },
            { model: Class, as: 'class', attributes: ['id', 'name'] },
            { model: Batch, as: 'batch', attributes: ['id', 'name'] },
            { model: Classroom, as: 'classroom', attributes: ['id', 'classroomNumber'] }
          ]
        }
      ]
    });

    // Mark proxy slots as proxy
    const proxySlots = proxyAssignments.map(pa => ({
      ...pa.slot.toJSON(),
      isProxy: true,
      originalDate: pa.date
    }));

    // Combine and sort
    const allSlots = [...primarySlots.map(s => s.toJSON()), ...proxySlots].sort((a, b) => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (a.dayOfWeek !== b.dayOfWeek) {
        return days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
      }
      return a.startTime.localeCompare(b.startTime);
    });

    return res.status(200).json({
      success: true,
      count: allSlots.length,
      data: allSlots
    });
  } catch (error) {
    console.error('Get teacher timetable error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching timetable',
      error: error.message
    });
  }
};

module.exports = {
  getStudentTimetable,
  getTeacherTimetable
};
