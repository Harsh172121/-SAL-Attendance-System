/**
 * SAL Education - Teacher Controller
 * 
 * Handles CRUD operations for Teachers/Faculty.
 * VIVA NOTE: Teachers can be assigned to subjects for theory, lab, or both.
 */

const { Op } = require('sequelize');
const { Teacher, Subject, Class } = require('../models');
const { TEACHER_PRIORITIES } = require('../constants/roles');
const { buildTeacherTypeWhere, buildTeacherSubjectWhere } = require('../utils/subjectFaculty');
const {
  normalizeTeacherDepartments,
  getTeacherDepartments,
  getPrimaryTeacherDepartment,
  teacherHandlesDepartment
} = require('../utils/teacherDepartments');

/**
 * @desc    Get all teachers
 * @route   GET /api/admin/teachers
 * @access  Private/Admin
 */
const getAllTeachers = async (req, res) => {
  try {
    const { department, isActive, search } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const teacherRows = await Teacher.findAll({
      where: filter,
      order: [['name', 'ASC']]
    });

    const normalizedSearch = search?.trim().toLowerCase();
    const teachers = teacherRows
      .filter((teacher) => {
        const departments = getTeacherDepartments(teacher);

        if (department && !teacherHandlesDepartment(teacher, department)) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const departmentText = departments.join(' ').toLowerCase();

        return (
          teacher.name.toLowerCase().includes(normalizedSearch) ||
          teacher.employeeId.toLowerCase().includes(normalizedSearch) ||
          teacher.email.toLowerCase().includes(normalizedSearch) ||
          departmentText.includes(normalizedSearch)
        );
      })
      .sort((first, second) => {
        const departmentCompare = (getPrimaryTeacherDepartment(first) || '').localeCompare(
          getPrimaryTeacherDepartment(second) || ''
        );

        if (departmentCompare !== 0) {
          return departmentCompare;
        }

        return first.name.localeCompare(second.name);
      });
    
    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teachers',
      error: error.message
    });
  }
};

/**
 * @desc    Get single teacher by ID
 * @route   GET /api/admin/teachers/:id
 * @access  Private/Admin
 */
const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    // Get assigned subjects
    const theorySubjects = await Subject.findAll({
      where: buildTeacherTypeWhere(req.params.id, 'theory'),
      include: [{ model: Class, as: 'class', attributes: ['name', 'department'] }]
    });
    const labSubjects = await Subject.findAll({
      where: buildTeacherTypeWhere(req.params.id, 'lab'),
      include: [{ model: Class, as: 'class', attributes: ['name', 'department'] }]
    });
    
    res.status(200).json({
      success: true,
      data: {
        ...teacher.toJSON(),
        assignedSubjects: {
          theory: theorySubjects,
          lab: labSubjects
        }
      }
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher',
      error: error.message
    });
  }
};

/**
 * @desc    Create new teacher
 * @route   POST /api/admin/teachers
 * @access  Private/Admin
 */
