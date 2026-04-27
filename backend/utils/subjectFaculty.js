const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

const PRIMARY_FIELDS = {
  theory: 'theoryFacultyId',
  lab: 'labFacultyId'
};

const ARRAY_FIELDS = {
  theory: 'theoryFacultyIds',
  lab: 'labFacultyIds'
};

const toTeacherId = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeTeacherIds = (value) => {
  if (value === null || value === undefined || value === '') {
    return [];
  }

  let values = value;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      values = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      values = trimmed.split(',');
    }
  } else if (!Array.isArray(value)) {
    values = [value];
  }

  return [...new Set(
    values
      .map((item) => toTeacherId(item))
      .filter(Boolean)
  )];
};

const getAssignedTeacherIds = (subject, type) => {
  if (!subject || !PRIMARY_FIELDS[type] || !ARRAY_FIELDS[type]) {
    return [];
  }

  const primaryId = toTeacherId(subject[PRIMARY_FIELDS[type]]);
  const assignedIds = normalizeTeacherIds(subject[ARRAY_FIELDS[type]]);

  return [...new Set([
    ...(primaryId ? [primaryId] : []),
    ...assignedIds
  ])];
};

const isTeacherAssigned = (subject, type, teacherId) => {
  const normalizedTeacherId = toTeacherId(teacherId);
  if (!normalizedTeacherId) {
    return false;
  }

  return getAssignedTeacherIds(subject, type).includes(normalizedTeacherId);
};

const getTeachingTypeForTeacher = (subject, teacherId) => {
  const teachesTheory = isTeacherAssigned(subject, 'theory', teacherId);
  const teachesLab = isTeacherAssigned(subject, 'lab', teacherId);

  if (teachesTheory && teachesLab) {
    return 'both';
  }

  if (teachesTheory) {
    return 'theory';
  }

  if (teachesLab) {
    return 'lab';
  }

  return null;
};

const buildJsonContainsCondition = (column, teacherId) => sequelize.where(
  sequelize.literal(`JSON_CONTAINS(COALESCE(\`${column}\`, JSON_ARRAY()), '${JSON.stringify(teacherId)}')`),
  1
);

const buildTeacherAssignmentConditions = (teacherId, type) => {
  const normalizedTeacherId = toTeacherId(teacherId);
  if (!normalizedTeacherId || !PRIMARY_FIELDS[type] || !ARRAY_FIELDS[type]) {
    return [];
  }

  return [
    { [PRIMARY_FIELDS[type]]: normalizedTeacherId },
    buildJsonContainsCondition(ARRAY_FIELDS[type], normalizedTeacherId)
  ];
};

const buildTeacherTypeWhere = (teacherId, type) => ({
  [Op.or]: buildTeacherAssignmentConditions(teacherId, type)
});

const buildTeacherSubjectWhere = (teacherId) => ({
  [Op.or]: [
    ...buildTeacherAssignmentConditions(teacherId, 'theory'),
    ...buildTeacherAssignmentConditions(teacherId, 'lab')
  ]
});

module.exports = {
  normalizeTeacherIds,
  getAssignedTeacherIds,
  isTeacherAssigned,
  getTeachingTypeForTeacher,
  buildTeacherTypeWhere,
  buildTeacherSubjectWhere
};
