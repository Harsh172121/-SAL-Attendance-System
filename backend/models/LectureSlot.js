/**
 * SAL Education - Lecture Slot Model
 * 
 * This model stores faculty timetable / lecture slots.
 * VIVA NOTE: Each slot represents a recurring weekly lecture.
 * The system uses this to auto-detect the current lecture
 * when a teacher starts attendance marking.
 * 
 * Key constraints:
 * - Faculty slots cannot overlap, except parallel lab batches of the same subject/class
 * - References subject, class, and batch from existing tables
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LectureSlot = sequelize.define('LectureSlot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  facultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id'
    },
    validate: {
      notNull: { msg: 'Faculty reference is required' }
    }
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    },
    validate: {
      notNull: { msg: 'Subject reference is required' }
    }
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    },
    validate: {
      notNull: { msg: 'Class reference is required' }
    }
  },
  batchId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'batches',
      key: 'id'
    }
  },
  classroomId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'classrooms',
      key: 'id'
    },
    validate: {
      isInt: { msg: 'Classroom reference must be a valid number' }
    }
  },
  type: {
    type: DataTypes.ENUM('theory', 'lab'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Lecture type is required' },
      isIn: {
        args: [['theory', 'lab']],
        msg: 'Type must be theory or lab'
      }
    }
  },
  dayOfWeek: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Day of week is required' }
    }
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      notNull: { msg: 'Start time is required' }
    }
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      notNull: { msg: 'End time is required' }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'lecture_slots',
  timestamps: true,
  indexes: [
    { fields: ['facultyId', 'dayOfWeek'] },
    { fields: ['classId'] },
    { fields: ['subjectId'] }
  ]
});

module.exports = LectureSlot;
