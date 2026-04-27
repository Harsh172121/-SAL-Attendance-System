/**
 * SAL Education - Lecture Log Model
 * 
 * Stores the specific topic covered during a lecture slot on a given date.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LectureLog = sequelize.define('LectureLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lecture_slots',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  topicCovered: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Topic covered is required' },
      len: { args: [2, 500], msg: 'Topic must be between 2 and 500 characters' }
    }
  },
  markedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id'
    }
  }
}, {
  tableName: 'lecture_logs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slotId', 'date'],
      name: 'unique_slot_date_log'
    }
  ]
});

module.exports = LectureLog;
