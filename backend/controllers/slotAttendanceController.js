/* global require, module, process */
/**
 * Slot-driven attendance controller.
 *
 * Provides:
 * - GET slot attendance context (slot details + filtered students + existing statuses)
 * - POST bulk save attendance for a slot with strict validation and lock semantics
 */

const { QueryTypes } = require('sequelize');
const {
  sequelize,
  Student,
  Attendance,
  LectureSlot,
  ProxyAssignment,
  Subject,
  LectureLog
} = require('../models');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const normalizeDateOnly = (value) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString().split('T')[0];
};

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getAuthorizedSlotContext = async ({ teacherId, slotId, attendanceDate, transaction }) => {
  const slot = await LectureSlot.findOne({
    where: {
      id: slotId,
      isActive: true
    },
    include: [
      {
        model: Subject,
        as: 'subject',
        attributes: ['id', 'code', 'name', 'classId', 'theoryFacultyId', 'labFacultyId', 'theoryFacultyIds', 'labFacultyIds']
      }
    ],
    transaction
  });

  if (!slot) {
    return { error: { status: 404, message: 'Lecture slot not found' } };
  }

  if (!slot.subject || Number(slot.subject.classId) !== Number(slot.classId)) {
    return {
      error: {
        status: 400,
        message: 'Lecture slot has inconsistent subject/class mapping'
      }
    };
  }

  const assignment = await ProxyAssignment.findOne({
    where: {
      slotId,
      date: attendanceDate
    },
    transaction
  });

  const isOriginalFaculty = Number(slot.facultyId) === teacherId;
  const isAssignedProxyFaculty = assignment && Number(assignment.proxyFacultyId) === teacherId;

  if (!isOriginalFaculty && !isAssignedProxyFaculty) {
    return { error: { status: 403, message: 'You are not authorized for this slot' } };
  }

  return { slot, assignment };
};

/**
 * @desc    Get slot context with students and attendance status
 * @route   GET /api/attendance/slots/:slotId/context?date=YYYY-MM-DD
 * @access  Private/Teacher
 */
