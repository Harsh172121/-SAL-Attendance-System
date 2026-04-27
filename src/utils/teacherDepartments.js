export const getTeacherDepartments = (teacher) => {
  const departments = Array.isArray(teacher?.departments)
    ? teacher.departments
    : [];

  if (departments.length > 0) {
    return [...new Set(departments.map((department) => String(department).trim()).filter(Boolean))];
  }

  return teacher?.department ? [teacher.department] : [];
};

export const teacherHandlesDepartment = (teacher, department) => {
  if (!department) {
    return true;
  }

  return getTeacherDepartments(teacher).includes(department);
};

export const formatTeacherDepartments = (teacher) => {
  const departments = getTeacherDepartments(teacher);
  return departments.length > 0 ? departments.join(', ') : 'Unassigned';
};
