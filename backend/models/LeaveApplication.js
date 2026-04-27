/**
 * SAL Education - Leave Application Model
 * 
 * This model stores student leave requests.
 * VIVA NOTE: Workflow:
 * 1. Student submits leave → status = 'pending'
 * 2. Faculty/Admin reviews → status = 'approved' or 'rejected'
 * 3. If approved, attendance for those dates is marked as 'leave'
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LeaveApplication = sequelize.define('LeaveApplication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    },
    validate: {
      notNull: { msg: 'Student reference is required' }
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
  fromDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: 'From date is required' },
      isDate: { msg: 'Invalid date format' }
    }
  },
  toDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: 'To date is required' },
      isDate: { msg: 'Invalid date format' }
    }
  },
  totalDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: 'Total days is required' },
      min: { args: [1], msg: 'Total days must be at least 1' }
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Reason is required' },
      len: { args: [5, 1000], msg: 'Reason must be between 5 and 1000 characters' }
    }
  },
  sentTo: {
    type: DataTypes.ENUM('CLASS_COORDINATOR', 'HOD', 'BOTH'),
    allowNull: false,
    defaultValue: 'BOTH'
  },
  coordinatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  hodId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  approvedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  decisionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  adminNote: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'leave_applications',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['classId'] },
    { fields: ['sentTo'] },
    { fields: ['coordinatorId'] },
    { fields: ['hodId'] },
    { fields: ['status'] },
    { fields: ['fromDate', 'toDate'] }
  ]
});

module.exports = LeaveApplication;