const getSlotAttendanceContext = async (req, res) => {
  try {
    const slotId = parsePositiveInt(req.params.slotId);
    const date = req.query.date || new Date().toISOString().split('T')[0];

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'Valid slotId is required'
      });
    }

    const attendanceDate = normalizeDateOnly(date);
    if (!attendanceDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD.'
      });
    }

    const teacherId = Number(req.user.id);
    const slotContext = await getAuthorizedSlotContext({
      teacherId,
      slotId,
      attendanceDate
    });

    if (slotContext.error) {
      return res.status(slotContext.error.status).json({
        success: false,
        message: slotContext.error.message
      });
    }

    const { slot } = slotContext;
    const students = await sequelize.query(
      `
      SELECT
        s.id AS studentId,
        s.name,
        s.enrollmentNo,
        COALESCE(
          (
            SELECT a2.status
            FROM attendances a2
            WHERE a2.studentId = s.id
              AND a2.slotId = :slotId
              AND a2.subjectId = :subjectId
              AND a2.date = :attendanceDate
            ORDER BY a2.id DESC
            LIMIT 1
          ),
          'not_marked'
        ) AS attendanceStatus
      FROM students s
      WHERE s.classId = :classId
        AND s.isActive = 1
        AND (:batchId IS NULL OR s.batchId = :batchId)
      ORDER BY s.enrollmentNo ASC
      `,
      {
        replacements: {
          slotId: Number(slot.id),
          subjectId: Number(slot.subjectId),
          classId: Number(slot.classId),
          batchId: slot.batchId ? Number(slot.batchId) : null,
          attendanceDate
        },
        type: QueryTypes.SELECT
      }
    );

    const existingAttendanceCount = await Attendance.count({
      where: {
        slotId: Number(slot.id),
        subjectId: Number(slot.subjectId),
        date: attendanceDate
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        slotDetails: {
          slotId: Number(slot.id),
          subjectId: Number(slot.subjectId),
          subjectCode: slot.subject?.code || null,
          subjectName: slot.subject?.name || null,
          classId: Number(slot.classId),
          batchId: slot.batchId ? Number(slot.batchId) : null,
          type: slot.type,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          date: attendanceDate,
          isLocked: existingAttendanceCount > 0
        },
        students
      }
    });
  } catch (error) {
    console.error('[ERROR] Get slot attendance context error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Mark attendance from a timetable slot (bulk save)
 * @route   POST /api/attendance/slots/:slotId/save
 * @access  Private/Teacher
 */
const saveSlotAttendance = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const teacherId = Number(req.user.id);
    const slotId = parsePositiveInt(req.params.slotId);
    const { date, attendance, topicCovered } = req.body;

    if (!slotId || !date || !Array.isArray(attendance) || attendance.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide slotId, date and non-empty attendance array'
      });
    }

    if (!topicCovered || topicCovered.trim().length < 2) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid topic covered (min 2 chars)'
      });
    }

    const attendanceDate = normalizeDateOnly(date);
    if (!attendanceDate) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD.'
      });
    }

    const slotContext = await getAuthorizedSlotContext({
      teacherId,
      slotId,
      attendanceDate,
      transaction
    });
    if (slotContext.error) {
      await transaction.rollback();
      return res.status(slotContext.error.status).json({
        success: false,
        message: slotContext.error.message
      });
    }
    const { slot } = slotContext;

    const enforceSlotWindow = process.env.ENFORCE_SLOT_TIME_WINDOW !== 'false';
    if (enforceSlotWindow) {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentDay = DAY_NAMES[now.getDay()];
      const currentTime = now.toTimeString().slice(0, 8);

      if (
        attendanceDate !== today ||
        slot.dayOfWeek !== currentDay ||
        !(slot.startTime <= currentTime && slot.endTime >= currentTime)
      ) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'Attendance can only be marked during the active slot time window'
        });
      }
    }

    const duplicateAttendance = await Attendance.findOne({
      where: {
        subjectId: Number(slot.subjectId),
        classId: Number(slot.classId),
        slotId: Number(slot.id),
        date: attendanceDate
      },
      transaction
    });

    if (duplicateAttendance) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: 'Attendance is already marked for this slot and date'
      });
    }

    // QA-FIXED: Normalize and validate attendance records properly
    const normalizedRecords = attendance.map((record) => ({
      studentId: parsePositiveInt(record.studentId),
      status: (record.status || '').toLowerCase()
    }));

    const invalidRecord = normalizedRecords.find(
      (record) => !record.studentId || !['present', 'absent'].includes(record.status)
    );

    if (invalidRecord) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Each attendance item must have valid studentId and status (present/absent)'
      });
    }

    const studentIds = [...new Set(normalizedRecords.map((record) => record.studentId))];
    if (studentIds.length !== normalizedRecords.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Duplicate student entries are not allowed in attendance payload'
      });
    }

    const students = await Student.findAll({
      where: {
        id: studentIds,
        classId: Number(slot.classId),
        ...(slot.batchId ? { batchId: Number(slot.batchId) } : {}),
        isActive: true
      },
      attributes: ['id', 'classId', 'batchId'],
      transaction
    });

    if (students.length !== studentIds.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'One or more students are invalid, inactive, or outside this slot class/batch'
      });
    }

    await Attendance.bulkCreate(
      normalizedRecords.map((record) => ({
        studentId: record.studentId,
        subjectId: Number(slot.subjectId),
        classId: Number(slot.classId),
        batchId: slot.batchId || null,
        date: attendanceDate,
        type: slot.type || 'theory',
        status: record.status,
        slotId: Number(slot.id),
        markedBy: teacherId
      })),
      { transaction }
    );

    // Save syllabus topic log
    await LectureLog.create({
      slotId: Number(slot.id),
      date: attendanceDate,
      topicCovered: topicCovered.trim(),
      markedBy: teacherId
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        slotId: Number(slot.id),
        date: attendanceDate,
        createdCount: normalizedRecords.length
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('[ERROR] Save slot attendance error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Duplicate attendance detected for one or more students in this slot/date'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

module.exports = {
  getSlotAttendanceContext,
  saveSlotAttendance
};

