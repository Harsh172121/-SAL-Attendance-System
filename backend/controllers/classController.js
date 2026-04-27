/**
 * SAL Education - Class Controller
 *
 * Handles CRUD operations for Classes.
 * VIVA NOTE: Classes represent academic divisions like CE-5A, IT-6B.
 * Only Admin can manage classes.
 */

const { Class, Batch, Student, Subject, Teacher } = require('../models');
const { Op } = require('sequelize');
const { teacherHandlesDepartment } = require('../utils/teacherDepartments');

const getClassCoordinator = async (classCoordinatorId, department) => {
  if (!classCoordinatorId) {
    return null;
  }

  const coordinator = await Teacher.findByPk(classCoordinatorId);

  if (!coordinator || !coordinator.isActive) {
    throw new Error('Selected class coordinator was not found or is inactive');
  }

  if (coordinator.priority !== 'CLASS_COORDINATOR') {
    throw new Error('Selected teacher must have the CLASS_COORDINATOR role');
  }

  if (department && !teacherHandlesDepartment(coordinator, department)) {
    throw new Error('Class coordinator must belong to the same department as the class');
  }

  return coordinator;
};

/**
 * @desc    Get all classes
 * @route   GET /api/admin/classes
 * @access  Private/Admin
 */
const getAllClasses = async (req, res) => {
  try {
    const { department, semester, isActive } = req.query;

    // Build filter object
    const where = {};
    if (department) where.department = department;
    if (semester) where.semester = parseInt(semester);
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const classes = await Class.findAll({
      where,
      order: [['department', 'ASC'], ['semester', 'ASC'], ['name', 'ASC']],
      include: [
        {
          model: Student,
          as: 'students',
          attributes: ['id']
        },
        {
          model: Teacher,
          as: 'classCoordinator',
          attributes: ['id', 'name', 'employeeId', 'priority', 'department', 'departments']
        }
      ]
    });

    // Add student count
    const classesWithCount = classes.map(c => ({
      ...c.toJSON(),
      studentCount: c.students ? c.students.length : 0
    }));

    res.status(200).json({
      success: true,
      count: classesWithCount.length,
      data: classesWithCount
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: error.message
    });
  }
};

/**
 * @desc    Get single class by ID
 * @route   GET /api/admin/classes/:id
 * @access  Private/Admin
 */
const getClassById = async (req, res) => {
  try {
    const classData = await Class.findByPk(req.params.id, {
      include: [
        { model: Batch, as: 'batches' },
        { model: Student, as: 'students', attributes: ['id'] },
        { model: Teacher, as: 'classCoordinator', attributes: ['id', 'name', 'employeeId', 'priority', 'department', 'departments'] }
      ]
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const result = {
      ...classData.toJSON(),
      studentCount: classData.students ? classData.students.length : 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching class',
      error: error.message
    });
  }
};

/**
 * @desc    Create new class
 * @route   POST /api/admin/classes
 * @access  Private/Admin
 */
const createClass = async (req, res) => {
  try {
    const { name, department, semester, academicYear, classCoordinatorId } = req.body;

    // Validate required fields
    if (!name || !department || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, department, and semester'
      });
    }

    // Check for duplicate
    const existingClass = await Class.findOne({
      where: { name, department, semester }
    });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Class already exists with same name, department, and semester'
      });
    }

    let coordinator = null;
    try {
      coordinator = await getClassCoordinator(classCoordinatorId, department);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    const newClass = await Class.create({
      name,
      department,
      semester,
      academicYear: academicYear || '2025-26',
      classCoordinatorId: coordinator?.id || null
    });

    const createdClass = await Class.findByPk(newClass.id, {
      include: [
        { model: Teacher, as: 'classCoordinator', attributes: ['id', 'name', 'employeeId', 'priority', 'department', 'departments'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: createdClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating class',
      error: error.message
    });
  }
};

/**
 * @desc    Update class
 * @route   PUT /api/admin/classes/:id
 * @access  Private/Admin
 */
const updateClass = async (req, res) => {
  try {
    const { name, department, semester, academicYear, isActive, classCoordinatorId } = req.body;

    const classData = await Class.findByPk(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const nextDepartment = department || classData.department;
    if (classCoordinatorId !== undefined) {
      try {
        const coordinator = await getClassCoordinator(classCoordinatorId || null, nextDepartment);
        classData.classCoordinatorId = coordinator?.id || null;
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError.message
        });
      }
    } else if (department && classData.classCoordinatorId) {
      try {
        await getClassCoordinator(classData.classCoordinatorId, nextDepartment);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: `${validationError.message}. Reassign or clear the class coordinator first.`
        });
      }
    }

    // Update fields
    if (name) classData.name = name;
    if (department) classData.department = department;
    if (semester) classData.semester = semester;
    if (academicYear) classData.academicYear = academicYear;
    if (isActive !== undefined) classData.isActive = isActive;

    await classData.save();

    const updatedClass = await Class.findByPk(classData.id, {
      include: [
        { model: Teacher, as: 'classCoordinator', attributes: ['id', 'name', 'employeeId', 'priority', 'department', 'departments'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating class',
      error: error.message
    });
  }
};

/**
 * @desc    Delete class
 * @route   DELETE /api/admin/classes/:id
 * @access  Private/Admin
 */
const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findByPk(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check for dependencies
    const studentCount = await Student.count({ where: { classId: req.params.id } });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete class. ${studentCount} students are assigned to this class.`
      });
    }

    // Count associated subjects via junction table
    const associatedSubjects = await classData.getSubjects();
    if (associatedSubjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete class. ${associatedSubjects.length} subjects are assigned to this class.`
      });
    }

    // Delete associated batches
    await Batch.destroy({ where: { classId: req.params.id } });

    // Delete the class
    await classData.destroy();

    res.status(200).json({
      success: true,
      message: 'Class and associated batches deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting class',
      error: error.message
    });
  }
};

/**
 * @desc    Get students by class
 * @route   GET /api/admin/classes/:id/students
 * @access  Private/Admin
 */
const getStudentsByClass = async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { classId: req.params.id },
      include: [{ model: Batch, as: 'batch', attributes: ['id', 'name'] }],
      order: [['enrollmentNo', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Get students by class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getStudentsByClass
};
