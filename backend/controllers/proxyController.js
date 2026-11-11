/* global require, module */
const { Op, UniqueConstraintError } = require('sequelize');
const {
  sequelize,
  ProxyRequest,
  ProxyAssignment,
  LectureSlot,
  Teacher,
  Subject,
  Class
} = require('../models');
const { teacherHandlesDepartment } = require('../utils/teacherDepartments');

const normalizeDateOnly = (value) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return parsedDate.toISOString().split('T')[0];
};

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getSlotWithRelations = (slotId, transaction) => LectureSlot.findByPk(slotId, {
  include: [
    { model: Subject, as: 'subject', attributes: ['id', 'code', 'name'] },
    { model: Class, as: 'class', attributes: ['id', 'name', 'department', 'semester'] }
  ],
  transaction
});

const proxyRequestIncludes = [
  {
    model: LectureSlot,
    as: 'slot',
    include: [
      { model: Subject, as: 'subject', attributes: ['id', 'code', 'name'] },
      { model: Class, as: 'class', attributes: ['id', 'name', 'department', 'semester'] }
    ]
  },
  { model: Teacher, as: 'originalFaculty', attributes: ['id', 'name', 'employeeId', 'department'] },
  { model: Teacher, as: 'proxyFaculty', attributes: ['id', 'name', 'employeeId', 'department'] }
];

/**
 * @desc    Create proxy request and deliver it directly to the selected faculty
 * @route   POST /api/proxy/request
 * @access  Private/Teacher
 */
const createProxyRequest = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const originalFacultyId = Number(req.user.id);
    const slotId = parsePositiveInt(req.body.slotId);
    const proxyFacultyId = parsePositiveInt(req.body.proxyFacultyId);
    const date = normalizeDateOnly(req.body.date);
    const reason = (req.body.reason || '').trim() || null;

    if (!slotId || !proxyFacultyId || !date) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'slotId, proxyFacultyId, and valid date are required'
      });
    }

    const slot = await getSlotWithRelations(slotId, transaction);
    if (!slot || !slot.isActive) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Lecture slot not found'
      });
    }

    if (Number(slot.facultyId) !== originalFacultyId) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'You can only request proxy for your own lecture slots'
      });
    }

    if (proxyFacultyId === originalFacultyId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Proxy faculty must be different from original faculty'
      });
    }

    const proxyFaculty = await Teacher.findOne({
      where: {
        id: proxyFacultyId,
        isActive: true
      },
      transaction
    });

    if (!proxyFaculty) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Proxy faculty not found'
      });
    }

    const existingAssignment = await ProxyAssignment.findOne({
      where: { slotId, date },
      transaction
    });

    if (existingAssignment) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: 'Proxy assignment already exists for this slot/date'
      });
    }

    const proxyRequest = await ProxyRequest.create({
      slotId,
      subjectId: slot.subjectId,
      classId: slot.classId,
      originalFacultyId,
      proxyFacultyId,
      hodId: null,
      status: 'pending',
      reason,
      date,
      activeRequestKey: 1,
      proxyFacultyViewedAt: null
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: `Proxy request sent to ${proxyFaculty.name}`,
      data: proxyRequest
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: 'A pending/approved proxy request already exists for this slot/date'
      });
    }

    await transaction.rollback();
    console.error('Create proxy request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating proxy request',
      error: error.message
    });
  }
};

/**
 * @desc    Get proxy requests delivered directly to the signed-in faculty
 * @route   GET /api/proxy/incoming-requests
 * @access  Private/Teacher
 */
