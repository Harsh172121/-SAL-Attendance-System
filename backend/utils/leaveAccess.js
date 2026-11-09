const { Op } = require('sequelize');
const { Teacher } = require('../models');
const { LEAVE_TARGETS, canReviewLeaves } = require('../constants/roles');
const { teacherHandlesDepartment } = require('./teacherDepartments');
const normalizeRole = (role) => String(role || '').trim().toLowerCase();
const normalizePriority = (priority) => String(priority || '').trim().toUpperCase();
const sameId = (left, right) => (
  left !== null && left !== undefined &&
  right !== null && right !== undefined &&
  Number(left) === Number(right)
);

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
  const priority = normalizePriority(user?.priority);
  if (!user || normalizeRole(user.role) !== 'teacher' || !canReviewLeaves(priority)) {
    return null;
  }

  if (priority === 'ADMIN' || priority === 'PRINCIPAL') {
    return {};
  }

  const filters = [];

  if (priority === 'HOD') {
    filters.push({ hodId: Number(user.id) });
  }

  if (priority === 'CLASS_COORDINATOR') {
    filters.push({ coordinatorId: Number(user.id) });
  }

  return filters.length ? { [Op.or]: filters } : null;
};

const canTeacherReviewLeave = (user, leave) => {
  const priority = normalizePriority(user?.priority);
  if (!user || !leave || normalizeRole(user.role) !== 'teacher' || !canReviewLeaves(priority)) {
    return false;
  }

  if (priority === 'ADMIN' || priority === 'PRINCIPAL') {
    return true;
  }

  if (priority === 'HOD') {
    return sameId(leave.hodId, user.id);
  }

  if (priority === 'CLASS_COORDINATOR') {
    return sameId(leave.coordinatorId, user.id);
  }

  return false;
};

module.exports = {
  resolveLeaveRecipients,
  buildTeacherLeaveScope,
  canTeacherReviewLeave
};
