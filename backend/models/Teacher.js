/**
 * SAL Education - Teacher/Faculty Model
 * 
 * This model handles Teacher/Faculty users.
 * VIVA NOTE: Teachers can mark attendance for their assigned subjects.
 * They can be assigned to theory, lab, or both for a subject.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const {
  normalizeTeacherDepartments
} = require('../utils/teacherDepartments');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Employee ID is required' }
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
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Department is required' }
    }
  },
  departments: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      const normalized = normalizeTeacherDepartments(this.getDataValue('departments'));
      if (normalized.length > 0) {
        return normalized;
      }

      return normalizeTeacherDepartments(this.getDataValue('department'));
    },
    set(value) {
      const normalized = normalizeTeacherDepartments(value);
      this.setDataValue('departments', normalized.length > 0 ? normalized : null);

      if (normalized.length > 0) {
        this.setDataValue('department', normalized[0]);
      }
    }
  },
  qualification: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'teacher',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'CLASS_COORDINATOR'),
    defaultValue: 'FACULTY',
    allowNull: false,
    comment: 'Teacher designation/priority level within the institution'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'teachers',
  timestamps: true,
  hooks: {
    /**
     * Pre-save hook to hash password
     */
    beforeCreate: async (teacher) => {
      if (teacher.password) {
        const salt = await bcrypt.genSalt(10);
        teacher.password = await bcrypt.hash(teacher.password, salt);
      }
    },
    beforeUpdate: async (teacher) => {
      if (teacher.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        teacher.password = await bcrypt.hash(teacher.password, salt);
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
Teacher.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = Teacher;
