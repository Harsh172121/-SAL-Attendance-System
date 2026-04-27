/**
 * SAL Education - Batch Model
 * 
 * This model represents lab batches within a class.
 * VIVA NOTE: Batches are subdivisions of a class for lab sessions.
 * Lab attendance is marked batch-wise, not class-wise.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Batch = sequelize.define('Batch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Batch name is required' },
      len: { args: [1, 20], msg: 'Batch name cannot exceed 20 characters' }
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
  description: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: { args: [0, 200], msg: 'Description cannot exceed 200 characters' }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'batches',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'classId']
    }
  ]
});

module.exports = Batch;
