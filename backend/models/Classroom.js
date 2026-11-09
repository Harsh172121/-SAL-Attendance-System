/**
 * SAL Education - Classroom Model
 *
 * Stores classroom numbers used for timetable allocation.
 */

const { DataTypes } = require('sequelize');

function defineClassroom(sequelize) {
  if (!sequelize || typeof sequelize.define !== 'function') {
    throw new TypeError('defineClassroom requires a Sequelize instance');
  }

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
  });

  return Classroom;
}

module.exports = defineClassroom;
