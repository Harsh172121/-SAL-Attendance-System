/**
 * SAL Education - Batch Controller
 * 
 * Handles CRUD operations for Batches.
 * VIVA NOTE: Batches are subdivisions of a class for lab sessions.
 * Lab attendance is marked batch-wise, not class-wise.
 */

const { Batch, Class, Student } = require('../models');

/**
 * @desc    Get all batches
 * @route   GET /api/admin/batches
 * @access  Private/Admin
 */
const getAllBatches = async (req, res) => {
  try {
    const { classId, isActive } = req.query;
    
    // Build filter object
    const where = {};
    if (classId) where.classId = classId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    const batches = await Batch.findAll({
      where,
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'department', 'semester'] },
        { model: Student, as: 'students', attributes: ['id'] }
      ],
      order: [['classId', 'ASC'], ['name', 'ASC']]
    });
    
    // Add student count
    const batchesWithCount = batches.map(b => ({
      ...b.toJSON(),
      studentCount: b.students ? b.students.length : 0
    }));
    
    res.status(200).json({
      success: true,
      count: batchesWithCount.length,
      data: batchesWithCount
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: error.message
    });
  }
};

/**
 * @desc    Get single batch by ID
 * @route   GET /api/admin/batches/:id
 * @access  Private/Admin
 */
const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id, {
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'department', 'semester'] },
        { model: Student, as: 'students', attributes: ['id', 'enrollmentNo', 'name', 'email'] }
      ]
    });
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batch',
      error: error.message
    });
  }
};

/**
 * @desc    Create new batch
 * @route   POST /api/admin/batches
 * @access  Private/Admin
 */
const createBatch = async (req, res) => {
  try {
    const { name, classId, description } = req.body;
    
    // Validate required fields
    if (!name || !classId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide batch name and class ID'
      });
    }
    
    // Check if class exists
    const classExists = await Class.findByPk(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check for duplicate batch in same class
    const existingBatch = await Batch.findOne({ where: { name, classId } });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'Batch with this name already exists in the class'
      });
    }
    
    const batch = await Batch.create({
      name,
      classId,
      description
    });
    
    // Reload with class details
    await batch.reload({
      include: [{ model: Class, as: 'class', attributes: ['id', 'name', 'department', 'semester'] }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: batch
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating batch',
      error: error.message
    });
  }
};

/**
 * @desc    Update batch
 * @route   PUT /api/admin/batches/:id
 * @access  Private/Admin
 */
const updateBatch = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    const batch = await Batch.findByPk(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // Check for duplicate name if name is being changed
    if (name && name !== batch.name) {
      const existingBatch = await Batch.findOne({ where: { name, classId: batch.classId } });
      if (existingBatch) {
        return res.status(400).json({
          success: false,
          message: 'Batch with this name already exists in the class'
        });
      }
    }
    
    // Update fields
    if (name) batch.name = name;
    if (description !== undefined) batch.description = description;
    if (isActive !== undefined) batch.isActive = isActive;
    
    await batch.save();
    await batch.reload({
      include: [{ model: Class, as: 'class', attributes: ['id', 'name', 'department', 'semester'] }]
    });
    
    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: batch
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating batch',
      error: error.message
    });
  }
};

/**
 * @desc    Delete batch
 * @route   DELETE /api/admin/batches/:id
 * @access  Private/Admin
 */
const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByPk(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // Update students to remove batch reference
    await Student.update(
      { batchId: null },
      { where: { batchId: req.params.id } }
    );
    
    await batch.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully. Students have been unassigned from this batch.'
    });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting batch',
      error: error.message
    });
  }
};

/**
 * @desc    Get batches by class ID
 * @route   GET /api/admin/batches/class/:classId
 * @access  Private/Admin
 */
const getBatchesByClass = async (req, res) => {
  try {
    const batches = await Batch.findAll({
      where: { classId: req.params.classId, isActive: true },
      include: [{ model: Student, as: 'students', attributes: ['id'] }],
      order: [['name', 'ASC']]
    });
    
    const batchesWithCount = batches.map(b => ({
      ...b.toJSON(),
      studentCount: b.students ? b.students.length : 0
    }));
    
    res.status(200).json({
      success: true,
      count: batchesWithCount.length,
      data: batchesWithCount
    });
  } catch (error) {
    console.error('Get batches by class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: error.message
    });
  }
};

/**
 * @desc    Get students in a batch
 * @route   GET /api/admin/batches/:id/students
 * @access  Private/Admin
 */
const getStudentsByBatch = async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { batchId: req.params.id },
      include: [{ model: Class, as: 'class', attributes: ['id', 'name', 'department'] }],
      order: [['enrollmentNo', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Get students by batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

module.exports = {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchesByClass,
  getStudentsByBatch
};
