/**
 * SAL Education - Classroom Model
 *
 * Stores classroom numbers used for timetable allocation.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Classroom = sequelize.define('Classroom', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  classroomNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'classroom_number',
    validate: {
      notNull: { msg: 'Classroom number is required' },
      isInt: { msg: 'Classroom number must be an integer' },
      min: { args: [1], msg: 'Classroom number must be greater than 0' }
    }
  }
}, {
  tableName: 'classrooms',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['classroom_number']
    }
  ]
});

module.exports = Classroom;
