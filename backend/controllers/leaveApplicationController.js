/**
 * SAL Education - Leave Application Controller
 *
 * Handles student leave requests and reviewer approval.
 * Workflow:
 * 1. Student submits leave and chooses the reviewer target.
 * 2. Relevant HOD/class coordinator reviews the request.
 * 3. Approved leave is reflected in attendance as 'leave'.
 */

const { Op } = require('sequelize');
const { sequelize, LeaveApplication, Student, Class, Teacher, Attendance, Subject } = require('../models');
const { LEAVE_TARGETS } = require('../constants/roles');
const { resolveLeaveRecipients, buildTeacherLeaveScope, canTeacherReviewLeave } = require('../utils/leaveAccess');

const reviewerAttributes = ['id', 'name', 'employeeId', 'priority', 'department', 'departments'];
const classAttributes = ['id', 'name', 'department', 'semester', 'classCoordinatorId'];
const studentAttributes = ['id', 'enrollmentNo', 'name', 'email'];

const studentLeaveIncludes = [
  { model: Class, as: 'class', attributes: classAttributes },
  { model: Teacher, as: 'coordinator', attributes: reviewerAttributes },
  { model: Teacher, as: 'hod', attributes: reviewerAttributes },
  { model: Teacher, as: 'approver', attributes: reviewerAttributes }
];

const reviewerLeaveIncludes = [
  { model: Student, as: 'student', attributes: studentAttributes },
  { model: Class, as: 'class', attributes: classAttributes },
  { model: Teacher, as: 'coordinator', attributes: reviewerAttributes },
  { model: Teacher, as: 'hod', attributes: reviewerAttributes },
  { model: Teacher, as: 'approver', attributes: reviewerAttributes }
];

const normalizeDate = (value) => new Date(`${value}T00:00:00`);

const formatDateOnly = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calculateWorkingDays = (fromDate, toDate) => {
  let totalDays = 0;
  const current = normalizeDate(fromDate);
  const endDate = normalizeDate(toDate);

  while (current <= endDate) {
    if (current.getDay() !== 0) {
      totalDays += 1;
    }
    current.setDate(current.getDate() + 1);
  }

  return totalDays;
};

const normalizeRecipients = (sentTo, recipients) => {
  const normalized = {
    coordinator: recipients?.coordinator || null,
    hod: recipients?.hod || null
  };

  // Fallback routing: if one reviewer type is unavailable, route to the available reviewer
  // so student requests still reach a teacher instead of being blocked.
  if (sentTo === 'CLASS_COORDINATOR' && !normalized.coordinator && normalized.hod) {
    normalized.coordinator = normalized.hod;
  }

  if (sentTo === 'HOD' && !normalized.hod && normalized.coordinator) {
    normalized.hod = normalized.coordinator;
  }

  if (sentTo === 'BOTH') {
    if (!normalized.coordinator && normalized.hod) {
      normalized.coordinator = normalized.hod;
    }

    if (!normalized.hod && normalized.coordinator) {
      normalized.hod = normalized.coordinator;
    }
  }

  return normalized;
};

const validateRecipients = (recipients) => {
  if (!recipients?.coordinator && !recipients?.hod) {
    throw new Error('Unable to route leave request. No eligible class coordinator or HOD found for this class/department.');
  }
};

const upsertLeaveAttendance = async ({ student, subject, type, date, attendanceMarkerId, transaction }) => {
  const where = {
    studentId: student.id,
    subjectId: subject.id,
    date,
    type
  };

  if (type === 'lab') {
    where.batchId = student.batchId;
  }

  const existing = await Attendance.findOne({ where, transaction });

  if (existing) {
    if (existing.status === 'present' || existing.status === 'leave') {
      return 0;
    }

    await existing.update({ status: 'leave' }, { transaction });
    return 1;
  }

  await Attendance.create({
    studentId: student.id,
    subjectId: subject.id,
    classId: student.classId,
    batchId: type === 'lab' ? student.batchId : null,
    date,
    type,
    status: 'leave',
    markedBy: attendanceMarkerId
  }, { transaction });

  return 1;
};

