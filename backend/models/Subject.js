/**
 * SAL Education - Subject Model
 * 
 * This model represents academic subjects.
 * VIVA NOTE: Subjects can be of three types:
 * - Theory: Class-wise attendance
 * - Lab: Batch-wise attendance
 * - Theory+Lab: Both types of attendance
 * 
 * Each type can have separate faculty assigned.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const normalizeTeacherIds = (value) => {
  if (!value) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];

  return [...new Set(
    values
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item > 0)
  )];
};

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Subject code is required' }
    },
    set(value) {
      this.setDataValue('code', value.toUpperCase().trim());
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Subject name is required' },
      len: { args: [1, 100], msg: 'Subject name cannot exceed 100 characters' }
    }
  },
  type: {
    type: DataTypes.ENUM('theory', 'lab', 'theory+lab'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Subject type is required' },
      isIn: {
        args: [['theory', 'lab', 'theory+lab']],
        msg: 'Invalid subject type'
      }
    }
  },
  theoryFacultyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  labFacultyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  theoryFacultyIds: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      return normalizeTeacherIds(this.getDataValue('theoryFacultyIds'));
    },
    set(value) {
      const normalized = normalizeTeacherIds(value);
      this.setDataValue('theoryFacultyIds', normalized.length > 0 ? normalized : null);
    }
  },
  labFacultyIds: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      return normalizeTeacherIds(this.getDataValue('labFacultyIds'));
    },
    set(value) {
      const normalized = normalizeTeacherIds(value);
      this.setDataValue('labFacultyIds', normalized.length > 0 ? normalized : null);
    }
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    validate: {
      min: { args: [1], msg: 'Credits must be at least 1' },
      max: { args: [6], msg: 'Credits cannot exceed 6' }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'subjects',
  timestamps: true,
  indexes: [
    { fields: ['theoryFacultyId'] },
    { fields: ['labFacultyId'] }
  ]
});

module.exports = Subject;
