/**
 * SAL Education - Subject Controller
 *
 * Handles CRUD operations for Subjects.
 * VIVA NOTE: Subjects are FULLY DYNAMIC with:
 * - Three types: Theory, Lab, Theory+Lab
 * - Separate faculty assignment for theory and lab
 * - Multi-class assignment via junction table
 */

const { Op } = require('sequelize');
const { Subject, Class, Teacher } = require('../models');
const {
  normalizeTeacherIds,
  getAssignedTeacherIds,
  buildTeacherSubjectWhere
} = require('../utils/subjectFaculty');

const subjectIncludes = [
  { model: Teacher, as: 'theoryFaculty', attributes: ['name', 'employeeId', 'email', 'department', 'departments'] },
  { model: Teacher, as: 'labFaculty', attributes: ['name', 'employeeId', 'email', 'department', 'departments'] },
  { model: Class, as: 'classes', attributes: ['id', 'name', 'department', 'semester'] }
];

// Backward-compat: inject classIds / class / classId into a subject JSON object
const enrichSubjectJson = (subjectJson) => {
  const classes = subjectJson.classes || [];
  subjectJson.classIds = classes.map(c => c.id);
  subjectJson.class = classes[0] || null;
  subjectJson.classId = subjectJson.class?.id || null;
  return subjectJson;
};

const hasOwn = (payload, key) => Object.prototype.hasOwnProperty.call(payload, key);

const createControllerError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureTeachersExist = async (teacherIds, label) => {
  if (teacherIds.length === 0) {
    return;
  }

  const count = await Teacher.count({ where: { id: teacherIds } });
  if (count !== teacherIds.length) {
    throw createControllerError(404, `${label} teacher selection contains an invalid teacher`);
  }
};

const resolveFacultyAssignments = async (payload, existingSubject = null) => {
  const nextType = payload.type || existingSubject?.type;
  const currentTheoryIds = existingSubject ? getAssignedTeacherIds(existingSubject, 'theory') : [];
  const currentLabIds = existingSubject ? getAssignedTeacherIds(existingSubject, 'lab') : [];

  const theoryInputProvided = hasOwn(payload, 'theoryFacultyIds') || hasOwn(payload, 'theoryFacultyId');
  const labInputProvided = hasOwn(payload, 'labFacultyIds') || hasOwn(payload, 'labFacultyId');

  const theoryFacultyIds = nextType === 'lab'
    ? []
    : normalizeTeacherIds(
      theoryInputProvided
        ? payload.theoryFacultyIds ?? payload.theoryFacultyId
        : currentTheoryIds
    );

  const labFacultyIds = nextType === 'theory'
    ? []
    : normalizeTeacherIds(
      labInputProvided
        ? payload.labFacultyIds ?? payload.labFacultyId
        : currentLabIds
    );

  if ((nextType === 'theory' || nextType === 'theory+lab') && theoryFacultyIds.length === 0) {
    throw createControllerError(400, 'At least one theory teacher is required for this subject');
  }

  if ((nextType === 'lab' || nextType === 'theory+lab') && labFacultyIds.length === 0) {
    throw createControllerError(400, 'At least one lab teacher is required for this subject');
  }

  await ensureTeachersExist(theoryFacultyIds, 'Theory');
  await ensureTeachersExist(labFacultyIds, 'Lab');

  return {
    theoryFacultyId: theoryFacultyIds[0] || null,
    theoryFacultyIds,
    labFacultyId: labFacultyIds[0] || null,
    labFacultyIds
  };
};

const loadSubjectWithAssociations = (subjectId) => Subject.findByPk(subjectId, {
  include: subjectIncludes
});

/**
 * @desc    Get all subjects
 * @route   GET /api/admin/subjects
 * @access  Private/Admin
 */
const getAllSubjects = async (req, res) => {
  try {
    const { classId, type, isActive, teacherId } = req.query;

    const where = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (teacherId) Object.assign(where, buildTeacherSubjectWhere(teacherId));

    const include = [...subjectIncludes];

    // Filter by classId through the junction table
    if (classId) {
      const classInclude = include.find(i => i.model === Class && i.as === 'classes');
      if (classInclude) {
        classInclude.where = { id: Number(classId) };
        classInclude.required = true;
      }
    }

    const subjects = await Subject.findAll({
      where,
      include,
      attributes: ['id', 'code', 'name', 'type', 'theoryFacultyId', 'labFacultyId', 'theoryFacultyIds', 'labFacultyIds', 'credits', 'isActive', 'createdAt', 'updatedAt'],
      order: [['code', 'ASC']]
    });

    const enrichedSubjects = subjects.map(s => enrichSubjectJson(s.toJSON()));

    res.status(200).json({
      success: true,
      count: enrichedSubjects.length,
      data: enrichedSubjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
};

/**
 * @desc    Get single subject by ID
 * @route   GET /api/admin/subjects/:id
 * @access  Private/Admin
 */
const getSubjectById = async (req, res) => {
  try {
    const subject = await loadSubjectWithAssociations(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const subjectJson = enrichSubjectJson(subject.toJSON());

    res.status(200).json({
      success: true,
      data: subjectJson
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: 'Error fetching subject',
      error: error.message
    });
  }
};

/**
 * @desc    Create new subject
 * @route   POST /api/admin/subjects
 * @access  Private/Admin
 */
const createSubject = async (req, res) => {
  try {
    let { code, name, type, classIds, credits } = req.body;

    // Normalize classIds to array
    if (!classIds) classIds = [];
    if (!Array.isArray(classIds)) {
      classIds = [classIds];
    }
    classIds = classIds.map(Number).filter(id => !isNaN(id) && id > 0);

    // Validate required fields
    if (!code || !name || !type || classIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject code, name, type, and at least one class'
      });
    }

    // Validate type
    const validTypes = ['theory', 'lab', 'theory+lab'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject type. Must be theory, lab, or theory+lab'
      });
    }

    // Check if classes exist
    const classesCount = await Class.count({ where: { id: classIds } });
    if (classesCount !== classIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more classes not found'
      });
    }

    const facultyAssignments = await resolveFacultyAssignments(req.body);

    // Check for duplicate subject code
    const existingSubject = await Subject.findOne({ where: { code: code.toUpperCase() } });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists'
      });
    }

    const subject = await Subject.create({
      code: code.toUpperCase(),
      name,
      type,
      theoryFacultyId: facultyAssignments.theoryFacultyId,
      theoryFacultyIds: facultyAssignments.theoryFacultyIds,
      labFacultyId: facultyAssignments.labFacultyId,
      labFacultyIds: facultyAssignments.labFacultyIds,
      credits: credits || 3
    });

    // Create junction table entries
    await subject.setClasses(classIds);

    const subjectWithAssoc = await loadSubjectWithAssociations(subject.id);
    const subjectJson = enrichSubjectJson(subjectWithAssoc.toJSON());

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subjectJson
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Error creating subject',
      error: error.message
    });
  }
};

