/**
 * SAL Education - Classroom Controller
 *
 * Handles classroom master data used in lecture slot allocation.
 */

const { Classroom } = require('../models');

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

module.exports = {
  getAllClassrooms,
  createClassroom
};
