/* global require, module */
/**
 * SAL Education - Attendance Model
 * 
 * This model stores attendance records.
 * VIVA NOTE: Critical attendance logic:
 * - Theory attendance: Class-based, one record per student per day per subject
 * - Lab attendance: Batch-based, batchId is mandatory
 * - Prevents duplicate attendance entries
 */

const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: 'Date is required' },
      isDate: { msg: 'Invalid date format' }
    }
  },
  type: {
    type: DataTypes.ENUM('theory', 'lab'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Attendance type is required' },
      isIn: {
        args: [['theory', 'lab']],
        msg: 'Invalid attendance type'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'leave'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Status is required' },
      isIn: {
        args: [['present', 'absent', 'leave']],
        msg: 'Invalid status'
      }
    }
  },
  markedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id'
    },
    validate: {
      notNull: { msg: 'Marked by teacher reference is required' }
    }
  },
  slotId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'lecture_slots',
      key: 'id'
    }
  },
  remarks: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: { args: [0, 200], msg: 'Remarks cannot exceed 200 characters' }
    }
  }
}, {
  tableName: 'attendances',
  timestamps: true,
  indexes: [
    { fields: ['studentId', 'subjectId', 'classId', 'date'] },
    { fields: ['subjectId', 'date'] },
    { fields: ['studentId', 'subjectId'] },
    { fields: ['classId', 'date'] },
    { fields: ['slotId', 'date'] }
  ]
});

/**
 * Static method to check if attendance already exists
 */
Attendance.checkDuplicate = async function(studentId, subjectId, date, type, batchId) {
  const whereClause = {
    studentId,
    subjectId,
    date,
    type
  };
  
  if (type === 'lab' && batchId) {
    whereClause.batchId = batchId;
  }
  
  const existing = await this.findOne({ where: whereClause });
  return existing;
};

/**
 * Static method to get attendance summary for a student
 */
Attendance.getStudentSummary = async function(studentId, subjectId) {
  const records = await this.findAll({ 
    where: { studentId, subjectId }
  });
  
  const summary = {
    theory: { present: 0, total: 0, percentage: 0 },
    lab: { present: 0, total: 0, percentage: 0 }
  };
  
  records.forEach(record => {
    if (record.type === 'theory') {
      summary.theory.total++;
      if (record.status === 'present') summary.theory.present++;
    } else {
      summary.lab.total++;
      if (record.status === 'present') summary.lab.present++;
    }
  });
  
  // Calculate percentages
  summary.theory.percentage = summary.theory.total > 0
    ? Math.round((summary.theory.present / summary.theory.total) * 100)
    : 0;
  summary.lab.percentage = summary.lab.total > 0
    ? Math.round((summary.lab.present / summary.lab.total) * 100)
    : 0;
  
  return summary;
};

module.exports = Attendance;
