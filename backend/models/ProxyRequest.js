/* global require, module */
/**
 * Proxy request model.
 * Stores faculty proxy requests that require HOD mediation.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProxyRequest = sequelize.define('ProxyRequest', {
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
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    }
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  originalFacultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  proxyFacultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  hodId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  reason: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  activeRequestKey: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1
  }
}, {
  tableName: 'proxy_requests',
  timestamps: true,
  indexes: [
    { fields: ['hodId', 'status'] },
    { fields: ['proxyFacultyId', 'status'] },
    { fields: ['slotId', 'date'] },
    {
      unique: true,
      fields: ['slotId', 'date', 'activeRequestKey'],
      name: 'unique_active_proxy_request'
    }
  ]
});

module.exports = ProxyRequest;

