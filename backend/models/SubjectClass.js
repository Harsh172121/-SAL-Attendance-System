/**
 * SAL Education - Subject-Class Junction Model
 *
 * Many-to-many join table between subjects and classes.
 * VIVA NOTE: A subject can be assigned to multiple classes,
 * and a class can have multiple subjects.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SubjectClass = sequelize.define('SubjectClass', {
  subjectId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'subjects',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  classId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'classes',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'subject_classes',
  timestamps: false,
  // The composite primary key already indexes subjectId as its leading column.
  // Keep the reverse lookup index for classId only.
  indexes: [{ fields: ['classId'] }]
});

module.exports = SubjectClass;

