const { Op } = require('sequelize');
const { Teacher } = require('../models');
const { LEAVE_TARGETS, canReviewLeaves } = require('../constants/roles');
const { teacherHandlesDepartment } = require('./teacherDepartments');
const normalizeRole = (role) => String(role || '').trim().toLowerCase();

const resolveLeaveRecipients = async ({ classRecord, sentTo }) => {
  if (!LEAVE_TARGETS.includes(sentTo)) {
    throw new Error('Invalid leave target selected');
  }

  let coordinator = null;
  let hod = null;

  if (sentTo === 'CLASS_COORDINATOR' || sentTo === 'BOTH') {
    coordinator = classRecord?.classCoordinator || null;

    if (!coordinator) {
      const coordinators = await Teacher.findAll({
        where: {
          priority: 'CLASS_COORDINATOR',
          isActive: true
        },
        order: [['name', 'ASC']]
      });

      coordinator = coordinators.find((teacher) => teacherHandlesDepartment(teacher, classRecord.department)) || null;
    }
  }

  if (sentTo === 'HOD' || sentTo === 'BOTH') {
    const hods = await Teacher.findAll({
      where: {
        priority: 'HOD',
        isActive: true
      },
      order: [['name', 'ASC']]
    });

    hod = hods.find((teacher) => teacherHandlesDepartment(teacher, classRecord.department)) || null;
  }

  return { coordinator, hod };
};

const buildTeacherLeaveScope = (user) => {
  if (!user || normalizeRole(user.role) !== 'teacher' || !canReviewLeaves(user.priority)) {
    return null;
  }

  if (user.priority === 'ADMIN' || user.priority === 'PRINCIPAL') {
    return {};
  }

  const filters = [];

  if (user.priority === 'HOD') {
    filters.push({ hodId: user.id });
  }

  if (user.priority === 'CLASS_COORDINATOR') {
    filters.push({ coordinatorId: user.id });
  }

  return filters.length ? { [Op.or]: filters } : null;
};

const canTeacherReviewLeave = (user, leave) => {
  if (!user || normalizeRole(user.role) !== 'teacher' || !canReviewLeaves(user.priority)) {
    return false;
  }

  if (user.priority === 'ADMIN' || user.priority === 'PRINCIPAL') {
    return true;
  }

  if (user.priority === 'HOD') {
    return leave.hodId === user.id;
  }

  if (user.priority === 'CLASS_COORDINATOR') {
    return leave.coordinatorId === user.id;
  }

  return false;
};

module.exports = {
  resolveLeaveRecipients,
  buildTeacherLeaveScope,
  canTeacherReviewLeave
};
