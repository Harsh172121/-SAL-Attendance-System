/* global require, module */
/**
 * SAL Education - Lecture Slot Controller
 *
 * Handles CRUD operations for faculty lecture timetable slots.
 * VIVA NOTE: Key features:
 * - Faculty can create/edit/delete their own lecture slots
 * - System prevents conflicting overlaps, while allowing parallel lab batches
 *   to share both faculty time and classroom when they are the same subject/class
 * - Auto-detects current lecture based on day and time
 */

const { Op } = require('sequelize');
const { LectureSlot, Subject, Class, Batch, Classroom, ProxyAssignment } = require('../models');
const { isTeacherAssigned } = require('../utils/subjectFaculty');

const lectureSlotIncludes = [
  { model: Subject, as: 'subject', attributes: ['id', 'code', 'name', 'type'] },
  { model: Class, as: 'class', attributes: ['id', 'name', 'department', 'semester'] },
  { model: Batch, as: 'batch', attributes: ['id', 'name'] },
  { model: Classroom, as: 'classroom', attributes: ['id', 'classroomNumber'] }
];

const buildOverlapWhere = ({ facultyId, dayOfWeek, startTime, endTime, excludeId }) => {
  const where = {
    facultyId,
    dayOfWeek,
    isActive: true,
    startTime: { [Op.lt]: endTime },
    endTime: { [Op.gt]: startTime }
  };

  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  return where;
};

const canShareParallelLabWindow = (existingSlot, incomingSlot) => (
  existingSlot.type === 'lab' &&
  incomingSlot.type === 'lab' &&
  existingSlot.subjectId === incomingSlot.subjectId &&
  existingSlot.classId === incomingSlot.classId &&
  existingSlot.batchId &&
  incomingSlot.batchId &&
  existingSlot.batchId !== incomingSlot.batchId
);

const findBlockingOverlap = async ({ facultyId, dayOfWeek, startTime, endTime, excludeId, nextSlot }) => {
  const overlappingSlots = await LectureSlot.findAll({
    where: buildOverlapWhere({ facultyId, dayOfWeek, startTime, endTime, excludeId })
  });

  return overlappingSlots.find((existingSlot) => !canShareParallelLabWindow(existingSlot, nextSlot)) || null;
};

const findClassroomClash = async ({ classroomId, dayOfWeek, startTime, endTime, excludeId, nextSlot }) => {
  if (!classroomId) {
    return null;
  }

  const where = {
    classroomId,
    dayOfWeek,
    isActive: true,
    startTime: { [Op.lt]: endTime },
    endTime: { [Op.gt]: startTime }
  };

  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const overlappingSlots = await LectureSlot.findAll({
    where,
    include: lectureSlotIncludes
  });

  return overlappingSlots.find((existingSlot) => !canShareParallelLabWindow(existingSlot, nextSlot)) || null;
};

const validateSubjectClassBatch = async ({ subjectId, classId, batchId, type }) => {
  const subject = await Subject.findByPk(subjectId, {
    include: [{ model: Class, as: 'classes', attributes: ['id'] }]
  });

  if (!subject) {
    return { error: { status: 404, message: 'Subject not found' } };
  }

  const subjectClassIds = (subject.classes || []).map(c => c.id);
  if (!subjectClassIds.includes(Number(classId))) {
    return {
      error: {
        status: 400,
        message: 'Selected subject does not belong to the selected class'
      }
    };
  }

  if (type === 'lab') {
    if (!batchId) {
      return { error: { status: 400, message: 'Batch ID is required for lab lecture slots' } };
    }

    const batch = await Batch.findOne({
      where: {
        id: batchId,
        classId,
        isActive: true
      }
    });

    if (!batch) {
      return {
        error: {
          status: 400,
          message: 'Selected batch does not belong to the selected class'
        }
      };
    }
  }

  return { subject };
};
/**
 * @desc    Create a new lecture slot
 * @route   POST /api/teacher/lecture-slots
 * @access  Private/Teacher
 */