const getIncomingProxyRequests = async (req, res) => {
  try {
    const proxyFacultyId = Number(req.user.id);
    const today = new Date().toISOString().split('T')[0];

    const requests = await ProxyRequest.findAll({
      where: {
        proxyFacultyId,
        date: { [Op.gte]: today }
      },
      include: proxyRequestIncludes,
      order: [['date', 'ASC'], ['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get incoming proxy requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching incoming proxy requests',
      error: error.message
    });
  }
};

/**
 * @desc    Get unread proxy notifications for the sidebar badge/popup
 * @route   GET /api/proxy/notifications
 * @access  Private/Teacher
 */
const getProxyNotifications = async (req, res) => {
  try {
    const proxyFacultyId = Number(req.user.id);
    const today = new Date().toISOString().split('T')[0];

    const requests = await ProxyRequest.findAll({
      where: {
        proxyFacultyId,
        status: 'pending',
        proxyFacultyViewedAt: { [Op.is]: null },
        date: { [Op.gte]: today }
      },
      include: proxyRequestIncludes,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get proxy notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching proxy notifications',
      error: error.message
    });
  }
};

/**
 * @desc    Mark all unread proxy requests as viewed by the selected faculty
 * @route   PUT /api/proxy/notifications/read
 * @access  Private/Teacher
 */
const markProxyNotificationsRead = async (req, res) => {
  try {
    const proxyFacultyId = Number(req.user.id);

    const [updatedCount] = await ProxyRequest.update(
      { proxyFacultyViewedAt: new Date() },
      {
        where: {
          proxyFacultyId,
          status: 'pending',
          proxyFacultyViewedAt: { [Op.is]: null }
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Proxy notifications marked as read',
      updatedCount
    });
  } catch (error) {
    console.error('Mark proxy notifications read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error marking proxy notifications as read',
      error: error.message
    });
  }
};

/**
 * @desc    Accept or decline a proxy request as the selected faculty member
 * @route   PUT /api/proxy/incoming-requests/:requestId/respond
 * @access  Private/Teacher
 */
const respondToProxyRequest = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const requestId = parsePositiveInt(req.params.requestId);
    const status = req.body.status;
    const proxyFacultyId = Number(req.user.id);

    if (!requestId || !['approved', 'rejected'].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Valid requestId and status (approved/rejected) are required'
      });
    }

    const proxyRequest = await ProxyRequest.findByPk(requestId, { transaction });

    if (!proxyRequest) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Proxy request not found'
      });
    }

    if (Number(proxyRequest.proxyFacultyId) !== proxyFacultyId) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'This proxy request was not sent to you'
      });
    }

    if (proxyRequest.status !== 'pending') {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: 'Only pending requests can be reviewed'
      });
    }

    if (status === 'approved') {
      const existingAssignment = await ProxyAssignment.findOne({
        where: {
          slotId: proxyRequest.slotId,
          date: proxyRequest.date
        },
        transaction
      });

      if (existingAssignment) {
        if (Number(existingAssignment.proxyFacultyId) !== proxyFacultyId) {
          await transaction.rollback();
          return res.status(409).json({
            success: false,
            message: 'Another faculty member is already handling this lecture'
          });
        }
      } else {
        await ProxyAssignment.create({
          slotId: proxyRequest.slotId,
          date: proxyRequest.date,
          originalFacultyId: proxyRequest.originalFacultyId,
          proxyFacultyId: proxyRequest.proxyFacultyId
        }, { transaction });
      }
    }

    proxyRequest.status = status;
    proxyRequest.activeRequestKey = status === 'rejected' ? null : 1;
    proxyRequest.proxyFacultyViewedAt = new Date();
    await proxyRequest.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: status === 'approved'
        ? 'Proxy request accepted. The lecture is now assigned to you.'
        : 'Proxy request declined.',
      data: proxyRequest
    });
  } catch (error) {
    await transaction.rollback();

    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        success: false,
        message: 'Another proxy assignment already exists for this lecture'
      });
    }

    console.error('Respond to proxy request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error responding to proxy request',
      error: error.message
    });
  }
};

/**
 * @desc    Get approved proxy lectures for current faculty
 * @route   GET /api/proxy/my-lectures
 * @access  Private/Teacher
 */
const getMyProxyLectures = async (req, res) => {
  try {
    const facultyId = Number(req.user.id);
    const today = new Date().toISOString().split('T')[0];

    const rows = await ProxyAssignment.findAll({
      where: {
        proxyFacultyId: facultyId,
        date: { [Op.gte]: today }
      },
      include: [
        {
          model: LectureSlot,
          as: 'slot',
          include: [
            { model: Subject, as: 'subject', attributes: ['id', 'code', 'name', 'type'] },
            { model: Class, as: 'class', attributes: ['id', 'name', 'department', 'semester'] }
          ]
        },
        { model: Teacher, as: 'originalFaculty', attributes: ['id', 'name', 'employeeId'] }
      ],
      order: [['date', 'ASC'], ['createdAt', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Get my proxy lectures error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching proxy lectures',
      error: error.message
    });
  }
};

/**
 * @desc    Get proxy requests created by current faculty
 * @route   GET /api/proxy/my-requests
 * @access  Private/Teacher
 */
const getMyProxyRequests = async (req, res) => {
  try {
    const facultyId = Number(req.user.id);
    const today = new Date().toISOString().split('T')[0];

    const requests = await ProxyRequest.findAll({
      where: {
        originalFacultyId: facultyId,
        date: { [Op.gte]: today }
      },
      include: [
        {
          model: LectureSlot,
          as: 'slot',
          include: [
            { model: Subject, as: 'subject', attributes: ['id', 'code', 'name'] },
            { model: Class, as: 'class', attributes: ['id', 'name', 'department', 'semester'] }
          ]
        },
        { model: Teacher, as: 'proxyFaculty', attributes: ['id', 'name', 'employeeId'] }
      ],
      order: [['date', 'ASC'], ['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get my proxy requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching proxy requests',
      error: error.message
    });
  }
};

/**
 * @desc    Get faculty options for proxy requests (department-scoped)
 * @route   GET /api/proxy/faculty-options
 * @access  Private/Teacher
 */
const getProxyFacultyOptions = async (req, res) => {
  try {
    const facultyId = Number(req.user.id);
    const department = req.user.department;

    const faculty = await Teacher.findAll({
      where: {
        isActive: true,
        id: { [Op.ne]: facultyId }
      },
      order: [['name', 'ASC']]
    });

    const filtered = faculty.filter((teacher) => teacherHandlesDepartment(teacher, department));

    if (filtered.length === 0 && faculty.length > 0) {
      return res.status(200).json({
        success: true,
        count: faculty.length,
        data: faculty.map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          employeeId: teacher.employeeId,
          department: teacher.department
        }))
      });
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        employeeId: teacher.employeeId,
        department: teacher.department
      }))
    });
  } catch (error) {
    console.error('Get proxy faculty options error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching proxy faculty options',
      error: error.message
    });
  }
};

