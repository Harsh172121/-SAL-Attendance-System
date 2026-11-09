/**
 * SAL Education - Classroom Controller
 *
 * Handles classroom master data used in lecture slot allocation.
 */

const { Classroom, sequelize } = require('../models');

const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.findAll({
      order: [['classroomNumber', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: classrooms.length,
      data: classrooms
    });
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching classrooms',
      error: error.message
    });
  }
};

const createClassroom = async (req, res) => {
  try {
    const classroomNumber = Number(req.body.classroomNumber);

    if (!Number.isInteger(classroomNumber) || classroomNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid classroom number'
      });
    }

    const existingClassroom = await Classroom.findOne({
      where: { classroomNumber }
    });

    if (existingClassroom) {
      return res.status(400).json({
        success: false,
        message: 'This classroom number already exists'
      });
    }

    const classroom = await Classroom.create({ classroomNumber });

    res.status(201).json({
      success: true,
      message: 'Classroom added successfully',
      data: classroom
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating classroom',
      error: error.message
    });
  }
};

const deleteClassrooms = async (req, res) => {
  const submittedIds = req.body?.ids;

  if (!Array.isArray(submittedIds) || submittedIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Select at least one classroom to delete'
    });
  }

  const ids = [...new Set(submittedIds.map(Number))];
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    return res.status(400).json({
      success: false,
      message: 'Classroom IDs must be positive integers'
    });
  }

  try {
    const deletedIds = await sequelize.transaction(async (transaction) => {
      const classrooms = await Classroom.findAll({
        where: { id: ids },
        attributes: ['id'],
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      const foundIds = classrooms.map((classroom) => classroom.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        const error = new Error('Some selected classrooms no longer exist. Refresh the list and try again.');
        error.statusCode = 404;
        throw error;
      }

      await Classroom.destroy({ where: { id: ids }, transaction });
      return ids;
    });

    res.status(200).json({
      success: true,
      message: 'Classrooms deleted successfully',
      count: deletedIds.length,
      data: { deletedIds }
    });
  } catch (error) {
    console.error('Delete classrooms error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Error deleting classrooms',
      error: error.message
    });
  }
};

module.exports = {
  getAllClassrooms,
  createClassroom,
  deleteClassrooms
};