const createLeaveAttendanceRecords = async ({ leave, attendanceMarkerId, transaction }) => {
  const subjects = await Subject.findAll({
    where: { classId: leave.student.classId, isActive: true },
    transaction
  });

  let leaveRecordsCreated = 0;
  const current = normalizeDate(leave.fromDate);
  const endDate = normalizeDate(leave.toDate);

  while (current <= endDate) {
    if (current.getDay() !== 0) {
      const date = formatDateOnly(current);

      for (const subject of subjects) {
        if (subject.type === 'theory' || subject.type === 'theory+lab') {
          leaveRecordsCreated += await upsertLeaveAttendance({
            student: leave.student,
            subject,
            type: 'theory',
            date,
            attendanceMarkerId,
            transaction
          });
        }

        if ((subject.type === 'lab' || subject.type === 'theory+lab') && leave.student.batchId) {
          leaveRecordsCreated += await upsertLeaveAttendance({
            student: leave.student,
            subject,
            type: 'lab',
            date,
            attendanceMarkerId,
            transaction
          });
        }
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return leaveRecordsCreated;
};

const processLeaveReview = async ({
  leaveId,
  status,
  adminNote,
  approvedBy,
  attendanceMarkerId,
  canReviewAll = false,
  reviewerUser = null
}) => {
  const transaction = await sequelize.transaction();

  try {
    const leave = await LeaveApplication.findByPk(leaveId, {
      include: [{ model: Student, as: 'student' }],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!leave) {
      await transaction.rollback();
      return {
        statusCode: 404,
        payload: {
          success: false,
          message: 'Leave application not found'
        }
      };
    }

    if (!canReviewAll && !canTeacherReviewLeave(reviewerUser, leave)) {
      await transaction.rollback();
      return {
        statusCode: 403,
        payload: {
          success: false,
          message: 'You are not authorized to review this leave request'
        }
      };
    }

    if (leave.status !== 'pending') {
      await transaction.rollback();
      return {
        statusCode: 400,
        payload: {
          success: false,
          message: `This leave has already been ${leave.status}`
        }
      };
    }

    const decisionDate = new Date();

    await leave.update({
      status,
      approvedBy,
      approvedDate: decisionDate,
      decisionDate,
      adminNote: adminNote || null
    }, { transaction });

    let leaveRecordsCreated = 0;
    if (status === 'approved') {
      leaveRecordsCreated = await createLeaveAttendanceRecords({
        leave,
        attendanceMarkerId,
        transaction
      });
    }

    await transaction.commit();

    const updatedLeave = await LeaveApplication.findByPk(leaveId, {
      include: reviewerLeaveIncludes
    });

    return {
      statusCode: 200,
      payload: {
        success: true,
        message: status === 'approved'
          ? `Leave approved. ${leaveRecordsCreated} attendance records marked as leave.`
          : 'Leave application rejected',
        data: updatedLeave
      }
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * @desc    Student applies for leave
 * @route   POST /api/student/leave
 * @access  Private/Student
 */
const applyLeave = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { fromDate, toDate, reason, sentTo = 'BOTH' } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fromDate, toDate, and reason'
      });
    }

    if (!LEAVE_TARGETS.includes(sentTo)) {
      return res.status(400).json({
        success: false,
        message: `Send To must be one of: ${LEAVE_TARGETS.join(', ')}`
      });
    }

    const trimmedReason = reason.trim();
    if (trimmedReason.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Reason must be at least 5 characters'
      });
    }

    const from = normalizeDate(fromDate);
    const to = normalizeDate(toDate);

    if (from > to) {
      return res.status(400).json({
        success: false,
        message: 'From date cannot be after to date'
      });
    }

    const totalDays = calculateWorkingDays(fromDate, toDate);

    if (totalDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Leave must be for at least 1 working day'
      });
    }

    const overlapping = await LeaveApplication.findOne({
      where: {
        studentId,
        status: { [Op.in]: ['pending', 'approved'] },
        fromDate: { [Op.lte]: toDate },
        toDate: { [Op.gte]: fromDate }
      }
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending or approved leave that overlaps with these dates'
      });
    }

    const student = await Student.findByPk(studentId, {
      include: [{
        model: Class,
        as: 'class',
        attributes: classAttributes,
        include: [{
          model: Teacher,
          as: 'classCoordinator',
          attributes: reviewerAttributes
        }]
      }]
    });

    if (!student || !student.class) {
      return res.status(404).json({
        success: false,
        message: 'Student class information not found'
      });
    }

    const rawRecipients = await resolveLeaveRecipients({
      classRecord: student.class,
      sentTo
    });
    const recipients = normalizeRecipients(sentTo, rawRecipients);

    try {
      validateRecipients(recipients);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    const leave = await LeaveApplication.create({
      studentId,
      classId: student.classId,
      fromDate,
      toDate,
      totalDays,
      reason: trimmedReason,
      sentTo,
      coordinatorId: recipients.coordinator?.id || null,
      hodId: recipients.hod?.id || null
    });

    const createdLeave = await LeaveApplication.findByPk(leave.id, {
      include: studentLeaveIncludes
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: createdLeave
    });
  } catch (error) {
    console.error('[ERROR] Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Get student's own leave applications
 * @route   GET /api/student/leave
 * @access  Private/Student
 */
const getMyLeaves = async (req, res) => {
  try {
    const studentId = req.user.id;

    const leaves = await LeaveApplication.findAll({
      where: { studentId },
      include: studentLeaveIncludes,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    console.error('[ERROR] Get my leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Get scoped leave applications for the current teacher reviewer
 * @route   GET /api/teacher/leave-requests
 * @access  Private/Teacher reviewer
 */
const getLeaveRequests = async (req, res) => {
  try {
    const { status, classId } = req.query;
    const scope = buildTeacherLeaveScope(req.user);

    if (!scope) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view leave requests'
      });
    }

    const query = { ...scope };
    if (status) query.status = status;
    // QA-FIXED: Validate classId parameter to prevent invalid query
    if (classId) {
      const parsedClassId = parseInt(classId, 10);
      if (isNaN(parsedClassId) || parsedClassId < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid classId provided'
        });
      }
      query.classId = parsedClassId;
    }

    const leaves = await LeaveApplication.findAll({
      where: query,
      include: reviewerLeaveIncludes,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    console.error('[ERROR] Get leave requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Approve or reject a leave application
 * @route   PUT /api/teacher/leave-requests/:id
 * @access  Private/Teacher reviewer
 */
const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected'
      });
    }

    const result = await processLeaveReview({
      leaveId: id,
      status,
      adminNote: adminNote?.trim() || null,
      approvedBy: req.user.id,
      attendanceMarkerId: req.user.id,
      reviewerUser: req.user
    });

    res.status(result.statusCode).json(result.payload);
  } catch (error) {
    console.error('[ERROR] Review leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Get leave applications (admin view - all requests)
 * @route   GET /api/admin/reports/leave-requests
 * @access  Private/Admin
 */
const getAdminLeaveRequests = async (req, res) => {
  try {
    const { status, classId } = req.query;

    const query = {};
    if (status) query.status = status;
    // QA-FIXED: Validate classId parameter to prevent invalid query
    if (classId) {
      const parsedClassId = parseInt(classId, 10);
      if (isNaN(parsedClassId) || parsedClassId < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid classId provided'
        });
      }
      query.classId = parsedClassId;
    }

    const leaves = await LeaveApplication.findAll({
      where: query,
      include: reviewerLeaveIncludes,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    console.error('[ERROR] Get admin leave requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

/**
 * @desc    Admin approve/reject leave
 * @route   PUT /api/admin/reports/leave-requests/:id
 * @access  Private/Admin
 */
const adminReviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected'
      });
    }

    const leave = await LeaveApplication.findByPk(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }

    const fallbackTeacherId = leave.coordinatorId || leave.hodId;

    if (!fallbackTeacherId) {
      return res.status(400).json({
        success: false,
        message: 'Leave request has no teacher reviewer assigned for attendance marking'
      });
    }

    const result = await processLeaveReview({
      leaveId: id,
      status,
      adminNote: adminNote?.trim() || 'Reviewed by admin',
      approvedBy: fallbackTeacherId,
      attendanceMarkerId: fallbackTeacherId,
      canReviewAll: true
    });

    res.status(result.statusCode).json(result.payload);
  } catch (error) {
    console.error('[ERROR] Admin review leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getLeaveRequests,
  reviewLeave,
  getAdminLeaveRequests,
  adminReviewLeave
};
