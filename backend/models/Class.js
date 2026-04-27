/**
 * SAL Education - Class Model
 * 
 * This model represents academic classes/divisions.
 * VIVA NOTE: A class represents a specific division like CE-5A, IT-6B
 * Each class can have multiple batches for lab sessions.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Class name is required' },
      len: { args: [1, 50], msg: 'Class name cannot exceed 50 characters' }
    }
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Department is required' },
      isIn: {
        args: [['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical']],
        msg: 'Invalid department'
      }
    }
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: 'Semester is required' },
      min: { args: [1], msg: 'Semester must be at least 1' },
      max: { args: [8], msg: 'Semester cannot exceed 8' }
    }
  },
  academicYear: {
    type: DataTypes.STRING(20),
    defaultValue: '2025-26'
  },
  classCoordinatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'classes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'department', 'semester']
    },
    {
      fields: ['classCoordinatorId']
    }
  ]
});

module.exports = Class;