/**
 * @desc    Update subject
 * @route   PUT /api/admin/subjects/:id
 * @access  Private/Admin
 */
const updateSubject = async (req, res) => {
  try {
    let { code, name, type, classIds, credits, isActive } = req.body;

    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    if (type) {
      const validTypes = ['theory', 'lab', 'theory+lab'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subject type'
        });
      }
    }

    // Validate classes if being changed
    if (classIds !== undefined) {
      if (!Array.isArray(classIds)) {
        classIds = [classIds];
      }
      classIds = classIds.map(Number).filter(id => !isNaN(id) && id > 0);

      if (classIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one class is required'
        });
      }

      const classesCount = await Class.count({ where: { id: classIds } });
      if (classesCount !== classIds.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more classes not found'
        });
      }
    }

    // Check for duplicate code if being changed
    if (code && code.toUpperCase() !== subject.code) {
      const existingSubject = await Subject.findOne({ where: { code: code.toUpperCase() } });
      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject code already exists'
        });
      }
    }

    const facultyAssignments = await resolveFacultyAssignments(req.body, subject);

    // Update fields
    if (code) subject.code = code.toUpperCase();
    if (name) subject.name = name;
    if (type) subject.type = type;
    if (credits !== undefined) subject.credits = credits;
    if (isActive !== undefined) subject.isActive = isActive;

    subject.theoryFacultyId = facultyAssignments.theoryFacultyId;
    subject.theoryFacultyIds = facultyAssignments.theoryFacultyIds;
    subject.labFacultyId = facultyAssignments.labFacultyId;
    subject.labFacultyIds = facultyAssignments.labFacultyIds;

    await subject.save();

    // Update class associations if provided
    if (classIds !== undefined) {
      await subject.setClasses(classIds);
    }

    const subjectWithAssoc = await loadSubjectWithAssociations(subject.id);
    const subjectJson = enrichSubjectJson(subjectWithAssoc.toJSON());

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subjectJson
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Error updating subject',
      error: error.message
    });
  }
};

/**
 * @desc    Delete subject
 * @route   DELETE /api/admin/subjects/:id
 * @access  Private/Admin
 */
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    await subject.destroy();

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: 'Error deleting subject',
      error: error.message
    });
  }
};

/**
 * @desc    Assign faculty to subject
 * @route   PUT /api/admin/subjects/:id/assign-faculty
 * @access  Private/Admin
 */
const assignFaculty = async (req, res) => {
  try {
    const { theoryFacultyId, theoryFacultyIds, labFacultyId, labFacultyIds } = req.body;

    const subject = await Subject.findByPk(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const facultyAssignments = await resolveFacultyAssignments({
      type: subject.type,
      theoryFacultyId,
      theoryFacultyIds,
      labFacultyId,
      labFacultyIds
    }, subject);

    subject.theoryFacultyId = facultyAssignments.theoryFacultyId;
    subject.theoryFacultyIds = facultyAssignments.theoryFacultyIds;
    subject.labFacultyId = facultyAssignments.labFacultyId;
    subject.labFacultyIds = facultyAssignments.labFacultyIds;

    await subject.save();

    const subjectWithAssoc = await loadSubjectWithAssociations(subject.id);
    const subjectJson = enrichSubjectJson(subjectWithAssoc.toJSON());

    res.status(200).json({
      success: true,
      message: 'Faculty assigned successfully',
      data: subjectJson
    });
  } catch (error) {
    console.error('Assign faculty error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Error assigning faculty',
      error: error.message
    });
  }
};

/**
 * @desc    Get subjects by class
 * @route   GET /api/admin/subjects/class/:classId
 * @access  Private/Admin
 */
const getSubjectsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const subjects = await Subject.findAll({
      where: { isActive: true },
      include: [
        ...subjectIncludes,
        {
          model: Class,
          as: 'classes',
          where: { id: Number(classId) },
          required: true,
          attributes: ['id', 'name', 'department', 'semester']
        }
      ],
      order: [['code', 'ASC']]
    });

    const enrichedSubjects = subjects.map(s => enrichSubjectJson(s.toJSON()));

    res.status(200).json({
      success: true,
      count: enrichedSubjects.length,
      data: enrichedSubjects
    });
  } catch (error) {
    console.error('Get subjects by class error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignFaculty,
  getSubjectsByClass
};

