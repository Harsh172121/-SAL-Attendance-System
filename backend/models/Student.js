/**
 * SAL Education - Student Model
 * 
 * This model handles Student users.
 * VIVA NOTE: Students are assigned to a class and optionally a batch.
 * Batch assignment is required for lab attendance.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  enrollmentNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Enrollment number is required' }
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name is required' },
      len: { args: [1, 100], msg: 'Name cannot exceed 100 characters' }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide a valid email' },
      notEmpty: { msg: 'Email is required' }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
      len: { args: [6, 255], msg: 'Password must be at least 6 characters' }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    },
    validate: {
      notNull: { msg: 'Class assignment is required' }
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
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'student',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'students',
  timestamps: true,
  indexes: [
    {
      fields: ['classId', 'batchId']
    }
  ],
  hooks: {
    /**
     * Pre-save hook to hash password
     */
    beforeCreate: async (student) => {
      if (student.password) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(student.password, salt);
      }
    },
    beforeUpdate: async (student) => {
      if (student.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(student.password, salt);
      }
    }
  },
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  scopes: {
    withPassword: {
      attributes: { exclude: [] }
    }
  }
});

/**
 * Method to compare passwords
 */
Student.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = Student;