const createSlot = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { subjectId, classId, batchId, classroomId, type, dayOfWeek, startTime, endTime } = req.body;

    // Validate required fields
    if (!subjectId || !classId || !classroomId || !type || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subjectId, classId, classroomId, type, dayOfWeek, startTime, and endTime'
      });
    }

    // Validate type
    if (!['theory', 'lab'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be theory or lab'
      });
    }

    // Validate time order
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const classroom = await Classroom.findByPk(classroomId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Selected classroom was not found'
      });
    }

    const relationValidation = await validateSubjectClassBatch({
      subjectId,
      classId,
      batchId: type === 'lab' ? Number(batchId) : null,
      type
    });
    if (relationValidation.error) {
      return res.status(relationValidation.error.status).json({
        success: false,
        message: relationValidation.error.message
      });
    }

    const { subject } = relationValidation;

    const isAuthorized = isTeacherAssigned(subject, type, facultyId);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `You are not assigned as ${type} faculty for this subject`
      });
    }

    const overlapping = await findBlockingOverlap({
      facultyId,
      dayOfWeek,
      startTime,
      endTime,
      nextSlot: {
        subjectId,
        classId,
        batchId: type === 'lab' ? Number(batchId) : null,
        type
      }
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: `Time slot overlaps with an existing slot on ${dayOfWeek} (${overlapping.startTime} - ${overlapping.endTime})`
      });
    }

    const classroomClash = await findClassroomClash({
      classroomId,
      dayOfWeek,
      startTime,
      endTime,
      nextSlot: {
        subjectId,
        classId,
        batchId: type === 'lab' ? Number(batchId) : null,
        type
      }
    });

    if (classroomClash) {
      return res.status(409).json({
        success: false,
        message: 'Classroom already assigned for this time slot. Please choose another classroom.'
      });
    }

    const slot = await LectureSlot.create({
      facultyId,
      subjectId,
      classId,
      batchId: type === 'lab' ? Number(batchId) : null,
      classroomId,
      type,
      dayOfWeek,
      startTime,
      endTime
    });

    // Fetch with associations for response
    const createdSlot = await LectureSlot.findByPk(slot.id, {
      include: [
        ...lectureSlotIncludes
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Lecture slot created successfully',
      data: createdSlot
    });
  } catch (error) {
    console.error('Create lecture slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lecture slot',
      error: error.message
    });
  }
};

/**
 * @desc    Get all lecture slots for the logged-in faculty
 * @route   GET /api/teacher/lecture-slots
 * @access  Private/Teacher
 */
const getMySlots = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const slots = await LectureSlot.findAll({
      where: { facultyId, isActive: true },
      include: lectureSlotIncludes,
      order: [
        ['dayOfWeek', 'ASC'],
        ['startTime', 'ASC']
      ]
    });

    // Group by day for timetable view
    const timetable = {};
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayOrder.forEach(day => { timetable[day] = []; });
    slots.forEach(slot => {
      timetable[slot.dayOfWeek].push(slot);
    });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
      timetable
    });
  } catch (error) {
    console.error('Get lecture slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lecture slots',
      error: error.message
    });
  }
};

/**
 * @desc    Get current active lecture slot based on day and time
 * @route   GET /api/teacher/lecture-slots/current
 * @access  Private/Teacher
 * 
 * VIVA NOTE: This is the core auto-detect feature.
 * Matches current day + time to find the active lecture slot.
 */
const getCurrentSlot = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS

    if (currentDay === 'Sunday') {
      return res.status(200).json({
        success: true,
        data: null,
        slots: [],
        message: 'No lectures scheduled on Sunday'
      });
    }

    const currentSlots = await LectureSlot.findAll({
      where: {
        facultyId,
        dayOfWeek: currentDay,
        isActive: true,
        startTime: { [Op.lte]: currentTime },
        endTime: { [Op.gte]: currentTime }
      },
      include: lectureSlotIncludes,
      order: [
        ['startTime', 'ASC'],
        ['batchId', 'ASC'],
        ['id', 'ASC']
      ]
    });

    const currentDate = now.toISOString().split('T')[0];
    const proxyAssignments = await ProxyAssignment.findAll({
      where: {
        proxyFacultyId: facultyId,
        date: currentDate
      },
      include: [
        {
          model: LectureSlot,
          as: 'slot',
          where: {
            dayOfWeek: currentDay,
            isActive: true,
            startTime: { [Op.lte]: currentTime },
            endTime: { [Op.gte]: currentTime }
          },
          include: lectureSlotIncludes
        }
      ]
    });

    proxyAssignments.forEach((assignment) => {
      if (assignment.slot) {
        currentSlots.push(assignment.slot);
      }
    });

    if (!currentSlots.length) {
      return res.status(200).json({
        success: true,
        data: null,
        slots: [],
        message: 'No lecture scheduled at this time'
      });
    }

    if (currentSlots.length > 1) {
      return res.status(200).json({
        success: true,
        data: null,
        slots: currentSlots,
        requiresSelection: true,
        message: 'Multiple lecture slots are active right now. Select the correct batch to start attendance.'
      });
    }

    res.status(200).json({
      success: true,
      data: currentSlots[0],
      slots: currentSlots,
      message: 'Current lecture found'
    });
  } catch (error) {
    console.error('Get current slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error detecting current lecture',
      error: error.message
    });
  }
};