const createTeacher = async (req, res) => {
  try {
    const { employeeId, name, email, password, phone, department, departments, qualification, priority } = req.body;
    const normalizedDepartments = normalizeTeacherDepartments(departments ?? department);

    // Validate required fields
    if (!employeeId || !name || !email || normalizedDepartments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employee ID, name, email, and at least one department'
      });
    }

    // Validate priority if provided
    if (priority && !TEACHER_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Must be one of: ${TEACHER_PRIORITIES.join(', ')}`
      });
    }
    
    // Auto-generate default password if not provided (default: employeeId)
    // Ensure password meets minimum 6-char requirement
    const teacherPassword = password || (employeeId.length >= 6 ? employeeId : employeeId + '123456'.slice(employeeId.length));
    
    // Check for duplicate employee ID or email
    const existingTeacher = await Teacher.findOne({
      where: {
        [Op.or]: [{ employeeId }, { email }]
      }
    });
    
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: existingTeacher.employeeId === employeeId
          ? 'Employee ID already exists'
          : 'Email already exists'
      });
    }
    
    const teacher = await Teacher.create({
      employeeId,
      name,
      email,
      password: teacherPassword,
      phone,
      department: normalizedDepartments[0],
      departments: normalizedDepartments,
      qualification,
      priority: priority || 'FACULTY'
    });
    
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacher,
      credentials: {
        username: email,
        password: teacherPassword,
        role: 'teacher',
        isAutoGenerated: !password
      }
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating teacher',
      error: error.message
    });
  }
};

/**
 * @desc    Update teacher
 * @route   PUT /api/admin/teachers/:id
 * @access  Private/Admin
 */
const updateTeacher = async (req, res) => {
  try {
    const { employeeId, name, email, phone, department, departments, qualification, isActive, priority } = req.body;
    
    const teacher = await Teacher.findByPk(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    // Check for duplicate employee ID
    if (employeeId && employeeId !== teacher.employeeId) {
      const existingTeacher = await Teacher.findOne({ where: { employeeId } });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }
    
    // Check for duplicate email
    if (email && email !== teacher.email) {
      const existingTeacher = await Teacher.findOne({ where: { email } });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    // Validate priority before updating
    if (priority && !TEACHER_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Must be one of: ${TEACHER_PRIORITIES.join(', ')}`
      });
    }

    if (priority && priority !== 'CLASS_COORDINATOR') {
      const coordinatedClasses = await Class.count({
        where: { classCoordinatorId: teacher.id }
      });

      if (coordinatedClasses > 0) {
        return res.status(400).json({
          success: false,
          message: 'This teacher is assigned as class coordinator. Reassign their classes before changing the role.'
        });
      }
    }

    if (department !== undefined || departments !== undefined) {
      const normalizedDepartments = normalizeTeacherDepartments(departments ?? department);

      if (normalizedDepartments.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one department is required'
        });
      }

      teacher.departments = normalizedDepartments;
      teacher.department = normalizedDepartments[0];
    }

    // Update fields
    if (employeeId) teacher.employeeId = employeeId;
    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (phone !== undefined) teacher.phone = phone;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (isActive !== undefined) teacher.isActive = isActive;
    if (priority) teacher.priority = priority;
    
    // Explicitly specify fields to save – avoids issues with defaultScope
    // excluding password, which can cause validation errors on save()
    await teacher.save({
      fields: ['employeeId', 'name', 'email', 'phone', 'department', 'departments', 'qualification', 'isActive', 'priority']
    });
    
    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating teacher',
      error: error.message
    });
  }
};

/**
 * @desc    Delete teacher
 * @route   DELETE /api/admin/teachers/:id
 * @access  Private/Admin
 */
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    // Check if teacher is assigned to any subjects
    const assignedSubjects = await Subject.count({
      where: buildTeacherSubjectWhere(req.params.id)
    });
    
    if (assignedSubjects > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete teacher. Teacher is assigned to ${assignedSubjects} subject(s). Please reassign subjects first.`
      });
    }

    const coordinatedClasses = await Class.count({
      where: { classCoordinatorId: req.params.id }
    });

    if (coordinatedClasses > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete teacher. Teacher is assigned as class coordinator for ${coordinatedClasses} class(es).`
      });
    }
    
    await teacher.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting teacher',
      error: error.message
    });
  }
};

/**
 * @desc    Get subjects assigned to teacher
 * @route   GET /api/admin/teachers/:id/subjects
 * @access  Private/Admin
 */
const getTeacherSubjects = async (req, res) => {
  try {
    const theorySubjects = await Subject.findAll({
      where: buildTeacherTypeWhere(req.params.id, 'theory'),
      include: [{ model: Class, as: 'class', attributes: ['name', 'department', 'semester'] }]
    });
    
    const labSubjects = await Subject.findAll({
      where: buildTeacherTypeWhere(req.params.id, 'lab'),
      include: [{ model: Class, as: 'class', attributes: ['name', 'department', 'semester'] }]
    });
    
    res.status(200).json({
      success: true,
      data: {
        theory: theorySubjects,
        lab: labSubjects
      }
    });
  } catch (error) {
    console.error('Get teacher subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
};

/**
 * @desc    Reset teacher password
 * @route   PUT /api/admin/teachers/:id/reset-password
 * @access  Private/Admin
 */
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    
    const teacher = await Teacher.findByPk(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    teacher.password = newPassword;
    await teacher.save();
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherSubjects,
  resetPassword
};
