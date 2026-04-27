/* global module */
const normalizeTeacherDepartments = (value) => {
  if (!value) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];

  return [...new Set(
    values
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter(Boolean)
  )];
};

const getTeacherDepartments = (teacher) => {
  const rawDepartments = teacher?.getDataValue
    ? teacher.getDataValue('departments')
    : teacher?.departments;

  const normalized = normalizeTeacherDepartments(rawDepartments);
  if (normalized.length > 0) {
    return normalized;
  }

  return normalizeTeacherDepartments(teacher?.department);
};

const getPrimaryTeacherDepartment = (teacher) => getTeacherDepartments(teacher)[0] || null;

const teacherHandlesDepartment = (teacher, department) => {
  if (!department) {
    return true;
  }

  const normalizedTarget = String(department).trim().toLowerCase();
  return getTeacherDepartments(teacher)
    .map((item) => String(item).trim().toLowerCase())
    .includes(normalizedTarget);
};

module.exports = {
  normalizeTeacherDepartments,
  getTeacherDepartments,
  getPrimaryTeacherDepartment,
  teacherHandlesDepartment
};