/**
 * @desc    Get suggested free faculty for a proxy slot
 * @route   GET /api/proxy/suggestions?slotId=X&date=YYYY-MM-DD
 * @access  Private/Teacher
 */
const getProxySuggestions = async (req, res) => {
  try {
    const slotId = parsePositiveInt(req.query.slotId);
    const date = normalizeDateOnly(req.query.date);
    const facultyId = Number(req.user.id);

    if (!slotId || !date) {
      return res.status(400).json({
        success: false,
        message: 'slotId and date are required'
      });
    }

    const slot = await LectureSlot.findByPk(slotId, {
      include: [{ model: Class, as: 'class' }]
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    // Find all active teachers except the requester
    const allTeachers = await Teacher.findAll({
      where: {
        isActive: true,
        id: { [Op.ne]: facultyId }
      },
      attributes: ['id', 'name', 'employeeId', 'department', 'departments']
    });

    // Find teachers busy in their own timetable during this day/time
    const busyInTimetable = await LectureSlot.findAll({
      where: {
        dayOfWeek: slot.dayOfWeek,
        isActive: true,
        [Op.or]: [
          {
            startTime: { [Op.lte]: slot.startTime },
            endTime: { [Op.gt]: slot.startTime }
          },
          {
            startTime: { [Op.lt]: slot.endTime },
            endTime: { [Op.gte]: slot.endTime }
          }
        ]
      },
      attributes: ['facultyId']
    });

    const busyTimetableFacultyIds = new Set(busyInTimetable.map(s => s.facultyId));

    // Find teachers busy with approved proxy assignments on this date/time
    const busyInProxies = await ProxyAssignment.findAll({
      where: { date },
      include: [{
        model: LectureSlot,
        as: 'slot',
        where: {
          dayOfWeek: slot.dayOfWeek,
          [Op.or]: [
            {
              startTime: { [Op.lte]: slot.startTime },
              endTime: { [Op.gt]: slot.startTime }
            },
            {
              startTime: { [Op.lt]: slot.endTime },
              endTime: { [Op.gte]: slot.endTime }
            }
          ]
        }
      }],
      attributes: ['proxyFacultyId']
    });

    const busyProxyFacultyIds = new Set(busyInProxies.map(p => p.proxyFacultyId));

    // Filter suggestions
    const suggestions = allTeachers.filter(t => 
      !busyTimetableFacultyIds.has(t.id) && !busyProxyFacultyIds.has(t.id)
    ).map(t => ({
      id: t.id,
      name: t.name,
      employeeId: t.employeeId,
      department: t.department,
      isSameDepartment: teacherHandlesDepartment(t, slot.class?.department)
    }));

    // Sort by same department first, then name
    suggestions.sort((a, b) => {
      if (a.isSameDepartment !== b.isSameDepartment) {
        return a.isSameDepartment ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    console.error('Get proxy suggestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching proxy suggestions',
      error: error.message
    });
  }
};

module.exports = {
  createProxyRequest,
  getIncomingProxyRequests,
  getProxyNotifications,
  markProxyNotificationsRead,
  respondToProxyRequest,
  getMyProxyLectures,
  getProxyFacultyOptions,
  getMyProxyRequests,
  getProxySuggestions
};