/**
 * @desc    Update a lecture slot
 * @route   PUT /api/teacher/lecture-slots/:id
 * @access  Private/Teacher
 */
const updateSlot = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { id } = req.params;
    const { subjectId, classId, batchId, classroomId, type, dayOfWeek, startTime, endTime } = req.body;

    const slot = await LectureSlot.findByPk(id);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Lecture slot not found'
      });
    }

    if (slot.facultyId !== facultyId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own lecture slots'
      });
    }

    const updatedDay = dayOfWeek || slot.dayOfWeek;
    const updatedStart = startTime || slot.startTime;
    const updatedEnd = endTime || slot.endTime;
    const updatedClassroomId = classroomId || slot.classroomId;

    if (updatedStart >= updatedEnd) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const nextType = type || slot.type;
    const nextSubjectId = subjectId || slot.subjectId;
    const nextClassId = classId || slot.classId;
    const nextBatchId = nextType === 'lab' ? Number(batchId || slot.batchId) : null;

    if (!updatedClassroomId) {
      return res.status(400).json({
        success: false,
        message: 'Classroom is required for every lecture slot'
      });
    }

    const classroom = await Classroom.findByPk(updatedClassroomId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Selected classroom was not found'
      });
    }

    const relationValidation = await validateSubjectClassBatch({
      subjectId: nextSubjectId,
      classId: nextClassId,
      batchId: nextBatchId,
      type: nextType
    });
    if (relationValidation.error) {
      return res.status(relationValidation.error.status).json({
        success: false,
        message: relationValidation.error.message
      });
    }

    const { subject: nextSubject } = relationValidation;
    if (!isTeacherAssigned(nextSubject, nextType, facultyId)) {
      return res.status(403).json({
        success: false,
        message: `You are not assigned as ${nextType} faculty for this subject`
      });
    }

    const overlapping = await findBlockingOverlap({
      facultyId,
      dayOfWeek: updatedDay,
      startTime: updatedStart,
      endTime: updatedEnd,
      excludeId: id,
      nextSlot: {
        subjectId: nextSubjectId,
        classId: nextClassId,
        batchId: nextBatchId,
        type: nextType
      }
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: `Time slot overlaps with an existing slot on ${updatedDay} (${overlapping.startTime} - ${overlapping.endTime})`
      });
    }

    const classroomClash = await findClassroomClash({
      classroomId: updatedClassroomId,
      dayOfWeek: updatedDay,
      startTime: updatedStart,
      endTime: updatedEnd,
      excludeId: id,
      nextSlot: {
        subjectId: nextSubjectId,
        classId: nextClassId,
        batchId: nextBatchId,
        type: nextType
      }
    });

    if (classroomClash) {
      return res.status(409).json({
        success: false,
        message: 'Classroom already assigned for this time slot. Please choose another classroom.'
      });
    }

    await slot.update({
      subjectId: subjectId || slot.subjectId,
      classId: classId || slot.classId,
      batchId: nextBatchId,
      classroomId: updatedClassroomId,
      type: nextType,
      dayOfWeek: updatedDay,
      startTime: updatedStart,
      endTime: updatedEnd
    });

    const updatedSlot = await LectureSlot.findByPk(id, {
      include: [
        ...lectureSlotIncludes
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Lecture slot updated successfully',
      data: updatedSlot
    });
  } catch (error) {
    console.error('Update lecture slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lecture slot',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a lecture slot
 * @route   DELETE /api/teacher/lecture-slots/:id
 * @access  Private/Teacher
 */
const deleteSlot = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { id } = req.params;

    const slot = await LectureSlot.findByPk(id);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Lecture slot not found'
      });
    }

    if (slot.facultyId !== facultyId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own lecture slots'
      });
    }

    await slot.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Lecture slot deleted successfully'
    });
  } catch (error) {
    console.error('Delete lecture slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lecture slot',
      error: error.message
    });
  }
};

module.exports = {
  createSlot,
  getMySlots,
  getCurrentSlot,
  updateSlot,
  deleteSlot
};
